import React from 'react';
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';

interface ExitWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitWarningModal: React.FC<ExitWarningModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="exit-warning-modal-overlay">
      <div className="exit-warning-modal">
        <div className="modal-head">
        <p className="modal-title">{t("exit2")}</p>
        </div>
        <div className="modal-body">
          <p className="modal-text">{t("exitSure")}</p>
          <div className="exit-modal-buttons">
            <button className="exit-cancel-btn" onClick={onCancel}>
              {t("cancel")}
            </button>
            <button className="exit-confirm-btn" onClick={onConfirm}>
              {t("leave")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitWarningModal;
