import React, { useMemo, useState } from "react";
import CandidateCard from "../components/CandidateCard";
import "../App.css";
import type { DebateData } from "../types/types";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

interface CandidatesIntroProps {
  onNext: () => void;
  onExit: () => void;
}

type Color = "red" | "yellow" | "green" | "turquoise" | "blue" | "gray";
type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

type IntroArgument = {
  speaker: SpeakerKey;
  text: string;
  color: Color;
};

const CandidatesIntro: React.FC<CandidatesIntroProps> = ({ onNext, onExit }) => {
  const [params] = useSearchParams();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shownArguments, setShownArguments] = useState<number[]>([]);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const { t, language } = useLanguage();

  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  const lingFromURL = params.get("ling");
  const filename = topicFromURL && lingFromURL && roleFromURL ? `${topicFromURL}_${lingFromURL}_${roleFromURL.toLowerCase()}.json` : null;

  const debateFiles = import.meta.glob("../debate_text/*.json", { eager: true, import: "default" }) as Record<string, DebateData>;

  const debateData = useMemo<DebateData | undefined>(() => {
    if (!filename) return undefined;
    const key = Object.keys(debateFiles).find((k) => k.endsWith(`/${filename}`) || k.endsWith(filename));
    return key ? debateFiles[key] : undefined;
  }, [debateFiles, filename]);

  const getRoleColor = (speaker: SpeakerKey): Color => {
    const roleColor = debateData?.roles?.[speaker]?.display?.color as Color | undefined;
    return (
      roleColor ?? {
        A: "red",
        B: "yellow",
        C: "green",
        D: "turquoise",
        E: "blue",
        SYSTEM: "gray",
      }[speaker]
    );
  };

  const introArguments = useMemo<IntroArgument[]>(() => {
    if (!debateData) return [];
    const introNode = Object.values(debateData.nodes).find((node) => node.kind === "intro-arguments");
    if (!introNode) return [];
    return introNode.utterances.map((utterance) => ({
      speaker: utterance.speaker as SpeakerKey,
      text: utterance.text,
      color: getRoleColor(utterance.speaker as SpeakerKey),
    }));
  }, [debateData]);

  const allSpeakers = useMemo<SpeakerKey[]>(() => {
    if (!debateData) return [];
    return Object.keys(debateData.roles).filter((key) => key !== "SYSTEM") as SpeakerKey[];
  }, [debateData]);

  const activeArgument = currentIndex >= 0 ? introArguments[currentIndex] : undefined;

  const handleNext = () => {
    if (!hasStarted) {
      setHasStarted(true);
      if (introArguments.length > 0) {
        setCurrentIndex(0);
        setShownArguments([0]);
        return;
      }
      onNext();
      return;
    }

    if (currentIndex < introArguments.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setShownArguments((prev) => [...prev, nextIndex]);
      return;
    }
    if (currentIndex <= introArguments.length - 1) {
      setShowEndOverlay(true);
      return;
    }

    onNext();
  };

  const buttonLabel = !hasStarted ? "Start Introduction" : currentIndex < introArguments.length - 1 ? "Weiter" : "Fortfahren";

  return (
    <div className="screen">
      <header className="screen-header">
        <p className="subtitle">Präsentation der Kandidaten</p>
      </header>

        {showStartOverlay && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden", height: "auto", maxWidth: "600px", borderRadius: "1.5rem" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "24px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>Anleitung</p>
            </div>
            <div style={{ padding: "1rem 1rem 1.5rem 1rem" }}>
              {/* <p className="modal-text" style={{ fontSize: "16px", marginBottom: "14px", color: "#050505" }}></p> */}
              <p className="modal-text" style={{ fontSize: "16px", marginBottom: "16px", color: "#050505" }}>Hier: Candidates Introduction + following with Ranking </p>
              <button className="start-debate-btn" onClick= { () => setShowStartOverlay(false) }>{t("continue")}</button>
          </div>
        </div>
        </div>
      )}


      {showEndOverlay &&(
             <div className="start-debate-modal-overlay">
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden", height: "auto", maxWidth: "600px", borderRadius: "1.5rem" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "24px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>Anleitung</p>
            </div>
            <div style={{ padding: "1rem 1rem 1.5rem 1rem" }}>
              <p className="modal-text" style={{ fontSize: "16px", marginBottom: "14px", color: "#050505" }}>Bitte fahren Sie nun in Qualtrics fort.</p>
              {/* <p className="modal-text" style={{ fontSize: "16px", marginBottom: "16px", color: "#050505" }}>debateFirstStep</p> */}
          </div>
        </div>
        </div>
      )}

      <section className="screen-body">
        <div className="arguments-stage intro-no-dim">
        {allSpeakers.map((speaker) => {
          const color = getRoleColor(speaker);
          const isActive = activeArgument?.speaker === speaker;

          const speakerArguments = shownArguments
            .map((index) => introArguments[index])
            .filter((arg) => arg.speaker === speaker);
          const lastArgumentText = speakerArguments.length > 0 ? speakerArguments[speakerArguments.length - 1].text : undefined;
          const bubbleText = isActive ? activeArgument?.text : lastArgumentText;

          return (
            <CandidateCard
              key={speaker}
              color={color}
              hasMic={isActive}
              isSpeaking={isActive}
              showBubble={Boolean(bubbleText)}
              bubbleText={bubbleText}
              bubbleLabel={bubbleText ? "" : "Introduction"}
            />
          );
        })}

        </div>
      </section>

      <footer className="footer-end-row">
        <button className="con-primary-btn" onClick={handleNext}>
          {buttonLabel}
        </button>
      </footer>
    </div>
  );
};

export default CandidatesIntro;
