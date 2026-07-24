import React, { useEffect, useRef, useState, useMemo } from "react";
import ExitWarningModal from "../components/ExitWarningModal";
import type { ChatMessage } from "../types/types";
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import steerDebateEN from '../debate_text/steerDebate.en.json';

type Color = "red" | "yellow" | "green" | "gray" | "blue";

type BubbleRef = {
  text: string;
  color: Color;
  side: "pro" | "contra" | "undecided";
} | null;

// "Steering the Conversation" - Role
interface SteerDebateScreenProps {
  topicTitle: string;
  timeLeft: string;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
  userIntroMessage?: string | null;
}

const SteerDebateScreen: React.FC<SteerDebateScreenProps> = ({
  topicTitle,
  timeLeft,
  onExit,
  hasStarted,
  onStart,
  userIntroMessage,
}) => {
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const currentBubbleRef = useRef<BubbleRef>(null);
  const pendingMessageIdRef = useRef<number | null>(null);
  const visibleBubblesRef = useRef(0);
  const { t, language } = useLanguage();
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);
  const [pendingSteerEntry, setPendingSteerEntry] = useState<SteerOptionEntry | null>(null);
  const nextMessageIdRef = useRef(1000);

  type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";


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

  type SteerOptionEntry = {
    id: number;
    speaker: SpeakerKey;
    option1: string;
    option2: string;
    option3: string;
  }

  type DebateData = {
    debate_script?: DebateScriptItem[];
    "Arguments Intro"?: DebateScriptItem[];
    roles?: Record<string, RoleData>;
    Steer?: SteerOptionEntry[];
  }

  // Exit handlers
  const handleExitClick = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    setShowExitWarning(false);
    onExit();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Steer-Debatte

  const debateData = useMemo(() => (steerDebateEN) as DebateData, [language]);

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
  const debateScript = debateData.debate_script ?? [];
  const argumentsIntro = debateData["Arguments Intro"] ?? [];
  const steerEntries = debateData.Steer ?? [];

    const argumentBubbles = useMemo(() => {
      return debateScript
        .filter((msg) => msg.speaker !== "E") // Filtere Speaker E (blau) heraus
        .map((msg) => ({
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      text: msg.text,
      id: msg.id,
      speaker: msg.speaker,
    }));
  }, [debateScript, speakerColors, speakerToSide]);

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const continueProgress = () => {
  setProgress((prev) => Math.min(prev + 100/debateScript.length || 1, 100)); // Simuliere langsames Fortschreiten gegen Ende

  }
    const finishProgress = () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      setProgress(100);

      setTimeout(() => {
        setProgress(0);
      }, 300); // Kurze Verzögerung, um den Fortschrittsbalken auf 100% anzuzeigen
    }

   // Check ob alle Argumente gesagt wurden
    useEffect(() => {
      if (
        hasStarted &&
        visibleBubbles >= argumentBubbles.length &&
        argumentBubbles.length > 0 &&
        // !isTyping &&
        !showDebateFinished &&
        !showTimeExpired
      ) {
        // setShowDebateFinished(true);
      }
    }, [visibleBubbles, argumentBubbles.length, hasStarted, // isTyping,
      showDebateFinished, showTimeExpired]);

  // Initiale Chat-History mit Arguments Intro Nachrichten
  // Reihenfolge: B, D, A, C (yellow, gray, red, green) - ohne E (blue)
  const speakerOrder: SpeakerKey[] = ["B", "D", "A", "C"];
  const initialChatHistory: ChatMessage[] = useMemo(() => {
    const sortedIntro = [...argumentsIntro]
      .filter((msg) => msg.speaker !== "E") // Filtere blauen Sprecher (E) heraus
      .sort((a, b) => {
      const indexA = speakerOrder.indexOf(a.speaker);
      const indexB = speakerOrder.indexOf(b.speaker);
      return indexA - indexB;
    });
    const messages: ChatMessage[] = sortedIntro.map((msg, index) => ({
      id: index + 1,
      type: "bot" as const,
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      text: msg.text,
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      isComplete: true,
      isIntro: true
    }));
    
    // // Füge User-Nachricht vom Intro hinzu, falls vorhanden
    // if (userIntroMessage) {
    //   messages.push({
    //     id: messages.length + 1000,
    //     type: "user",
    //     text: userIntroMessage,
    //     isComplete: true,
    //     isIntro: true
    //   });
    // }
    
    return messages;
  }, [argumentsIntro, userIntroMessage, speakerColors, speakerOrder, speakerToSide]);

  // Setze initiale chatHistory wenn noch leer
  useEffect(() => {
    if (chatHistory.length === 0 && initialChatHistory.length > 0) {
      setChatHistory(initialChatHistory);
    }
  }, [initialChatHistory, chatHistory.length]);

  const getNextMessageId = () => {
    nextMessageIdRef.current += 1;
    return nextMessageIdRef.current;
  };

  const typewriterEffect = (text: string, color: Color, side: "pro" | "contra" | "undecided") => {
    currentBubbleRef.current = { text, color, side };
    const pendingId = getNextMessageId();
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
      setVisibleBubbles(prev => {
        const nextVisible = prev + 1;
        visibleBubblesRef.current = nextVisible;
        const shouldPauseForSteer = nextVisible > 0 && nextVisible % 3 === 0 && nextVisible < argumentBubbles.length;

        if (shouldPauseForSteer) {
          const steerId = Math.floor((nextVisible - 1) / 3) + 1; // alle 3 Nachrichten Optionen anzeigen & auswählen
          const matchingSteerEntry = steerEntries.find((entry) => entry.id === steerId);
          setPendingSteerEntry(matchingSteerEntry ?? null);
        } else {
          setPendingSteerEntry(null);
        }

        return nextVisible;
      });
      setIsTyping(false);
      currentBubbleRef.current = null;
    };

    setIsTyping(true);

    setTimeout(() => {
      finalizePendingMessage();
    }, 2000); // Simuliere 2 Sekunden "Tippen"
  };

  // Starte automatisch die erste Nachricht beim Laden
  const startNextBubble = () => {
    continueProgress();
    const currentIndex = visibleBubblesRef.current;
    if (currentIndex >= argumentBubbles.length) return;
    const nextBubble = argumentBubbles[currentIndex];
    hasStartedRef.current = true;
    typewriterEffect(nextBubble.text, nextBubble.color, nextBubble.side);
  };

  useEffect(() => {
    if (!hasStarted) return;
    if (!hasStartedRef.current) {
      startNextBubble();
    }

    return () => {
    };
  }, [hasStarted]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleContinue = () => {
    if (!hasStarted) {
      continueProgress();
      onStart();
      startNextBubble();
      return;
    }

    if (pendingSteerEntry) {
      return;
    }

    if (visibleBubbles < argumentBubbles.length) {
      startNextBubble();
    } else {
      setShowDebateFinished(true);
      finishProgress();
      onExit();

    }
  };

  const handleSelectSteerOption = (optionText: string) => {
    setChatHistory(prev => [
      ...prev,
      {
        id: getNextMessageId(),
        type: "user" as const,
        text: optionText,
        isComplete: true,
        isIntro: false,
      },
    ]);
    setPendingSteerEntry(null);
    startNextBubble();
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTyping, hasStarted, visibleBubbles]);

  return (
    <div className="screen active-debate-screen">
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      {/* Timer abgelaufen Popup */}
      {/* {showTimeExpired && (
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
      )} */}
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
        <div
        style={{
          width: "180px",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "999px",
          overflow: "hidden",
        }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#7c3aed",
              transition: "width 150ms linear",
            }}
          />
        </div>
        <div>{Math.round(progress)}%</div>
        <div className="top-buttons-row">
          {/* <MuteButton isMuted={isMuted} onToggle={toggleMute} /> */}
          <button className="exit-btn" style={{marginLeft: "605px"}} onClick={handleExitClick}>
            {t("exit")}
          </button>
        </div>
      </div>

      <header className="screen-header" style={{marginBottom: "10px", marginTop: "0px"}}>
        <p className="subtitle" style={{marginTop: "0px"}}>{topicTitle || t("healthInsurance")}</p>
      </header>

      {/* Chat-History - chronologisch */}
      <section className="debate-arguments">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}
          >
            {msg.isIntro && <span className="intro-label">{msg.type === "user" ? "Du" : "Intro"}</span>}
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
                title="Diese Aussage als möglicherweise falsch oder irreführend melden"
                onClick={() => alert(`Nachricht gemeldet `)}
              >
                ⚠️
              </button>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
              {pendingSteerEntry && (
        <div style={{marginTop: "12px", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center"}}>
          <p style={{margin: 0, fontWeight: 600}}>Choose an option:</p>
          <div style={{display: "flex", flexDirection: "row", gap: "8px", width: "100%", maxWidth: "520px"}}>
            {[pendingSteerEntry.option1, pendingSteerEntry.option2, pendingSteerEntry.option3].map((option, index) => (
              <button
                key={`${pendingSteerEntry.id}-${index}`}
                className="con-primary-btn"
                style={{width: "100%", background: "#f5f3ff", color: "#5b21b6", border: "1px solid #c4b5fd"}}
                onClick={() => {handleSelectSteerOption(option); console.log("Chosen option: " +option);}}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      </section>

      <div className="footer-end-row" style={{marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center"}}>
        <button
          className="con-primary-btn"
          onClick={handleContinue}
          disabled={isTyping || !!pendingSteerEntry}
        >
          {hasStarted ? t("next") : t("startDebate")}
        </button>
      </div>
    </div>
  );
};

export default SteerDebateScreen;