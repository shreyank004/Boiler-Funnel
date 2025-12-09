import React from 'react';
import './SelectorCommon.css';

interface FooterProps {
  onBack?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onBack }) => {
  return (
    <div className="selector-common__footer">
      {onBack && (
        <button
          type="button"
          className="selector-common__back-button"
          onClick={onBack}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="selector-common__trustpilot">
        <span className="selector-common__trustpilot-rating">Excellent</span>
        <div className="selector-common__trustpilot-stars">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#10b981" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          ))}
        </div>
        <span className="selector-common__trustpilot-text">
          12,781 reviews on{' '}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#065f46" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          {' '}Trustpilot
        </span>
      </div>
    </div>
  );
};

export default Footer;

