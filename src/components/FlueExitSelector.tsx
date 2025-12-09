import React from 'react';
import './FlueExitSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type FlueExitType = 'external-wall' | 'roof';

interface FlueExitOption {
  id: FlueExitType;
  label: string;
}

interface FlueExitSelectorProps {
  onSelect: (type: FlueExitType) => void;
  selectedType?: FlueExitType | null;
  onBack?: () => void;
  progress?: number;
}

const FlueExitSelector: React.FC<FlueExitSelectorProps> = ({
  onSelect,
  selectedType,
  onBack,
  progress = 0,
}) => {
  const flueExitOptions: FlueExitOption[] = [
    {
      id: 'external-wall',
      label: 'External Wall',
    },
    {
      id: 'roof',
      label: 'Roof',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">Where does your boiler's flue exit your home?</h1>

        <div className="flue-exit-selector__radio-options">
          {flueExitOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`flue-exit-selector__radio-option ${
                selectedType === option.id ? 'flue-exit-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="flue-exit-selector__radio">
                {selectedType === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flue-exit-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="flue-exit-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flue-exit-selector__check-icon flue-exit-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="flue-exit-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default FlueExitSelector;

