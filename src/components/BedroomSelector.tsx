import React from 'react';
import './BedroomSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type BedroomCount = '1' | '2' | '3' | '4' | '5+';

interface BedroomOption {
  id: BedroomCount;
  label: string;
}

interface BedroomSelectorProps {
  onSelect: (count: BedroomCount) => void;
  selectedCount?: BedroomCount | null;
  onBack?: () => void;
  progress?: number;
}

const BedroomSelector: React.FC<BedroomSelectorProps> = ({
  onSelect,
  selectedCount,
  onBack,
  progress = 0,
}) => {
  const bedroomOptions: BedroomOption[] = [
    {
      id: '1',
      label: '1 bedroom',
    },
    {
      id: '2',
      label: '2 bedrooms',
    },
    {
      id: '3',
      label: '3 bedrooms',
    },
    {
      id: '4',
      label: '4+ bedrooms',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">How many bedrooms does it have?</h1>

        <div className="bedroom-selector__radio-options">
          {bedroomOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`bedroom-selector__radio-option ${
                selectedCount === option.id ? 'bedroom-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="bedroom-selector__radio">
                {selectedCount === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bedroom-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="bedroom-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bedroom-selector__check-icon bedroom-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="bedroom-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default BedroomSelector;

