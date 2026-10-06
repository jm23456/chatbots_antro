import React, { useState, useMemo } from 'react';
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams } from 'react-router-dom';

interface SummaryProps {
  topicTitle: string;
  participantID: string | null;
  onStartAnother: () => void;
}

type DebateUtterance = {
  uid: string;
  speaker: string;
  text: string;
  speak_as_user?: boolean;
  points?: string[];
  conclusion?: string;
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

type DebateSummary = {
  text?: string;
  points?: string[];
  conclusion?: string;
};

const Summary: React.FC<SummaryProps> = ({ onStartAnother, participantID }) => {
  const { t } = useLanguage();
  const [showPopup, setShowPopup] = useState(true);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
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
  
      const debateSummary = useMemo<DebateSummary | null>(() => {
        if (!debateData) return null;

        const summaryNode = debateData.nodes?.summary;
        if (!summaryNode) return null;

        const textValue = (summaryNode as any).text;
        const text = typeof textValue === 'string' && textValue.trim().length
          ? textValue.trim()
          : summaryNode.utterances?.map((u) => u.text).join('\n\n');

        const points = summaryNode.utterances
          ?.flatMap((u) => u.points ?? [])
          .filter(Boolean);

        const conclusion = summaryNode.utterances
          ?.map((u) => (typeof u.conclusion === 'string' ? u.conclusion.trim() : undefined))
          .filter(Boolean)
          .join('\n\n');

        return {
          text: text || undefined,
          points: points?.length ? points : undefined,
          conclusion: conclusion || undefined,
        };
      }, [debateData]);

const handleNext = () => {
  // setShowEndOverlay(true);

  window.parent.postMessage(
    {
      type: "go",
    },
    "*"
  );
};

  return (
    <div className="screen summary-screen">
      <section className="screen-body">

        {/* Start Popup für Summary Screen */}
        {showPopup && (
          <div className="start-debate-modal-overlay">
            <div className="start-debate-modal">
              <div className="modal-head">
                <p className="modal-title">{t("summaryPopup2")}</p>
              </div>
              <div className="modal-body">
                {/* <p style={{fontSize: "18px", marginTop: "10px", fontWeight: "600"}}>{t("summaryPopup2")}</p> */}
                <p className="modal-text">{t("summaryPopup3")}</p>
                <p className="modal-text">Fahren Sie anschliessend in Qualtrics fort.</p>
                <button className="start-debate-btn" onClick={() => {setShowPopup(false); handleNext();} }>
                  Fortfahren
                </button>
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
              <p className="modal-text">Bitte fahren Sie nun in Qualtrics fort.</p>
              {/* <p className="modal-text">debateFirstStep</p> */}
          </div>
        </div>
        </div>
      )}

      </section>
      <header className="screen-header summary-header">
        <h1 className="subtitle">Zusammenfassung</h1>
        {/* <p className="intro-text" style={{marginTop: "0px"}}>{t("debatedShowed")}</p> */}
      </header>

    <div className="summary-card">
      <section className="screen-body scrollable summary-body">
        {debateSummary ? (
          <>
            {debateSummary.text && debateSummary.text.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            {debateSummary.points && debateSummary.points.length > 0 && (
              <ul>
                {debateSummary.points.map((point, idx) => (
                  <li key={idx}>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {debateSummary.conclusion && (
              <p className="summary-conclusion">
                {debateSummary.conclusion}
              </p>
            )}
          </>
        ) : (
          <p>{t('noDebateFound')}</p>
        )}
      </section>

      {/* <footer className="footer-end-row" style= {{ marginTop: "30px", textAlign: "center" , marginBottom: "10px"  }}>
        <button className="con-primary-btn" onClick={handleNext}>
          Fortsetzen
        </button>
      </footer> */}
    </div>
    </div>
  );
};

export default Summary;