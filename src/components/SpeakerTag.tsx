import React from "react";
import { useLanguage } from "../hooks/useLanguage";
import type { TranslationKey } from "../i18n/translations";
import SpeakerIcon from "./SpeakerIcon";

type Color = "red" | "yellow" | "green" | "turquoise" | "blue" | "gray";

// Colour name of each speaker; the same words are the options of the Qualtrics ranking.
// The shape icon in front of it is fixed per colour (see SpeakerIcon).
const COLOR_KEYS: Record<Color, TranslationKey> = {
  red: "colorRed",
  blue: "colorBlue",
  green: "colorGreen",
  yellow: "colorYellow",
  turquoise: "colorTurquoise",
  gray: "colorGray",
};

const SpeakerTag: React.FC<{ color: string }> = ({ color }) => {
  const { t } = useLanguage();
  const key = COLOR_KEYS[color as Color];
  if (!key) return null;
  return (
    <span className="speaker-tag">
      <SpeakerIcon color={color} className={`speaker-tag-dot speaker-${color}`} />
      {t(key)}
    </span>
  );
};

export default SpeakerTag;
