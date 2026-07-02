import React, { useEffect, useRef } from "react";
import yellowStandard from "../avatars/yellow_standard.jpg";
import redStandard from "../avatars/red_standard.jpg";
import greenStandard from "../avatars/green_standard.jpg";
import greyStandard from "../avatars/grey_standard.jpg";
import blueStandard from "../avatars/blue_standard.jpg";

interface CandidateCardProps {
  color: "yellow" | "gray" | "green" | "red" | "blue";
  hasMic?: boolean;
  showBubble?: boolean;
  bubbleText?: string;
  isTyping?: boolean;
  bubbleLabel?: string;
  isSpeaking?: boolean;
  isPaused?: boolean;
}


const CandidateCard: React.FC<CandidateCardProps> = ({ color, hasMic = false, showBubble = false, bubbleText, isTyping = false, bubbleLabel = "Introduction", isSpeaking = false, isPaused = false }) => {
  const [hovered, setHovered] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleVisible = showBubble || bubbleText !== undefined || isTyping;

  useEffect(() => {
    if (bubbleRef.current && bubbleText !== undefined) {
      bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight;
    }
  }, [bubbleText]);

  const getAvatarImage = () => {
    switch (color) {
      case "yellow":
        return yellowStandard;
      case "red":
        return redStandard;
      case "green":
        return greenStandard;
      case "gray":
        return greyStandard;
      case "blue":
        return blueStandard;
    }
  };

  const avatarImage = getAvatarImage();

  return (
    <div className={`candidate-card candidate-${color}${_isSpeaking ? " speaking" : ""}`}>
      {bubbleVisible && (
        <div className="candidate-speech-bubble" ref={bubbleRef} style={{ whiteSpace: "pre-line" }}>
          {isTyping ? (
            <span className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          ) : bubbleText !== undefined ? (
            <span>{bubbleText}</span>
          ) : (
            <span>{bubbleLabel}</span>
          )}
        </div>
      )}

      <div className="candidate-robot">
        <img src={avatarImage} alt={`${color} robot`} className="robot-image" />
      </div>

      <div className="candidate-podium">
        <div className="podium-modern">
          <div className="podium-modern-top"></div>
          <div className="podium-modern-stand"></div>
          <div className="podium-modern-base"></div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;