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

// "Participate the Conversation" - Role
interface PartyDebateScreenProps {
  topicTitle: string;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
  userIntroMessage?: string | null;
}

const PartyDebateScreen: React.FC<PartyDebateScreenProps> = ({
  topicTitle,
  onExit,
  hasStarted,
  onStart,
  userIntroMessage,
}) => {
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const currentBubbleRef = useRef<BubbleRef>(null);
  const pendingMessageIdRef = useRef<number | null>(null);
  const visibleBubblesRef = useRef(0);
  const { t, language } = useLanguage();
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  const [showDebateFinished, setShowDebateFinished] = useState(false);
  const [pendingSteerEntry, setPendingSteerEntry] = useState<ChoiceOptionEntry | null>(null);
  const [selectedOption, setSelectedOption] = useState<"option1" | "option2" | "option3" | null>(null);
  const nextMessageIdRef = useRef(1000);
  const [showIntroModal, setShowIntroModal] = useState(true);

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

  type ChoiceOptionEntry = {
    option1: string;
    option2: string;
    option3: string;
  }

  type DebateData = {
    debate_script?: DebateScriptItem[];
    debate_script_2?: DebateScriptItem[];
    debate_script_3?: DebateScriptItem[];
    "Arguments Intro"?: DebateScriptItem[];
    roles?: Record<string, RoleData>;
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

  const handleStartDebate = () => {
    setShowStartModal(false);
    onStart();
  };
    const handleStart = () => {
    setShowIntroModal(false);
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
  const debateScript2 = debateData.debate_script_2 ?? [];
  const debateScript3 = debateData.debate_script_3 ?? [];
  const argumentsIntro = debateData["Arguments Intro"] ?? [];

  const getScriptForOption = (option: "option1" | "option2" | "option3" | null) => {
    if (option === "option2") return debateScript2;
    if (option === "option3") return debateScript3;
    return debateScript;
  };

  const activeDebateScript = useMemo(() => getScriptForOption(selectedOption), [selectedOption]);

    const argumentBubbles = useMemo(() => {
      return activeDebateScript.map((msg) => ({
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      text: msg.text,
      id: msg.id,
      speaker: msg.speaker,
    }));
  }, [activeDebateScript, speakerColors, speakerToSide]);

  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const continueProgress = () => {
  setProgress((prev) => Math.min(prev + 100/(activeDebateScript.length + 1) || 1, 100)); //+1 für Intro-Nachricht
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
  // Reihenfolge: B, D, E, A, C (yellow, gray, blue, red, green)
  const speakerOrder: SpeakerKey[] = ["B", "D", "E", "A", "C"];
  const introMessages = useMemo(() => {
    const sortedIntro = [...argumentsIntro].sort((a, b) => {
      const indexA = speakerOrder.indexOf(a.speaker as SpeakerKey);
      const indexB = speakerOrder.indexOf(b.speaker as SpeakerKey);
      return indexA - indexB;
    });

    const blueIntro = sortedIntro.find((msg) => msg.speaker === "E");
    const otherIntroMessages = sortedIntro.filter((msg) => msg.speaker !== "E");

    return {
      blueIntro,
      otherIntroMessages,
    };
  }, [argumentsIntro, speakerOrder]);

  const initialChatHistory: ChatMessage[] = useMemo(() => {
    return introMessages.otherIntroMessages.map((msg, index) => ({
      id: index + 1,
      type: "bot" as const,
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      text: msg.text,
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      isComplete: true,
      isIntro: true
    }));
  }, [introMessages.otherIntroMessages, speakerColors, speakerToSide]);

  // Setze initiale chatHistory wenn noch leer
  useEffect(() => {
    if (chatHistory.length === 0 && initialChatHistory.length > 0) {
      setChatHistory(initialChatHistory);

      if (introMessages.blueIntro) {
        setSelectedOption("option1");
        setPendingSteerEntry({
          option1: introMessages.blueIntro.text,
          option2: "Option 2",
          option3: "Option 3",
        });
      }
    }
  }, [initialChatHistory, chatHistory.length, introMessages.blueIntro]);

  const getNextMessageId = () => {
    nextMessageIdRef.current += 1;
    return nextMessageIdRef.current;
  };

  const typewriterEffect = (
    text: string,
    color: Color,
    side: "pro" | "contra" | "undecided"
  ) => {
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
      const messageID = pendingMessageIdRef.current
      setChatHistory(prev => prev.map(m => m.id === messageID ? { ...m, text, isComplete: true } : m));
      pendingMessageIdRef.current = null;
      continueProgress();
      setPendingSteerEntry(null);
      setVisibleBubbles(prev => {
        const nextVisible = prev + 1;
        visibleBubblesRef.current = nextVisible;
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
  const startNextBubble = (option: "option1" | "option2" | "option3" | null = selectedOption) => {
    const currentIndex = visibleBubblesRef.current;
    const scriptForThisTurn = getScriptForOption(option);
    if (currentIndex >= scriptForThisTurn.length) return;
    const nextBubble = scriptForThisTurn[currentIndex];
    hasStartedRef.current = true;

    if (nextBubble.speaker === "E") {
      setPendingSteerEntry({
        option1: nextBubble.text,
        option2: "Option 2",
        option3: "Option 3",
      });
      setVisibleBubbles(prev => {
        const nextVisible = prev + 1;
        visibleBubblesRef.current = nextVisible;
        return nextVisible;
      });
      setIsTyping(false);
      currentBubbleRef.current = null;
      return;
    }

    typewriterEffect(nextBubble.text, speakerColors[nextBubble.speaker as keyof typeof speakerColors], speakerToSide[nextBubble.speaker as keyof typeof speakerToSide]);
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
  }, [chatHistory, pendingSteerEntry]);

  const handleContinue = () => {
    if (!hasStarted) {
      if (showStartModal) {
        handleStartDebate();
        return;
      }

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

  const handleSelectSteerOption = (optionText: string, optionKey: "option1" | "option2" | "option3") => {
    const isFirstSelection = chatHistory.filter((msg) => msg.type === "user").length === 0;
    setSelectedOption(optionKey);
    setChatHistory(prev => [
      ...prev,
      {
        id: getNextMessageId(),
        type: "user" as const,
        text: optionText,
        isComplete: true,
        isIntro: isFirstSelection,
      },
    ]);
    setPendingSteerEntry(null);
    setShowStartModal(true);
    continueProgress();
    if (!isFirstSelection){
    startNextBubble(optionKey);}
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
            {msg.isIntro && <span className="intro-label">{"Intro"}</span>}
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
          <div style={{display: "flex", flexDirection: "row", gap: "12px", width: "100%", maxWidth: "740px"}}>
            {[pendingSteerEntry.option1, pendingSteerEntry.option2, pendingSteerEntry.option3].map((option, index) => {
              const optionKey = index === 0 ? "option1" : index === 1 ? "option2" : "option3";
              return (
                <button
                  key={`choice-${optionKey}`}
                  className="con-primary-btn"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#ffffff",
                    color: "#5b21b6",
                    border: "1px solid #8b5cf6",
                    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.18)"
                  }}
                  onClick={() => {handleSelectSteerOption(option, optionKey); console.log("Chosen Option: " + option);}}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </section>

  {/* Modal Overlay für Einführung */}
      {showIntroModal && (
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
            <h2 className="modal-title" style={{fontSize: "22px", marginTop: "5px"}}>Your role is to participate in the debate</h2>
            <p className="modal-text" style={{fontSize: "16px", marginBottom: "2px"}}>You are part of the debate. You will be given three options to decide how you want to participate in it.</p>
            {/* <p className="modal-text" style={{fontSize: "16px", marginTop: "0px"}}>{t("readyText4")}</p> */}
            <button className="start-debate-btn" onClick={handleStart}>
              Start
            </button>
          </div>
        </div>
        </div>
      )}  
      {/* Modal Overlay für Start Debate */}
      {!hasStarted && showStartModal && (
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
            {/* <p className="modal-text" style={{fontSize: "16px", marginBottom: "2px"}}>{t("readyText")}</p>
            <p className="modal-text" style={{fontSize: "16px", marginTop: "0px"}}>{t("readyText4")}</p> */}
            <button className="start-debate-btn" onClick={handleStartDebate}>
              {t("startDebate")}
            </button>
          </div>
        </div>
        </div>
      )}
      <div className="footer-end-row" style={{marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center"}}>
        <button
          className="con-primary-btn"
          onClick={handleContinue}
          disabled={isTyping || !!pendingSteerEntry || (!hasStarted && !showStartModal)}
        >
          {visibleBubbles < argumentBubbles.length ? t("continue") : t("finishDebate")}
        </button>
      </div>
    </div>
  );
};

export default PartyDebateScreen;