import React, { useState, useMemo } from 'react';
import ExitWarningModal from '../components/ExitWarningModal';
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams } from 'react-router-dom';
import { debateConfig } from '../config/debateConfig';
import { DebateData } from '../types/types';

interface TopicIntroProps {
  topicTitle: string;
  onNext: () => void;
  onExit: () => void;
}

type DebateUtterance = {
  uid: string;
  speaker: string;
  text: string;
  speak_as_user?: boolean;
};

type DebateNode = {
  round?: number;
  kind: string;
  topic?: string;
  utterances: DebateUtterance[];
  transition?: any;
};

type DebateData = {
  start_node: string;
  nodes: Record<string, DebateNode>;
};

const TopicIntro: React.FC<TopicIntroProps> = ({ onNext, onExit }) => {
  // console.log("Rendering:" + topicTitle);
  const { t, language } = useLanguage();
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);

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

  const [params] = useSearchParams();
  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  const lingFromURL = params.get("ling");

  const filename = topicFromURL && lingFromURL && roleFromURL ? `${topicFromURL}_${lingFromURL}_${roleFromURL.toLowerCase()}.json` : null;

  console.log("filename:", filename, "topicFromURL:", topicFromURL, "roleFromURL:", roleFromURL, "lingFromURL:", lingFromURL);

  const debateFiles = import.meta.glob('../debate_text/*.json', { eager: true, import: 'default' }) as Record<string, DebateData>;
  const debateData = useMemo<DebateData | undefined>(() => {
    if (!filename) return undefined;
    const key = Object.keys(debateFiles).find((k) => k.endsWith(`/${filename}`) || k.endsWith(filename));
    return key ? debateFiles[key] : undefined;
  }, [filename, debateFiles]);

    const debateSubtitle = useMemo(() => {
    if (!debateData) return null;
    const subtitle = debateData.subtitle;
    if (subtitle) {
      return subtitle;
    }
  }, [debateData]);

    const introduction = debateData?.introduction;

    const debateFirstStep = debateData?.first_step;

      const debateTitle = useMemo(() => {
    if (!debateData) return null;
    const title = debateData.title;
    if (title) {
      return title;
    }
  }, [debateData]);

  const introText = useMemo(() => {
    if (!debateData) return null;
    const startKey = debateData.start_node;
    const startNode = debateData.nodes?.[startKey];
    if (startNode && startNode.kind && startNode.kind.startsWith('intro') && startNode.utterances?.length) {
      return startNode.utterances.map((u) => u.text).join('\n\n');
    }
    const introNode = Object.values(debateData.nodes).find((n) => n.kind && n.kind.startsWith('intro'));
    if (introNode && introNode.utterances?.length) return introNode.utterances.map((u) => u.text).join('\n\n');
    return null;
  }, [debateData]);

  const image = import.meta.env.BASE_URL + "Infografik_Praemien.png";

  return (
    <section className="screen-body">
    <div className="screen-wrapper topic-intro-wrapper">
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      {debateConfig.showExitButton && (
        <div className="exit-btn-outside">
          <button className="exit-btn" onClick={handleExitClick}>
            {t("exit")}
          </button>
        </div>
      )}

      {showStartOverlay && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-head">
              <p className="modal-title">Anleitung</p>
            </div>
            <div className="modal-body">
              {/* <p className="modal-text"></p> */}
              <p className="modal-text">Auf dieser Seite lesen Sie eine kurze Einführung in das Thema der Debatte. Bitte lesen Sie den Text aufmerksam durch und klicken Sie danach auf «Fortfahren».</p>
              <button className="start-debate-btn" onClick= { () => setShowStartOverlay(false) }>Starten</button>
          </div>
        </div>
        </div>
      )}

      <div className="screen topic-intro-card">
        <header className="screen-header topic-intro-header">
          <h4 className="eyebrow">{t("topicIntro")}</h4>
          <h1 className="subtitle">{debateTitle}</h1>
          <h2 className="lede">{debateSubtitle}</h2>
        </header>
        <section className="screen-body scrollable">
          <div className="topic-intro-content">
            <div className="topic-intro-image">
              <img src={image} alt="Infografik Prämien" />
            </div>
            <div className="topic-intro-text">
              {introText ? (
                introText.split(/\n{1,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <>
                  <p>{t("topicIntroText1")}</p>
                  <p>{t("topicIntroText2")}</p>
                  <p>{t("topicIntroText3")}</p>
                </>
              )}
              <button className="con-primary-btn" onClick={onNext}>
                Fortfahren
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
    </section>
  );
};

export default TopicIntro;