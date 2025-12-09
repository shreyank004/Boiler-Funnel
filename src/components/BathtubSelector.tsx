import React from 'react';
import './BathtubSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type BathtubCount = 'none' | '1' | '2' | '3+';

interface BathtubOption {
  id: BathtubCount;
  label: string;
}

interface BathtubSelectorProps {
  onSelect: (count: BathtubCount) => void;
  selectedCount?: BathtubCount | null;
  onBack?: () => void;
  progress?: number;
}

const BathtubSelector: React.FC<BathtubSelectorProps> = ({
  onSelect,
  selectedCount,
  onBack,
  progress = 0,
}) => {
  const bathtubOptions: BathtubOption[] = [
    {
      id: '1',
      label: '1 bathroom',
    },
    {
      id: '2',
      label: '2 bathrooms',
    },
    {
      id: '3+',
      label: '3 bathrooms',
    },
    {
      id: 'none',
      label: '4+ bathrooms',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">How many bathtubs does it have?</h1>

        <div className="bathtub-selector__radio-options">
          {bathtubOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`bathtub-selector__radio-option ${
                selectedCount === option.id ? 'bathtub-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="bathtub-selector__radio">
                {selectedCount === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bathtub-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="bathtub-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bathtub-selector__check-icon bathtub-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="bathtub-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default BathtubSelector;

