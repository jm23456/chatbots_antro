import React, { useMemo, useState } from "react";
import CandidateCard from "../components/CandidateCard";
import SpeakerTag from "../components/SpeakerTag";
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
      window.parent.postMessage({
        type: "go"
    }, "*");
      setShowEndOverlay(true);
      return;
    }

    onNext();
  };

  const buttonLabel = !hasStarted ? "Starten" : "Fortfahren";

  return (
    <div className="screen">
      <header className="screen-header">
        <p className="subtitle">Vorstellung der KI-Bots</p>
      </header>

        {showStartOverlay && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-head">
              <p className="modal-title">Anleitung</p>
            </div>
            <div className="modal-body">
              {/* <p className="modal-text"></p> */}
              <p className="modal-text">Bevor wir mit der Debatte beginnen, stellen sich die fünf KI-Bots der Debatte nacheinander vor. Die Vorstellung beinhaltet deren individuelle Position.</p>
              <p className="modal-text">Klicken Sie auf «Starten» und anschliessend auf «Fortfahren».</p>
              <p className="modal-text"><strong>Wichtig: Beachten Sie, dass Sie lediglich auf «Fortfahren» klicken können. Lesen Sie sich deshalb alle Vorstellungen gründlich durch, bevor Sie zum nächsten KI-Bot-Statement klicken.</strong></p>
              <p className="modal-text">Nach der Vorstellung werden Sie gebeten, die fünf KI-Bots nach Präferenz zu ordnen.</p>
              <button className="start-debate-btn" onClick= { () => setShowStartOverlay(false) }>Fortfahren</button>
          </div>
        </div>
        </div>
      )}


      {showEndOverlay &&(
             <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-head">
              <p className="modal-title">Anleitung</p>
            </div>
            <div className="modal-body">
              <p className="modal-text">Klicken Sie auf die Schaltfläche "Nächste Seite" in der rechten Ecke.</p>
              {/* <p className="modal-text">debateFirstStep</p> */}
          </div>
        </div>
        </div>
      )}

      <section className="screen-body">
        {/* The current statement gets one wide panel instead of a narrow bubble above
            the speaker's dot, so it stays readable on phones and in the Qualtrics frame. */}
        {activeArgument && (
          <div className={`intro-statement candidate-${getRoleColor(activeArgument.speaker)}`}>
            <SpeakerTag color={activeArgument.color} />
            {activeArgument.text}
          </div>
        )}
        <div className="arguments-stage intro-no-dim intro-dots">
        {allSpeakers.map((speaker) => {
          const isActive = activeArgument?.speaker === speaker;
          return (
            <div key={speaker} className="intro-dot-with-name">
              <CandidateCard
                color={getRoleColor(speaker)}
                isSpeaking={isActive}
                withBubble={false}
              />
              <SpeakerTag color={getRoleColor(speaker)} />
            </div>
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
