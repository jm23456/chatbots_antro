import React, { useEffect, useRef, useState, useMemo } from "react";
import ExitWarningModal from "../components/ExitWarningModal";
import type { ChatMessage, DebateData } from "../types/types";
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams } from "react-router-dom";
import { debateConfig } from "../config/debateConfig";

interface DebateScreenProps {
  topicTitle: string;
  participantID: string | null;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
}

type Color = "red" | "yellow" | "green" | "gray" | "blue";
type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

type DebateScriptItem = {
  id: number;
  speaker: SpeakerKey | "USER";
  text: string;
  type: "bot" | "user";
  color?: Color;
  side: "pro" | "contra" | "undecided" | "user";
};

const DebateScreen: React.FC<DebateScreenProps> = ({
  topicTitle,
  participantID,
  onExit,
  hasStarted,
  onStart,
}) => {
  const { t } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [progress, setProgress] = useState(0);
  const [params] = useSearchParams();

  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  const lingFromURL = params.get("ling");

  const hasStartedRef = useRef(false);
  const visibleBubblesRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageIdRef = useRef(1000);
  const pendingMessageIdRef = useRef<number | null>(null);


  const filename = topicFromURL && lingFromURL && roleFromURL ? `${topicFromURL}_${lingFromURL}_${roleFromURL.toLowerCase()}.json` : null;

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
    return normalizeColor(roleColor) ?? {
      A: "red",
      B: "yellow",
      C: "green",
      D: "gray",
      E: "blue",
      SYSTEM: "gray",
    }[speaker];
  };

  const getRoleSide = (speaker: SpeakerKey): "pro" | "contra" | "undecided" => {
    const stance = debateData?.roles?.[speaker]?.stance;
    if (stance === "pro") return "pro";
    if (stance === "contra") return "contra";
    return "undecided";
  };

  const parsedDebate = useMemo(() => {
    if (!debateData) return { introUtterances: [] as DebateScriptItem[], scriptUtterances: [] as DebateScriptItem[] };

    const nextId = { current: 1 };
    const makeItem = (speaker: SpeakerKey | "USER", text: string, type: "bot" | "user") => ({
      id: nextId.current++,
      speaker,
      text,
      type,
      color: speaker === "USER" ? undefined : getRoleColor(speaker as SpeakerKey),
      side: speaker === "USER" ? "user" : getRoleSide(speaker as SpeakerKey),
    });

    const introUtterances: DebateScriptItem[] = [];
    const scriptUtterances: DebateScriptItem[] = [];
    const visited = new Set<string>();
    let currentNodeKey = debateData.start_node;

    while (currentNodeKey && !visited.has(currentNodeKey)) {
      visited.add(currentNodeKey);
      const node = debateData.nodes[currentNodeKey];
      if (!node) break;

      const nodeItems = node.utterances.map((utterance) => {
        const isUser = Boolean(utterance.speak_as_user);
        return makeItem(isUser ? "USER" : utterance.speaker, utterance.text, isUser ? "user" : "bot");
      });

      if (node.kind === "intro-arguments") {
        introUtterances.push(...nodeItems);
      } else if (node.kind !== "intro" && node.kind !== "summary") {
        scriptUtterances.push(...nodeItems);
      }

      if (node.transition?.type === "linear") {
        currentNodeKey = node.transition.next ?? "";
      } else if (node.transition?.type === "choice") {
        const defaultOption = node.transition.options?.find((opt) => opt.default_option) || node.transition.options?.[0];
        if (defaultOption) {
          if (defaultOption.speak_as_user) {
            scriptUtterances.push(makeItem("USER", defaultOption.label, "user"));
          }
          currentNodeKey = defaultOption.next;
        } else {
          currentNodeKey = "";
        }
      } else {
        currentNodeKey = "";
      }
    }

    return { introUtterances, scriptUtterances };
  }, [debateData]);

  const debateScript = parsedDebate.scriptUtterances;
  const argumentsIntro = parsedDebate.introUtterances;

  const argumentBubbles = useMemo(
    () => [
      ...argumentsIntro.map((msg) => ({
        color: msg.color,
        side: msg.side,
        text: msg.text,
        id: msg.id,
        speaker: msg.speaker,
        type: msg.type,
        isIntro: true,
      })),
      ...debateScript.map((msg) => ({
      color: msg.color,
      side: msg.side,
      text: msg.text,
      id: msg.id,
      speaker: msg.speaker,
      type: msg.type,
    })),
  ],[argumentsIntro, debateScript]
  );

  // const initialChatHistory = useMemo(() => {
  //   return argumentsIntro.map((msg, index) => ({
  //     id: index + 1,
  //     type: "bot" as const,
  //     color: msg.color,
  //     text: msg.text,
  //     side: msg.side,
  //     isComplete: true,
  //     isIntro: true,
  //   }));
  // }, [argumentsIntro]);

  // useEffect(() => {
  //   if (chatHistory.length === 0 && initialChatHistory.length > 0) {
  //     setChatHistory(initialChatHistory);
  //   }
  // }, [chatHistory.length, initialChatHistory]);

  const getNextMessageId = () => {
    nextMessageIdRef.current += 1;
    return nextMessageIdRef.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const advanceBubble = () => {
    if (visibleBubblesRef.current >= argumentBubbles.length) return;
    const nextBubble = argumentBubbles[visibleBubblesRef.current];
    visibleBubblesRef.current += 1;
    setVisibleBubbles(visibleBubblesRef.current);
    console.log("Kind: ", nextBubble);

    if (nextBubble.type === "user") {
      setChatHistory((prev) => [
        ...prev,
        {
          id: getNextMessageId(),
          type: "user",
          text: nextBubble.text,
          isComplete: true,
          side: nextBubble.side,
        },
      ]);
      continueProgress();
      return;
    }

    const pendingId = getNextMessageId();
    pendingMessageIdRef.current = pendingId;
    setChatHistory((prev) => [
      ...prev,
      {
        id: pendingId,
        type: "bot",
        color: nextBubble.color,
        text: "",
        side: nextBubble.side,
        isComplete: false,
        isIntro: nextBubble.isIntro,
      },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === pendingId ? { ...msg, text: nextBubble.text, isComplete: true } : msg
        )
      );
      pendingMessageIdRef.current = null;
      continueProgress();
      setIsTyping(false);
    }, 2000);
  };

  const continueProgress = () => {
    setProgress((prev) => Math.min(prev + (100 / Math.max(argumentBubbles.length, 1)), 100));
  };

  const finishProgress = () => {
    setProgress(100);
    setTimeout(() => setProgress(0), 300);
  };

  useEffect(() => {
    if (!hasStarted) return;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      advanceBubble();
    }
  }, [hasStarted]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleContinue = () => {
    if (!hasStarted) {
      onStart();
      return;
    }
    if (visibleBubblesRef.current < argumentBubbles.length) {
      advanceBubble();
    } else {
      setShowDebateFinished(true);
      finishProgress();
      onExit();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!isTyping) {
          handleContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, hasStarted]);

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
            <span className="argument-label">{t("noDebateFound") ?? "Debate not found."}</span>
          </div>
        </section>
      ) : (
        <section className="debate-arguments">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}>
              {msg.isIntro && <span className="intro-label">Intro</span>}
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
        </section>
      )}

      {!hasStarted && debateData && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>{t("ready")}</p>
            </div>
            <div style={{ padding: "0rem 0.5rem 1rem 0.5rem" }}>
              <p className="modal-text" style={{ fontSize: "16px", marginBottom: "10px", color: "#050505" }}>🗣 The chatbots will discuss the topic now</p>
              <button className="start-debate-btn" onClick={onStart}>{t("startDebate")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-end-row" style={{ marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        {hasStarted && debateData && (
          <div className="action-row">
            <button className="con-primary-btn" onClick={handleContinue} disabled={isTyping}>{isTyping || visibleBubblesRef.current < argumentBubbles.length ? t("continue") : t("finishDebate")}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateScreen;
