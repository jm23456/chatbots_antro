import React, { useEffect, useMemo, useRef, useState } from "react";
import ExitWarningModal from "../components/ExitWarningModal";
import type { ChatMessage, DebateData, DebateTransitionOption, DebateUtterance, SpeakerKey } from "../types/types";
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams } from "react-router-dom";
import { debateConfig } from "../config/debateConfig";
import { logEvent } from "../../logs/logs";

type Color = "red" | "yellow" | "green" | "grey" | "blue" ;

interface PartyDebateScreenProps {
  topicTitle: string;
  participantID: string | null;
  onExit: () => void;
  hasStarted: boolean;
  isIntro?: boolean;
  onStart: () => void;
}

const normalizeTopic = (topic: string | null) => {
  if (!topic) return null;
  const cleaned = topic.trim().toLowerCase();
  if (/^debate\d+/.test(cleaned)) return cleaned;
  if (/^\d+$/.test(cleaned)) return `debate${cleaned}`;
  return cleaned;
};

const normalizeLing = (ling: string | null) => {
  if (!ling) return null;
  const cleaned = ling.trim().toLowerCase().replace(/_/g, "");
  if (cleaned === "firstperson") return "firstperson";
  if (cleaned === "general") return "general";
  return cleaned;
};

const normalizeRole = (role: string | null) => {
  if (!role) return null;
  const cleaned = role.trim().toLowerCase();
  if (cleaned === "watch") return "watch";
  if (cleaned === "steer") return "steer";
  if (cleaned === "party") return "party";
  return cleaned;
};

const speakerColorFallback: Record<SpeakerKey, Color> = {
  A: "red",
  B: "yellow",
  C: "green",
  D: "gray",
  E: "blue",
  SYSTEM: "gray",
};

const PartyDebateScreen: React.FC<PartyDebateScreenProps> = ({
  topicTitle,
  participantID,
  onExit,
  hasStarted,
  isIntro,
  onStart,
}) => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  const lingFromURL = params.get("ling");

  const normalizedTopic = normalizeTopic(topicFromURL);
  const normalizedLing = normalizeLing(lingFromURL);
  const normalizedRole = normalizeRole(roleFromURL);
  const filename = normalizedTopic && normalizedLing && normalizedRole ? `${normalizedTopic}_${normalizedLing}_${normalizedRole}.json` : null;

  const debateFiles = import.meta.glob('../debate_text/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
  const debateData = useMemo<DebateData | undefined>(() => {
    if (!filename) return undefined;
    const key = Object.keys(debateFiles).find((k) => k.endsWith(`/${filename}`) || k.endsWith(filename));
    return key ? (debateFiles[key] as DebateData) : undefined;
  }, [filename]);

  const displayTopicTitle = debateData?.title || topicTitle || topicFromURL || t("healthInsurance");

  const normalizeColor = (color?: string): Color | undefined => {
    if (!color) return undefined;
    const normalized = color.toLowerCase();
    if (normalized === "grey" || normalized === "gray") return "gray";
    if (normalized === "red" || normalized === "yellow" || normalized === "green" || normalized === "blue") return normalized as Color;
    return undefined;
  };

  const getRoleColor = (speaker: SpeakerKey) => {
    const roleColor = debateData?.roles?.[speaker]?.display?.color;
    return normalizeColor(roleColor) ?? speakerColorFallback[speaker];
  };

  const getRoleSide = (speaker: SpeakerKey): "pro" | "contra" | "undecided" => {
    const stance = debateData?.roles?.[speaker]?.stance;
    if (stance === "pro") return "pro";
    if (stance === "contra") return "contra";
    return "undecided";
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentNodeKey, setCurrentNodeKey] = useState<string | null>(null);
  const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);
  const [pendingChoice, setPendingChoice] = useState<DebateTransitionOption[] | null>(null);
  const [choicePrompt, setChoicePrompt] = useState<string | null>(null);
  const [hasNodeStarted, setHasNodeStarted] = useState(false);

  const hasStartedRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageIdRef = useRef(1000);
  const pendingMessageIdRef = useRef<number | null>(null);
  const completedStepsRef = useRef(0);

  const node = currentNodeKey ? debateData?.nodes[currentNodeKey] : null;
  const isLastMessage = Boolean(
    node &&
    !isTyping &&
    !pendingChoice &&
    node.transition.type === "linear" &&
    node.transition.next === "summary" &&
    currentUtteranceIndex >= (node.utterances?.length ?? 0)
  );

  const countVisibleProgressSteps = (startKey: string | null): number => {
    if (!startKey || !debateData) return 0;
    const visited = new Set<string>();
    let currentKey: string | null = startKey;
    let steps = 0;

    while (currentKey && !visited.has(currentKey)) {
      visited.add(currentKey);
      const node = debateData.nodes[currentKey];
      if (!node) break;
      if (node.kind === "summary") break;
      if (node.kind === "intro") {
        if (node.transition.type === "linear") {
          currentKey = node.transition.next ?? null;
          continue;
        }
        break;
      }

      steps += node.utterances?.length ?? 0;
      if (node.transition.type === "choice") {
        steps += 1;
      }

      if (node.transition.type === "linear") {
        currentKey = node.transition.next ?? null;
      } else if (node.transition.type === "choice") {
        const defaultOption = node.transition.options?.find((opt) => opt.default_option) || node.transition.options?.[0];
        currentKey = defaultOption?.next ?? null;
      } else {
        break;
      }
    }

    return steps;
  };

  const totalStepsFromStart = useMemo(() => {
    return countVisibleProgressSteps(debateData?.start_node ?? null);
  }, [debateData]);

  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    return Math.min(100, Math.round((completedSteps / totalSteps) * 100));
  }, [completedSteps, totalSteps]);

  const getNextMessageId = () => {
    nextMessageIdRef.current += 1;
    return nextMessageIdRef.current;
  };

  const incrementStep = () => {
    setCompletedSteps((prev) => {
      const next = Math.min(prev + 1, totalSteps);
      completedStepsRef.current = next;
      return next;
    });
  };

  const findFirstDebateNode = (startKey: string | null): string | null => {
    if (!startKey || !debateData) return null;
    const visited = new Set<string>();
    let currentKey = startKey;

    while (currentKey && !visited.has(currentKey)) {
      visited.add(currentKey);
      const node = debateData.nodes[currentKey];
      if (!node) return null;
      if (node.kind !== "intro") {
        return currentKey;
      }
      if (node.transition.type === "linear" && node.transition.next) {
        currentKey = node.transition.next;
        continue;
      }
      return null;
    }

    return currentKey;
  };

  const finishProgress = () => {
    setCompletedSteps(totalSteps);
    setTimeout(() => setCompletedSteps(0), 300);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (utterance: DebateUtterance, isIntro: boolean) => {
    const pendingId = getNextMessageId();
    pendingMessageIdRef.current = pendingId;
    setChatHistory((prev) => [
      ...prev,
      {
        id: pendingId,
        type: "bot",
        color: getRoleColor(utterance.speaker),
        text: "",
        side: getRoleSide(utterance.speaker),
        isComplete: false,
        isIntro,
      },
    ]);
    setIsTyping(true);

    window.setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? { ...msg, text: utterance.text, isComplete: true }
            : msg
        )
      );
      pendingMessageIdRef.current = null;
      setIsTyping(false);
      incrementStep();
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: getNextMessageId(),
        type: "user",
        text,
        side: "user",
        isComplete: true,
      },
    ]);
    incrementStep();
  };

  const showNextNode = (nodeKey: string | null) => {
    setCurrentNodeKey(nodeKey);
    setCurrentUtteranceIndex(0);
    setPendingChoice(null);
    setChoicePrompt(null);
    setHasNodeStarted(false);
  };

  const finishDebate = () => {
    setCurrentNodeKey(null);
    setCurrentUtteranceIndex(0);
    setPendingChoice(null);
    setChoicePrompt(null);
    setHasNodeStarted(false);
    setShowDebateFinished(true);
    finishProgress();
  };

  const advanceConversation = () => {
    if (!debateData) return;
    if (isTyping) return;
    if (pendingChoice) return;
    if (!currentNodeKey) {
      finishDebate();
      return;
    }

    const node = debateData.nodes[currentNodeKey];
    if (!node) {
      finishDebate();
      return;
    }

    const isIntroNode = node.kind === "intro" || node.kind.startsWith("intro");
    const utterances = node.utterances ?? [];

    if (currentUtteranceIndex < utterances.length) {
      const utterance = utterances[currentUtteranceIndex];
      setCurrentUtteranceIndex((prev) => prev + 1);
      setHasNodeStarted(true);
      if (utterance.speak_as_user) {
        addUserMessage(utterance.text);
      } else {
        addBotMessage(utterance, isIntroNode);
      }
      return;
    }

    if (node.transition?.type === "choice") {
      const options = node.transition.options ?? [];
      setChoicePrompt(node.transition.prompt ?? "Wähle eine Option:");
      setPendingChoice(options);
      setHasNodeStarted(false);
      return;
    }

    if (node.transition?.type === "linear") {
      if (node.transition.next === "summary") {
        finishDebate();
        return;
      }
      showNextNode(node.transition.next ?? null);
      return;
    }

    finishDebate();
  };

  const handleChoiceSelect = (option: DebateTransitionOption) => {
    if (option.speak_as_user) {
      addUserMessage(option.label);
      logEvent("Choice_made", participantID, { choice: option.label, timestamp: new Date().toLocaleTimeString() });
    } else {
      incrementStep();
    }
    showNextNode(option.next);
  };

  useEffect(() => {
    console.log("IsIntro", isIntro);
    if (!hasStarted || !debateData) return;
    hasStartedRef.current = true;
    setChatHistory([]);
    setCompletedSteps(0);
    completedStepsRef.current = 0;
    setTotalSteps(totalStepsFromStart);
    setIsTyping(false);
    setShowDebateFinished(false);
    setPendingChoice(null);
    setChoicePrompt(null);
    setCurrentUtteranceIndex(0);
    setHasNodeStarted(false);
    setCurrentNodeKey(findFirstDebateNode(debateData.start_node));
  }, [hasStarted, debateData, totalStepsFromStart]);

  useEffect(() => {
    if (!hasStarted || !debateData || isTyping || pendingChoice) return;
    if (!currentNodeKey) return;
    if (hasNodeStarted) return;
    if (currentUtteranceIndex !== 0) return;
    advanceConversation();
  }, [advanceConversation, currentNodeKey, currentUtteranceIndex, debateData, hasNodeStarted, hasStarted, isTyping, pendingChoice]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chatHistory, pendingChoice]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!isTyping && !pendingChoice) {
          advanceConversation();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, pendingChoice]);

  const handleContinue = () => {
    if (!hasStarted) {
      onStart();
      return;
    }
    if (!debateData) return;
    if (isTyping || pendingChoice) return;
    advanceConversation();
  };

  const handleExitClick = () => setShowExitWarning(true);
  const handleExitConfirm = () => {
    setShowExitWarning(false);
    onExit();
  };
  const handleExitCancel = () => setShowExitWarning(false);

  const noDebateFound = Boolean(filename && !debateData);

  return (
    <div className="screen active-debate-screen">
      <ExitWarningModal isOpen={showExitWarning} onConfirm={handleExitConfirm} onCancel={handleExitCancel} />
      {showDebateFinished && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>{t("debateFinishedTitle")}</p>
            </div>
            <div style={{ padding: "0rem 0.5rem 1.5rem 0.5rem" }}>
              <p style={{ fontSize: "16px" }}>{t("debateFinishedText")}</p>
              <button className="start-debate-btn" onClick={() => { setShowDebateFinished(false); onExit(); }}>{t("continue")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="top-exit-row" style={{ marginBottom: "0px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "auto" }}>
          <div style={{ width: "180px", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#7c3aed", transition: "width 150ms linear" }} />
          </div>
          <div>{Math.round(progress)}%</div>
        </div>
        {debateConfig.showExitButton && (
          <div className="top-buttons-row">
            <button className="exit-btn" style={{ marginLeft: "605px" }} onClick={handleExitClick}>{t("exit")}</button>
          </div>
        )}
      </div>

      <header className="screen-header" style={{ marginBottom: "10px", marginTop: "0px" }}>
        <p className="subtitle" style={{ marginTop: "0px" }}>{displayTopicTitle}</p>
      </header>

      {noDebateFound ? (
        <section className="debate-arguments">
          <div className="argument-box argument-gray">
            <span className="argument-label">{t("noDebateFound") ?? "Debatte nicht gefunden. Überprüfe die URL."}</span>
          </div>
        </section>
      ) : (
        <section className="debate-arguments" ref={messagesContainerRef}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`argument-box ${msg.color ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}>
              {msg.isIntro && <span className="intro-label">{msg.type === "user" ? "Du" : "Intro"}</span>}
              <span className={msg.type === "bot" ? "argument-label" : "argument-text"}>
                {msg.type === "bot" && !msg.isComplete ? (
                  <span className="typing-dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></span>
                ) : (
                  msg.text
                )}
              </span>
              {msg.type === "bot" && msg.isComplete && (
                <button className="report-btn" title={t("flag")} onClick={() => alert(`Nachricht gemeldet`)}>⚠️</button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />

          {pendingChoice && (
            <div style={{ marginTop: "12px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{choicePrompt || "Wähle eine Option:"}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "810px" }}>
                {pendingChoice.map((option) => (
                  <button key={option.option_id} className="con-primary-btn" style={{ padding: 20, maxWidth: "none", width: "600px", background: "#ffffff", color: "#5b21b6", border: "1px solid #8b5cf6", boxShadow: "0 2px 8px rgba(139, 92, 246, 0.18)"}} onClick={() => handleChoiceSelect(option)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!hasStarted && debateData && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>{t("ready")}</p>
            </div>
            <div style={{ padding: "0rem 0.5rem 1rem 0.5rem" }}>
              <p className="modal-text" style={{ fontSize: "16px", marginBottom: "10px", color: "#050505" }}>🗣 The chatbots will discuss the topic now.</p>
              <button className="start-debate-btn" onClick={onStart}>{t("startDebate")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-end-row" style={{ marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        <button className="con-primary-btn" onClick={handleContinue} disabled={isTyping || !!pendingChoice || noDebateFound}>
          {hasStarted && isLastMessage ? t("finishDebate") : t("continue")}
        </button>
      </div>
    </div>
  );
};

export default PartyDebateScreen;
