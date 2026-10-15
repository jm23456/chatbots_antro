import React from "react";

// One plain geometric shape per speaker colour, so speakers stay recognisable without
// relying on colour alone (also for colour-blind participants). Shapes were picked to carry
// no evaluative or signal meaning in their colour: no star/heart/check/cross/plus, no arrows
// (left/right), no red or yellow triangle (warning), no green triangle (stock "up"), no green
// circle (status "ok"), no red circle or polygon (stop/ban), no yellow diamond (Swiss
// priority-road sign). All shapes have roughly the same area (~250 of 576 units), so none
// looks bigger or heavier. public/speaker-icons/ holds the same shapes for Qualtrics.
const SHAPES: Record<string, string> = {
  red: "M12 0.7 L23.3 12 L12 23.3 L0.7 12 Z",                                  // diamond
  blue: "M12 1.8 L23.8 22.2 L0.2 22.2 Z",                                      // triangle
  green: "M4 4 H20 V20 H4 Z",                                                  // square
  yellow: "M21.9 12 L16.95 20.57 L7.05 20.57 L2.1 12 L7.05 3.43 L16.95 3.43 Z", // hexagon
  turquoise: "M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12 Z",                       // circle
};

const SpeakerIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => {
  const d = SHAPES[color];
  if (!d) return null;
  return (
    <svg className={`speaker-icon ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
};

export default SpeakerIcon;
