import React from 'react';
import './BoilerTypeSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type BoilerType = 'combi' | 'regular' | 'system' | 'back-boiler';

interface BoilerOption {
  id: BoilerType;
  label: string;
}

interface BoilerTypeSelectorProps {
  onSelect: (type: BoilerType) => void;
  selectedType?: BoilerType | null;
  onBack?: () => void;
  progress?: number;
}

const BoilerTypeSelector: React.FC<BoilerTypeSelectorProps> = ({
  onSelect,
  selectedType,
  onBack,
  progress = 0,
}) => {
  const boilerOptions: BoilerOption[] = [
    {
      id: 'combi',
      label: 'Combi boiler',
    },
    {
      id: 'regular',
      label: 'Regular/Standard boiler',
    },
    {
      id: 'system',
      label: 'System boiler',
    },
    {
      id: 'back-boiler',
      label: 'Back boiler',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">What type of boiler do you currently have?</h1>

        <div className="boiler-type-selector__radio-options">
          {boilerOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`boiler-type-selector__radio-option ${
                selectedType === option.id ? 'boiler-type-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="boiler-type-selector__radio">
                {selectedType === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="boiler-type-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="boiler-type-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="boiler-type-selector__check-icon boiler-type-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="boiler-type-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="boiler-type-selector__info-box">
          <div className="boiler-type-selector__info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#065f46"/>
              <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="boiler-type-selector__info-content">
            <p>
              Combi boilers are the most common type of boiler in the UK. Regular/system boilers have separate hot water storage cylinders, while combi boilers provide hot water on demand directly from the mains.
            </p>
          </div>
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default BoilerTypeSelector;

