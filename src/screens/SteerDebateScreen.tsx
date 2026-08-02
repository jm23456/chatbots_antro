import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExitWarningModal from "../components/ExitWarningModal";
import type { ChatMessage } from "../types/types";
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams } from "react-router-dom";

type Color = "red" | "yellow" | "green" | "grey" | "blue" | string;
type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

type DebateUtterance = {
  uid: string;
  speaker: SpeakerKey;
  text: string;
  speak_as_user?: boolean;
};

type DebateTransitionOption = {
  option_id: string;
  label: string;
  speak_as_user?: boolean;
  next: string;
  default_option?: boolean;
};

type DebateTransition =
  | { type: "linear"; next?: string }
  | { type: "choice"; prompt?: string; timeout_seconds?: number | null; options?: DebateTransitionOption[] }
  | { type: "end" };

type DebateNode = {
  round?: number;
  kind: string;
  topic?: string;
  utterances: DebateUtterance[];
  transition: DebateTransition;
};

type RoleData = {
  label?: string;
  description?: string;
  stance?: "pro" | "contra" | "undecided";
  orientation?: string;
  display?: { color?: string; avatar?: string };
};

type DebateData = {
  schema_version?: string;
  debate_id?: string;
  title?: string;
  source?: string;
  language?: string;
  condition?: {
    linguistic_style?: string;
    interaction_level?: string;
  };
  roles?: Record<string, RoleData>;
  start_node: string;
  nodes: Record<string, DebateNode>;
};

interface SteerDebateScreenProps {
  topicTitle: string;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
  userIntroMessage?: string | null;
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
  D: "grey",
  E: "blue",
  SYSTEM: "grey",
};

const SteerDebateScreen: React.FC<SteerDebateScreenProps> = ({
  topicTitle,
  onExit,
  hasStarted,
  onStart,
}) => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  const lingFromURL = params.get("ling");

  const filename = topicFromURL && lingFromURL && roleFromURL ? `${topicFromURL}_${lingFromURL}_${roleFromURL.toLowerCase()}.json` : null;

  const debateFiles = import.meta.glob('../debate_text/*.json', { eager: true, import: 'default' }) as Record<string, DebateData>;
  const debateData = useMemo<DebateData | undefined>(() => {
    if (!filename) return undefined;
    const key = Object.keys(debateFiles).find((k) => k.endsWith(`/${filename}`) || k.endsWith(filename));
    return key ? debateFiles[key] : undefined;
  }, [filename, debateFiles]);

  const displayTopicTitle = debateData?.title || topicTitle || topicFromURL || t("healthInsurance");

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);
  const [currentNodeKey, setCurrentNodeKey] = useState<string | null>(null);
  const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);
  const [pendingChoice, setPendingChoice] = useState<DebateTransitionOption[] | null>(null);
  const [choicePrompt, setChoicePrompt] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasNodeStarted, setHasNodeStarted] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageIdRef = useRef(1000);

  const totalUtterances = useMemo(() => {
    if (!debateData) return 0;
    return Object.values(debateData.nodes).reduce((sum, node) => sum + (node.utterances?.length ?? 0), 0);
  }, [debateData]);

  const getNextMessageId = useCallback(() => {
    nextMessageIdRef.current += 1;
    return nextMessageIdRef.current;
  }, []);

  const getRoleColor = useCallback((speaker: SpeakerKey): Color => {
    return debateData?.roles?.[speaker]?.display?.color ?? speakerColorFallback[speaker];
  }, [debateData]);

  const getRoleSide = useCallback((speaker: SpeakerKey): "pro" | "contra" | "undecided" => {
    const stance = debateData?.roles?.[speaker]?.stance;
    if (stance === "pro") return "pro";
    if (stance === "contra") return "contra";
    return "undecided";
  }, [debateData]);

  const noDebateFound = Boolean(filename && !debateData);

  const finishDebate = useCallback(() => {
    setCurrentNodeKey(null);
    setCurrentUtteranceIndex(0);
    setPendingChoice(null);
    setChoicePrompt(null);
    setShowDebateFinished(true);
    setProgress(100);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const findFirstDebateNode = useCallback((startKey: string | null): string | null => {
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
  }, [debateData]);

  const addBotMessage = useCallback((utterance: DebateUtterance, isIntro: boolean) => {
    const pendingId = getNextMessageId();
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
      setIsTyping(false);
      setProgress((prev) => Math.min(prev + 100 / Math.max(totalUtterances, 1), 100));
    }, 650);
  }, [getNextMessageId, getRoleColor, getRoleSide, totalUtterances]);

  const addUserMessage = useCallback((text: string) => {
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
    setProgress((prev) => Math.min(prev + 100 / Math.max(totalUtterances, 1), 100));
  }, [getNextMessageId, totalUtterances]);

  const advanceConversation = useCallback(() => {
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

    const isIntroNode = node.kind.startsWith("intro");

    if (currentUtteranceIndex < node.utterances.length) {
      const utterance = node.utterances[currentUtteranceIndex];
      setCurrentUtteranceIndex((prev) => prev + 1);
      setHasNodeStarted(true);

      if (utterance.speak_as_user) {
        addUserMessage(utterance.text);
      } else {
        addBotMessage(utterance, isIntroNode);
      }
      return;
    }

    if (node.transition.type === "linear") {
      if (node.transition.next === "summary") {
        finishDebate();
        return;
      }
      setCurrentNodeKey(node.transition.next ?? null);
      setCurrentUtteranceIndex(0);
      setChoicePrompt(null);
      setPendingChoice(null);
      setHasNodeStarted(false);
      return;
    }

    if (node.transition.type === "choice") {
      setPendingChoice(node.transition.options ?? []);
      setChoicePrompt(node.transition.prompt ?? "Wähle eine Option:");
      setHasNodeStarted(false);
      return;
    }

    finishDebate();
  }, [addBotMessage, addUserMessage, currentNodeKey, currentUtteranceIndex, debateData, finishDebate, isTyping, pendingChoice]);

  const handleSelectChoice = useCallback((option: DebateTransitionOption) => {
    setPendingChoice(null);
    setChoicePrompt(null);
    addUserMessage(option.label);
    setCurrentNodeKey(option.next || null);
    setCurrentUtteranceIndex(0);
    setHasNodeStarted(false);
  }, [addUserMessage]);

  const handleContinue = () => {
    if (!hasStarted) {
      onStart();
      return;
    }
    if (!debateData) return;
    if (isTyping || pendingChoice) return;
    advanceConversation();
  };

  useEffect(() => {
    if (!hasStarted || !debateData) return;
    setChatHistory([]);
    setIsTyping(false);
    setShowDebateFinished(false);
    setPendingChoice(null);
    setChoicePrompt(null);
    setProgress(0);
    setCurrentUtteranceIndex(0);
    setHasNodeStarted(false);
    setCurrentNodeKey(findFirstDebateNode(debateData.start_node));
  }, [hasStarted, debateData, findFirstDebateNode]);

  useEffect(() => {
    if (!hasStarted || !debateData || isTyping || pendingChoice) return;
    if (!currentNodeKey) return;
    if (hasNodeStarted) return;
    if (currentUtteranceIndex !== 0) return;
    advanceConversation();
  }, [advanceConversation, currentNodeKey, currentUtteranceIndex, debateData, hasNodeStarted, hasStarted, isTyping, pendingChoice]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chatHistory, scrollToBottom]);

  useEffect(() => {
    if (!debateData) return;
    scrollToBottom();
  }, [chatHistory, scrollToBottom, debateData]);

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
  }, [advanceConversation, isTyping, pendingChoice]);

  const handleExitClick = () => setShowExitWarning(true);
  const handleExitConfirm = () => {
    setShowExitWarning(false);
    onExit();
  };
  const handleExitCancel = () => setShowExitWarning(false);

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
              <button className="start-debate-btn" onClick={() => { setShowDebateFinished(false); onExit(); }}>
                {t("continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="top-exit-row" style={{ marginBottom: "0px" }}>
        <div style={{ width: "180px", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#7c3aed", transition: "width 150ms linear" }} />
        </div>
        <div>{Math.round(progress)}%</div>
        <div className="top-buttons-row">
          <button className="exit-btn" style={{ marginLeft: "605px" }} onClick={handleExitClick}>{t("exit")}</button>
        </div>
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
            <div key={msg.id} className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}>
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
              <div style={{ display: "flex", flexDirection: "row", gap: "8px", width: "100%", maxWidth: "520px" }}>
                {pendingChoice.map((option) => (
                  <button key={option.option_id} className="con-primary-btn" style={{ width: "100%", background: "#ffffff", color: "#5b21b6", border: "1px solid #8b5cf6", boxShadow: "0 2px 8px rgba(139, 92, 246, 0.18)" }} onClick={() => handleSelectChoice(option)}>
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
              <button className="start-debate-btn" onClick={() => { onStart(); handleContinue(); }}>{t("startDebate")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-end-row" style={{ marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        <button className="con-primary-btn" onClick={handleContinue} disabled={isTyping || !!pendingChoice || noDebateFound}>
          {hasStarted ? (pendingChoice ? t("continue") : t("continue")) : t("continue")}
        </button>
      </div>
    </div>
  );
};

export default SteerDebateScreen;
