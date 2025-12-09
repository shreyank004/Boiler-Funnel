import React from 'react';
import './ShowerCubicleSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type ShowerCubicleCount = 'none' | '1' | '2+';

interface ShowerCubicleOption {
  id: ShowerCubicleCount;
  label: string;
}

interface ShowerCubicleSelectorProps {
  onSelect: (count: ShowerCubicleCount) => void;
  selectedCount?: ShowerCubicleCount | null;
  onBack?: () => void;
  progress?: number;
}

const ShowerCubicleSelector: React.FC<ShowerCubicleSelectorProps> = ({
  onSelect,
  selectedCount,
  onBack,
  progress = 0,
}) => {
  const showerCubicleOptions: ShowerCubicleOption[] = [
    {
      id: '1',
      label: '1 shower cubicle',
    },
    {
      id: '2+',
      label: '2 shower cubicles',
    },
    {
      id: 'none',
      label: '3+ shower cubicles',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">How many separate shower cubicles does it have?</h1>

        <div className="shower-cubicle-selector__radio-options">
          {showerCubicleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`shower-cubicle-selector__radio-option ${
                selectedCount === option.id ? 'shower-cubicle-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="shower-cubicle-selector__radio">
                {selectedCount === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shower-cubicle-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="shower-cubicle-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shower-cubicle-selector__check-icon shower-cubicle-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="shower-cubicle-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default ShowerCubicleSelector;

