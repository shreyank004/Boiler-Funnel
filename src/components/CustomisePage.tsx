import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductPageHeader from './ProductPageHeader';
import './CustomisePage.css';

interface CustomisePageProps {
  formData?: any;
  contactData?: any;
}

interface Bundle {
  id: string;
  name: string;
  isPopular?: boolean;
  price: string;
  savings: string;
  items: Array<{
    name: string;
    worth: string;
  }>;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  price?: string;
  isIncluded?: boolean;
}

const CustomisePage: React.FC<CustomisePageProps> = ({ formData, contactData }) => {
  const navigate = useNavigate();
  const [selectedBundles, setSelectedBundles] = useState<string[]>(['smart']); // Smart bundle selected by default
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);

  const bundles: Bundle[] = [
    {
      id: 'ultimate',
      name: 'Ultimate',
      isPopular: true,
      price: '£365',
      savings: 'Save £130',
      items: [
        { name: 'Hive Mini', worth: 'worth £235' },
        { name: "Heatable's ProFlush", worth: 'worth £195' },
        { name: 'Limescale Reducer', worth: 'worth £65' },
      ],
    },
    {
      id: 'enhanced',
      name: 'Enhanced',
      price: '£215',
      savings: 'Save £85',
      items: [
        { name: 'Hive Mini', worth: 'worth £235' },
        { name: 'Limescale Reducer', worth: 'worth £65' },
      ],
    },
    {
      id: 'smart',
      name: 'Smart',
      price: '£185',
      savings: 'Save £50',
      items: [
        { name: 'Hive Mini', worth: 'worth £235' },
      ],
    },
  ];

  const upgrades: Upgrade[] = [
    {
      id: 'reconnect-smart-controls',
      name: 'Reconnect Smart Controls',
      description: "Already got a smart thermostat? We'll hook them up to your new system",
    },
    {
      id: 'system-flush',
      name: 'System Flush',
      description: 'A chemical flush of your system, with inhibitor protection',
      isIncluded: true,
    },
    {
      id: 'worcester-filter',
      name: 'Worcester Greenstar Magnetic Filter',
      description: 'Protect your new boiler from sludge, and debris',
      isIncluded: true,
    },
    {
      id: 'trv',
      name: 'Thermostatic Radiator Valve (TRV)',
      description: 'Control the temperature of individual radiators',
      price: '£45',
    },
    {
      id: 'limescale-reducer',
      name: 'Limescale Reducer',
      description: 'Protects your new boiler from limescale in hard water areas',
      price: '£65',
    },
    {
      id: 'standard-controls',
      name: 'Standard Controls',
      description: 'An easy to use, wireless programmable thermostat',
      isIncluded: true,
    },
    {
      id: 'proflush',
      name: "Heatable's ProFlush",
      description: 'A deep system clean to improve efficiency & reduce bills',
      price: '£195',
    },
    {
      id: 'hive-mini',
      name: 'Hive Mini',
      description: "A smart thermostat which'll lower your energy bills by up-to £311 a year*",
      price: '£235',
    },
    {
      id: 'co-alarm',
      name: 'Carbon Monoxide Alarm',
      description: 'Get alerted if carbon monoxide levels get too high',
    },
    {
      id: 'gas-certificate',
      name: 'Gas Safety Certificate (CP12)',
      description: 'A check of all gas appliances in the home (required annually for landlords)',
    },
  ];

  const toggleBundle = (bundleId: string) => {
    setSelectedBundles((prev) =>
      prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]
    );
  };

  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgrades((prev) =>
      prev.includes(upgradeId) ? prev.filter((id) => id !== upgradeId) : [...prev, upgradeId]
    );
  };

  return (
    <div className="customise-page">
      <ProductPageHeader currentStep={2} />
      <div className="customise-page__container">
        {/* Back Link */}
        <div className="customise-page__back-link">
          <button onClick={() => navigate('/choose')} className="customise-page__back-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to results</span>
          </button>
        </div>

        {/* Main Header Section */}
        <div className="customise-page__main-header">
          <div className="customise-page__header-left">
            <h1 className="customise-page__main-title">Customise your package</h1>
            <h2 className="customise-page__sub-title">Choose installation bundle</h2>
          </div>
          <div className="customise-page__header-right">
            <div className="customise-page__header-actions">
              <button className="customise-page__save-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save quote
              </button>
              <button 
                className="customise-page__continue-button"
                onClick={() => navigate('/book')}
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="customise-page__upgrade-text">Upgrade and save</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="customise-page__content">
          {/* Smart thermostats and more Section */}
          <div className="customise-page__section">
            <div className="customise-page__section-header">
              <h2 className="customise-page__section-title">Smart thermostats and more</h2>
            </div>
            <div className="customise-page__bundles">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className={`customise-page__bundle-card ${bundle.isPopular ? 'customise-page__bundle-card--popular' : ''}`}>
                    {bundle.isPopular && (
                      <div className="customise-page__bundle-badge">Popular</div>
                    )}
                    <div className="customise-page__bundle-image">
                      <div className="customise-page__bundle-image-placeholder">
                        {bundle.id === 'ultimate' && (
                          <>
                            <div className="customise-page__thermostat">21°</div>
                            <div className="customise-page__limescale-reducer-icon"></div>
                            <div className="customise-page__proflush-icon"></div>
                          </>
                        )}
                        {bundle.id === 'enhanced' && (
                          <>
                            <div className="customise-page__thermostat">21°</div>
                            <div className="customise-page__limescale-reducer-icon"></div>
                          </>
                        )}
                        {bundle.id === 'smart' && (
                          <div className="customise-page__thermostat">21°</div>
                        )}
                      </div>
                    </div>
                    <h3 className="customise-page__bundle-name">{bundle.name}</h3>
                    <ul className="customise-page__bundle-items">
                      {bundle.items.map((item, index) => (
                        <li key={index} className="customise-page__bundle-item">
                          <svg className="customise-page__checkmark" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8L6.5 10.5L12 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="customise-page__bundle-item-name">{item.name}</span>
                          <span className="customise-page__bundle-item-worth">({item.worth})</span>
                        </li>
                      ))}
                    </ul>
                    <a href="#" className="customise-page__more-details" onClick={(e) => e.preventDefault()}>
                      More details
                    </a>
                    <div className="customise-page__bundle-footer">
                      <div className="customise-page__bundle-price-section">
                        <div className="customise-page__bundle-price">{bundle.price}</div>
                        <div className="customise-page__bundle-savings">{bundle.savings}</div>
                      </div>
                      <button
                        className={`customise-page__bundle-button ${selectedBundles.includes(bundle.id) ? 'customise-page__bundle-button--added' : ''}`}
                        onClick={() => toggleBundle(bundle.id)}
                      >
                        {selectedBundles.includes(bundle.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Other upgrades Section */}
          <div className="customise-page__section">
            <div className="customise-page__section-header">
              <h2 className="customise-page__section-title">Other upgrades</h2>
            </div>
            <div className="customise-page__upgrades">
                {upgrades.slice(0, 4).map((upgrade) => (
                  <div key={upgrade.id} className="customise-page__upgrade-card">
                    <div className="customise-page__upgrade-image">
                      <div className="customise-page__upgrade-image-placeholder">
                        {upgrade.id === 'reconnect-smart-controls' && (
                          <div className="customise-page__smart-thermostat-black"></div>
                        )}
                        {upgrade.id === 'system-flush' && (
                          <div className="customise-page__bottles"></div>
                        )}
                        {upgrade.id === 'worcester-filter' && (
                          <div className="customise-page__filter"></div>
                        )}
                        {upgrade.id === 'trv' && (
                          <div className="customise-page__trv"></div>
                        )}
                        {upgrade.id === 'limescale-reducer' && (
                          <div className="customise-page__limescale-reducer"></div>
                        )}
                        {upgrade.id === 'standard-controls' && (
                          <div className="customise-page__standard-thermostat">21°</div>
                        )}
                        {upgrade.id === 'proflush' && (
                          <div className="customise-page__proflush-items"></div>
                        )}
                        {upgrade.id === 'hive-mini' && (
                          <div className="customise-page__hive-mini">21°</div>
                        )}
                      </div>
                    </div>
                    <h3 className="customise-page__upgrade-name">{upgrade.name}</h3>
                    <p className="customise-page__upgrade-description">{upgrade.description}</p>
                    <a href="#" className="customise-page__more-details" onClick={(e) => e.preventDefault()}>
                      More details
                    </a>
                    {upgrade.isIncluded ? (
                      <div className="customise-page__upgrade-included">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 8L6.5 10.5L12 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Included as standard
                      </div>
                    ) : (
                      <>
                        {upgrade.price && (
                          <div className="customise-page__upgrade-price">{upgrade.price}</div>
                        )}
                        <button
                          className={`customise-page__upgrade-button ${selectedUpgrades.includes(upgrade.id) ? 'customise-page__upgrade-button--added' : ''}`}
                          onClick={() => toggleUpgrade(upgrade.id)}
                        >
                          {selectedUpgrades.includes(upgrade.id) ? 'Added' : 'Add'}
                        </button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomisePage;
