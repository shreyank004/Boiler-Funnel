import React, { useState, useEffect } from 'react';
import './FuelSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

type FuelType = 'mains-gas' | 'lpg' | 'unknown-fuel';

interface FuelSelectorProps {
  onSelect: (fuelType: FuelType) => void;
  selectedFuel?: FuelType | null;
  onBack?: () => void;
  progress?: number;
}

const FuelSelector: React.FC<FuelSelectorProps> = ({ onSelect, selectedFuel: selectedFuelProp, onBack, progress = 0 }) => {
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(selectedFuelProp || null);

  const handleSelect = (fuelType: FuelType) => {
    setSelectedFuel(fuelType);
    onSelect(fuelType);
  };

  useEffect(() => {
    if (selectedFuelProp !== undefined) {
      setSelectedFuel(selectedFuelProp);
    }
  }, [selectedFuelProp]);

  return (
    <div className="fuel-selector">
      <Header progress={progress} />

      <div className="fuel-selector__content">
        <h1 className="fuel-selector__question">Does your boiler run on mains gas?</h1>
        <p className="fuel-selector__helper">You'll likely have a gas bill and a gas meter</p>

        <div className="fuel-selector__options">
          <button
            type="button"
            className={`fuel-selector__option ${
              selectedFuel === 'mains-gas' ? 'fuel-selector__option--selected' : ''
            }`}
            onClick={() => handleSelect('mains-gas')}
          >
            <div className="fuel-selector__radio">
              {selectedFuel === 'mains-gas' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fuel-selector__check-icon">
                  <circle cx="12" cy="12" r="10" fill="white"/>
                  <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <>
                  <div className="fuel-selector__radio-empty"></div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fuel-selector__check-icon fuel-selector__check-icon--hover">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </div>
            <span className="fuel-selector__option-label">Main Gas</span>
          </button>

          <button
            type="button"
            className={`fuel-selector__option ${
              selectedFuel === 'lpg' ? 'fuel-selector__option--selected' : ''
            }`}
            onClick={() => handleSelect('lpg')}
          >
            <div className="fuel-selector__radio">
              {selectedFuel === 'lpg' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fuel-selector__check-icon">
                  <circle cx="12" cy="12" r="10" fill="white"/>
                  <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <>
                  <div className="fuel-selector__radio-empty"></div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fuel-selector__check-icon fuel-selector__check-icon--hover">
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path d="M8 12L11 15L16 9" stroke="#1e883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </div>
            <span className="fuel-selector__option-label">LPG</span>
          </button>
        </div>

        <div className="fuel-selector__info-box">
          <div className="fuel-selector__info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#065f46"/>
              <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="fuel-selector__info-content">
            <p>
              Mains gas boilers are most common across the UK. If you have a gas meter, a gas bill, or a gas cooker, your boiler probably runs on gas. Need help? Call{' '}
              <a href="tel:03301131333" className="fuel-selector__info-link">0330 113 1333</a>.
            </p>
          </div>
        </div>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default FuelSelector;

