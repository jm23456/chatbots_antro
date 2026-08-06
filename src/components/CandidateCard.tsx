import React, { useState, useRef, useEffect } from "react";

interface CandidateCardProps {
  color: "yellow" | "green" | "red" | "blue" | "turquoise" | "gray";
//   hasMic?: boolean;
  showBubble?: boolean;
  bubbleText?: string;
  isTyping?: boolean;
  bubbleLabel?: string;
  isSpeaking?: boolean;
  isPaused?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  color,
//   hasMic = false,
  showBubble = false,
  bubbleText,
  isTyping = false,
  bubbleLabel = "Introduction",
  isSpeaking = false,
  isPaused = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleVisible = showBubble || hovered || bubbleText !== undefined || isTyping;

  useEffect(() => {
    if (bubbleRef.current && bubbleText !== undefined) {
      bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight;
    }
  }, [bubbleText]);

  return (
    <div className="arguments-stage">
    <div
      className={`candidate-card candidate-${color}${isSpeaking ? " speaking" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {bubbleVisible && (
      <div
  className={`candidate-speech-bubble candidate-${color}${isSpeaking ? " speaking" : ""}`}
  ref={bubbleRef}
  style={{ whiteSpace: "pre-line" }}
>
  {/* {hasMic && <span className="bubble-mic">🎙️</span>} */}
          {isTyping ? (
            <span className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          ) : bubbleText !== undefined ? (
            <span>
              {bubbleText}
            </span>
          ) : (
            <span>{bubbleLabel}</span>
          )}
        </div>
      )}
      <div className={`candidate-dot candidate-${color}`}></div>

      {/* <div className={`candidate-robot ${hasMic ? "has-mic" : ""}`}>
        <div className={`argument-box argument-${color}`}>
          {hasMic && <span className="mic-icon">🎙️</span>}
        </div> 
      </div> */}
    </div>
    </div>
  );
};

export default CandidateCard;
