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

  const image = language === "de"
    ? import.meta.env.BASE_URL + "Infografik_Praemien.png"
    : import.meta.env.BASE_URL + "Infografik.en.png";

  return (
    <section className="screen-body">
    <div className="screen-wrapper">
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
          <div className="start-debate-modal" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", padding: "1.25rem 1.5rem", borderRadius: "1.5rem 1.5rem 0 0", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6" }}>Anleitung</p>
            </div>
            <div style={{ padding: "0rem 0.5rem 1rem 0.5rem" }}>
              <p className="modal-text" style={{ fontSize: "16px", marginBottom: "10px", color: "#050505" }}>{introduction}</p>
              <button className="start-debate-btn" onClick= { () => setShowStartOverlay(false) }>{t("continue")}</button>
          </div>
        </div>
        </div>
      )}

      <div className="screen" style={{
        boxShadow: "0 10px 40px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
        padding: "24px 40px",
        margin: "0 auto",
        maxWidth: "1000px",
        borderRadius: "24px"
      }}>
        <header className="screen-header" style={{marginBottom: "30px"}}>
          <h4 style={{ fontSize: "28px", textAlign: "center", marginBottom: "5px" }}>{t("topicIntro")}</h4>
          <p className="subtitle" style={{ marginTop: "10px"}}>{debateTitle}</p>
          <h2 style={{ textAlign: "center", marginTop: "30px" }}>{debateSubtitle}</h2>
        </header>
        <section className="screen-body scrollable">
          <div className="topic-intro-content">
            <div className="topic-intro-image">
              <img src={image} alt="Infografik Prämien" />
            </div>
            <div className="topic-intro-text">
              {introText ? (
                introText.split(/\n{1,}/).map((para, i) => (
                  <p key={i} style={i === introText.split(/\n{1,}/).length - 1 ? { marginBottom: "35px" } : {}}>{para}</p>
                ))
              ) : (
                <>
                  <p>{t("topicIntroText1")}</p>
                  <p>{t("topicIntroText2")}</p>
                  <p style={{ marginBottom: "35px" }}>{t("topicIntroText3")}</p>
                </>
              )}
              <button className="con-primary-btn" onClick={onNext}>
                {t("next")}
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