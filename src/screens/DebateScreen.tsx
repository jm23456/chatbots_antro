import React, { useEffect, useRef, useState, useMemo } from "react";
import ExitWarningModal from "../components/ExitWarningModal";
import type { Role, DebateMessage, ChatMessage } from "../types/types";
import "../App.css";
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';
import mockDebateDE from '../debate_text/mockDebate.de.json';
import mockDebateEN from '../debate_text/mockDebate.en.json';

interface DebateScreenProps {
  topicTitle: string;
  // messages: DebateMessage[];
  timeLeft: string;
  // inputText: string;
  // setInputText: (value: string) => void;
  // onSend: () => void;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
  // setIsPaused: (value: boolean) => void;
}

const DebateScreen: React.FC<DebateScreenProps> = ({
  topicTitle,
  timeLeft,
  inputText,
  setInputText,
  onSend,
  onExit,
  hasStarted,
  onStart,
  setIsPaused
}) => {
  type Color = "red" | "yellow" | "green" | "gray" | "blue";
  const { t, language } = useLanguage();
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  // const [currentTypingText, setCurrentTypingText] = useState<string | undefined>(undefined);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const hasStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const typingIntervalRef = useRef<number | null>(null);
  const currentBubbleRef = useRef<{ text: string; color: Color; side: "pro" | "contra" | "undecided" } | null>(null);
  const pendingMessageIdRef = useRef<number | null>(null);
  // const isPausedRef = useRef(false);
  // const pausedWordCountRef = useRef(0);
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);

  type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

  // Typewriter-Geschwindigkeit pro Speaker (ms pro Wort)
  // Höherer Wert = langsamer
  // const TYPEWRITER_SPEED: Record<string, number> = {
  //   A: 450,   // Rot - langsamer
  //   B: 380,   // Gelb - normal
  //   C: 380,   // Grün - normal
  //   D: 380,   // Grau - normal
  //   E: 380,   // Blau - normal
  // };

  type DebateScriptItem = {
    id: number;
    speaker: SpeakerKey;
    text: string;
  }

  type RoleData = {
    label?: string;
    description?: string;
    orientation?: "pro" | "contra" | "undecided";
  }

  type DebateData = {
    debate_script?: DebateScriptItem[];
    "Arguments Intro"?: DebateScriptItem[];
    roles?: Record<string, RoleData>;
  }

  // Timer abgelaufen Check
  useEffect(() => {
    if (timeLeft === "0:00" && hasStarted && !showTimeExpired) {
      setShowTimeExpired(true);
    }
  }, [timeLeft, hasStarted, showTimeExpired]);

  // Exit handlers
  const handleExitClick = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    setShowExitWarning(false);
    onExit();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);;
  };

  // Auto-scroll zur neuesten Nachricht
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mock-Debatte: Krankenkassenprämien

  const debateData = (language === 'de' ? mockDebateDE : mockDebateEN) as DebateData;

  const speakerColors: Record<string, Color> = {
    A: "red",
    B: "yellow",
    C: "green",
    D: "gray",
    E: "blue",
  };

  const speakerToSide: Record < string, "pro" | "contra" | "undecided"> = {
    A: "contra",
    B: "pro",
    C: "contra",
    D: "pro",
    E: "undecided",
  };

  // Map the candidate color to the mockDebate role key so we can show language-specific descriptions
  const roleByColor: Record<Color, SpeakerKey> = {
    yellow: "B",
    gray: "D",
    blue: "E",
    red: "A",
    green: "C",
  };

  // const getRoleDescription = (color: Color) =>
  //   debateData.roles?.[roleByColor[color]]?.description ?? "";

  const debateScript = debateData.debate_script ?? [];
  const argumentsIntro = debateData["Arguments Intro"] ?? [];

  const argumentBubbles = useMemo(() => {
    return debateScript.map((msg) => ({
    color: speakerColors[msg.speaker as keyof typeof speakerColors],
    side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
    text: msg.text,
    id: msg.id,
    speaker: msg.speaker,
  }));
}, [debateScript,speakerColors, speakerToSide]);

  // Check ob alle Argumente gesagt wurden
  useEffect(() => {
    if (
      hasStarted &&
      visibleBubbles >= argumentBubbles.length &&
      argumentBubbles.length > 0 &&
      // !isTyping &&
      // currentTypingText === undefined &&
      !showDebateFinished &&
      !showTimeExpired
    ) {
      setShowDebateFinished(true);
    }
  }, [visibleBubbles, argumentBubbles.length, hasStarted, showDebateFinished, showTimeExpired]);

  // Initiale Chat-History mit Arguments Intro Nachrichten
  // Reihenfolge: B, D, C, A, E (yellow, gray, blue, red, green)
  const speakerOrder: SpeakerKey[] = ["B", "D", "E", "A", "C"];
  const initialChatHistory: ChatMessage[] = useMemo(() => {
    const sortedIntro = [...argumentsIntro].sort((a, b) => {
      const indexA = speakerOrder.indexOf(a.speaker as SpeakerKey);
      const indexB = speakerOrder.indexOf(b.speaker as SpeakerKey);
      return indexA - indexB;
    });
    return sortedIntro.map((msg, index) => ({
      id: index + 1,
      type: "bot" as const,
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      text: msg.text,
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      isComplete: true,
      isIntro: true
    }));
  }, [argumentsIntro]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Setze initiale chatHistory wenn noch leer
  useEffect(() => {
    if (chatHistory.length === 0 && initialChatHistory.length > 0) {
      setChatHistory(initialChatHistory);
    }
  }, [initialChatHistory, chatHistory.length]);

  // Typewriter-Effekt: Text Wort für Wort in der Chatbot-Bubble aufbauen
  const typewriterEffect = (text: string, color: Color, side: "pro" | "contra" | "undecided") => {
       currentBubbleRef.current = { text, color, side };
        const pendingId = Date.now() ;
        pendingMessageIdRef.current = pendingId;
        setChatHistory(prev => [...prev, {
          id: pendingId,
          type: "bot",
          color,
          text: "",
          side,
          isComplete: false
        }] as ChatMessage[]);
      
      const finalizePendingMessage = () => {
        setChatHistory(prev => prev.map(m => m.id === pendingMessageIdRef.current ? { ...m, text, isComplete: true } : m));
        pendingMessageIdRef.current = null;
        setVisibleBubbles(prev => prev + 1);
        setIsTyping(false);
        currentBubbleRef.current = null;
      };


      setIsTyping(true);

      setTimeout(() => {
        finalizePendingMessage();
      }, 2000); // Simuliere 2 Sekunden "Tippen"
    };

    const startNextBubble = () => {
    if (visibleBubbles >= argumentBubbles.length) return;
    const nextBubble = argumentBubbles[visibleBubbles];
    hasStartedRef.current = true;
    typewriterEffect(nextBubble.text, nextBubble.color, nextBubble.side);
  };
      useEffect(() => {
        if (!hasStarted) return;
        if (!hasStartedRef.current) {
          startNextBubble();
        }
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // Auto-scroll wenn sich chatHistory oder isTyping ändert
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

    const handleContinue = () => {
    if (!hasStarted) {
      onStart();
      return;
    }
    // const isBusy = isTyping || currentTypingText !== undefined;

    if (visibleBubbles < argumentBubbles.length) {
      startNextBubble();
    } else {
      onExit();
    }
  }


  const handleTimeExpiredContinue = () => {
  currentBubbleRef.current = null;
  onExit();
  }

  return (
    
    <div className="screen debate-screen">
      <LanguageToggle />
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      {/* Timer abgelaufen Popup */}
      {showTimeExpired && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal"style={{padding: 0, overflow: "hidden"}}>
            <div style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
              borderRadius: "1.5rem 1.5rem 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
            <div className="modal-icon">⏱️</div>
            <span style={{fontSize: "16px", fontWeight: "600", color: "#dc2626"}}>{t("timeExpired")}</span>
            </div>
            <div style={{padding: "0rem 1rem 1.5rem 1rem"}}>
              <div className="time-bar">
              <div className="time-bar-fill"></div>
              </div>
            <p style={{fontSize: "18px"}}>{t("timeExpiredFinish")}</p>
            <button className="start-debate-btn" onClick={() => {setShowTimeExpired(false); handleTimeExpiredContinue();}}>
              {t("continue")}
            </button>
          </div>
        </div>
        </div>
      )}
    
      {/* Debatte beendet Popup */}
      {showDebateFinished && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{padding: 0, overflow: "hidden"}}>
             <div style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
              padding: "1.25rem 1.5rem",
              borderRadius: "1.5rem 1.5rem 0 0",
              marginBottom: "0.5rem"
            }}>
            <p style={{fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6"}}>{t("debateFinishedTitle")}</p>
            </div>
            <div style={{padding: "0rem 0.5rem 1.5rem 0.5rem"}}>
            <p style={{fontSize: "16px"}}>{t("debateFinishedText")}</p>
            <button className="start-debate-btn" onClick={() => {setShowDebateFinished(false); onExit();}}>
              {t("continue")}
            </button>
          </div>
        </div>
        </div>
      )}
      <div className="top-exit-row" style={{marginBottom: "0px"}}>
        <span className="timer-display">{timeLeft}</span>
        <div className="top-buttons-row">
          <button className="exit-btn" onClick={handleExitClick}>
            {t("exit")}
          </button>
        </div>
      </div>

      <header className="screen-header" style={{marginBottom: "10px", marginTop: "0px"}}>
        <p className="subtitle" style={{marginTop: "0px"}}>{t("healthInsurance")}</p>
      </header>

      {/* Chat-History - chronologisch */}
      <section className="debate-arguments">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}
          >
            {msg.isIntro && <span className="intro-label">Intro</span>}
            <span className={msg.type === "bot" ? "argument-label" : "argument-text"}>
                {msg.type === "bot" && !msg.isComplete ? (
                  <span className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
              ) : (
                msg.text
              )}
            </span>
            {msg.type === "bot" && msg.isComplete && (
              <button 
                className="report-btn" 
                title={t("flag")}
                onClick={() => alert(`Nachricht gemeldet`)}
              >
                ⚠️
              </button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </section>

      {/* Modal Overlay für Start Debate */}
      {!hasStarted && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{padding: 0, overflow: "hidden"}}>
            <div style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
              padding: "1.25rem 1.5rem",
              borderRadius: "1.5rem 1.5rem 0 0",
              marginBottom: "0.5rem"
            }}>
            <p style={{fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6"}}>{t("readyText1")}</p>
            </div>
            <div style={{padding: "0rem 0.5rem 1rem 0.5rem"}}>
            <h2 className="modal-title" style={{fontSize: "22px", marginTop: "5px"}}>{t("ready")}</h2>
            <p className="modal-text" style={{fontSize: "16px", marginBottom: "2px"}}>{t("readyText")}</p>
            <p className="modal-text" style={{fontSize: "16px", marginTop: "0px"}}>{t("readyText4")}</p>
            <button className="start-debate-btn" onClick={onStart}>
              {t("startDebate")}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Input area */}
      <footer className="debate-input-footer">
        {hasStarted && (
          <div className="action-row">
            <button 
              className="con-primary-btn" 
              onClick={handleContinue}
              disabled={isTyping}
            >
              {visibleBubbles < argumentBubbles.length ? t("continue") : t("finishDebate")}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};


export default DebateScreen;