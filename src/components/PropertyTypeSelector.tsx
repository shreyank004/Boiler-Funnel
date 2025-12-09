import React from 'react';
import './PropertyTypeSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type PropertyType = 'detached' | 'bungalow' | 'flat-apartment';

interface PropertyOption {
  id: PropertyType;
  label: string;
}

interface PropertyTypeSelectorProps {
  onSelect: (type: PropertyType) => void;
  selectedType?: PropertyType | null;
  onBack?: () => void;
  progress?: number;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  onSelect,
  selectedType,
  onBack,
  progress = 0,
}) => {
  const propertyOptions: PropertyOption[] = [
    {
      id: 'detached',
      label: 'A house',
    },
    {
      id: 'bungalow',
      label: 'A bungalow',
    },
    {
      id: 'flat-apartment',
      label: 'A flat/apartment',
    },
  ];

  const TrustpilotFooter = () => (
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
  );

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">What type of property do you have?</h1>

        <div className="property-type-selector__radio-options">
          {propertyOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`property-type-selector__radio-option ${
                selectedType === option.id ? 'property-type-selector__radio-option--selected' : ''
              }`}
              onClick={() => onSelect(option.id)}
              aria-label={`Select ${option.label}`}
            >
              <div className="property-type-selector__radio">
                {selectedType === option.id ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <div className="property-type-selector__radio-empty"></div>
                )}
              </div>
              <span className="property-type-selector__radio-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default PropertyTypeSelector;

