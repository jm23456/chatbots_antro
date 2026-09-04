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
    <div className="screen" style={{
     boxShadow: "0 20px 60px rgba(80, 60, 160, 0.15),0 8px 24px rgba(80, 60, 160, 0.10)",
  paddingTop: "24px",
  paddingBottom: "40px",
      margin: "32px auto",
      maxWidth: "1000px",
      borderRadius: "24px"
    }}>
      <section className="screen-body">

        {/* Start Popup für Summary Screen */}
        {showPopup && (
          <div className="start-debate-modal-overlay">
            <div className="start-debate-modal" style={{padding: 0, overflow: "hidden"}}>
              <div style={{
                background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                padding: "1.25rem 1.5rem",
                borderRadius: "1.5rem 1.5rem 0 0",
                marginBottom: "0.5rem"
              }}>
                <p style={{fontSize: "20px", fontWeight: "600", margin: 0, color: "#5b21b6"}}>{t("summaryPopup2")}</p>
              </div>
              <div style={{padding: "0rem 1.5rem 1.5rem 1.5rem"}}>
                {/* <p style={{fontSize: "18px", marginTop: "10px", fontWeight: "600"}}>{t("summaryPopup2")}</p> */}
                <p style={{fontSize: "18px"}}>{t("summaryPopup3")}</p>
                <p style={{fontSize: "18px"}}>Fahren Sie anschliessend in Qualtrics fort.</p>
                <button className="start-debate-btn" onClick={() => {setShowPopup(false); handleNext();} }>
                  Fortfahren
                </button>
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

      </section>
      <header className="screen-header" style={{marginBottom: "4px", marginTop: "0px"}}>
        <p className="subtitle">Zusammenfassung</p> 
        {/* <p className="intro-text" style={{marginTop: "0px"}}>{t("debatedShowed")}</p> */}
      </header>

    <div className="screen" style={{
      boxShadow: "0 2px 10px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
      paddingTop: "32px",
      paddingBottom: "10px",
      background: "#F9F8FD",
      margin: "0px auto",
      maxWidth: "800px",
      height: "auto",
      borderRadius: "24px"
    }}>
      <section className="screen-body scrollable" style={{maxWidth: "600px", margin: "0 auto", padding: "0 32px"}}>
        {debateSummary ? (
          <>
            {debateSummary.text && debateSummary.text.split('\n\n').map((paragraph, idx) => (
              <p key={idx} style={{ marginBottom: '1rem' }}>{paragraph}</p>
            ))}

            {debateSummary.points && debateSummary.points.length > 0 && (
              <ul style={{ paddingLeft: '24px', margin: '20px 0' }}>
                {debateSummary.points.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '0.75rem' }}>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {debateSummary.conclusion && (
              <p style={{ marginTop: '20px' }}>
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