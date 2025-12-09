import React from 'react';
import './BoilerReplacementTimingSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type ReplacementTiming = 'asap' | 'this-week' | 'next-week';

interface TimingOption {
  id: ReplacementTiming;
  label: string;
}

interface BoilerReplacementTimingSelectorProps {
  onSelect: (timing: ReplacementTiming) => void;
  selectedTiming?: ReplacementTiming | null;
  onBack?: () => void;
  progress?: number;
}

const BoilerReplacementTimingSelector: React.FC<BoilerReplacementTimingSelectorProps> = ({
  onSelect,
  selectedTiming,
  onBack,
  progress = 0,
}) => {
  const timingOptions: TimingOption[] = [
    {
      id: 'asap',
      label: 'ASAP (within 24 hours)',
    },
    {
      id: 'this-week',
      label: 'This week (within 7 days)',
    },
    {
      id: 'next-week',
      label: 'Next week onwards (7+ days)',
    },
  ];

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">When are you thinking about replacing your boiler?</h1>

        <div className="boiler-replacement-timing-selector__radio-options">
          {timingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`boiler-replacement-timing-selector__radio-option ${
                selectedTiming === option.id ? 'boiler-replacement-timing-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="boiler-replacement-timing-selector__radio">
                {selectedTiming === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="boiler-replacement-timing-selector__check-icon">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <>
                    <div className="boiler-replacement-timing-selector__radio-empty"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="boiler-replacement-timing-selector__check-icon boiler-replacement-timing-selector__check-icon--hover">
                      <circle cx="12" cy="12" r="10" fill="white"/>
                      <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </div>
              <span className="boiler-replacement-timing-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default BoilerReplacementTimingSelector;

