import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProductPageHeader.css';

interface ProductPageHeaderProps {
  currentStep?: number; // 1 = Choose, 2 = Customise, 3 = Book, 4 = Complete
}

const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({ currentStep }) => {
  const location = useLocation();
  
  // Determine current step from URL if not provided
  const getStepFromPath = (path: string): number => {
    if (path.includes('/complete')) return 4;
    if (path.includes('/book')) return 3;
    if (path.includes('/customise')) return 2;
    return 1; // default to Choose
  };
  
  const activeStep = currentStep || getStepFromPath(location.pathname);
  
  const steps = [
    { number: 1, label: 'Choose', path: '/choose' },
    { number: 2, label: 'Customise', path: '/customise' },
    { number: 3, label: 'Book', path: '/book' },
    { number: 4, label: 'Complete', path: '/complete' },
  ];

  return (
    <header className="product-page-header">
      <div className="product-page-header__container">
        {/* Logo */}
        <div className="product-page-header__logo">
          <div className="product-page-header__logo-icon">
          </div>
          <span className="product-page-header__logo-text">Test</span>
        </div>

        {/* Progress Steps */}
        <div className="product-page-header__steps">
          {steps.map((step, index) => {
            const isActive = step.number === activeStep;
            const isCompleted = step.number < activeStep;
            // Allow navigation to all completed steps, current step, and next step
            const isClickable = step.number <= activeStep + 1;
            
            return (
              <React.Fragment key={step.number}>
                {index > 0 && (
                  <div className={`product-page-header__arrow ${isCompleted ? 'product-page-header__arrow--completed' : ''}`}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 1L6 4L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {isClickable ? (
                  <Link 
                    to={step.path}
                    className={`product-page-header__step-link ${isActive ? 'product-page-header__step-link--active' : ''} ${isCompleted ? 'product-page-header__step-link--completed' : ''}`}
                  >
                    <div className={`product-page-header__step ${isActive ? 'product-page-header__step--active' : ''} ${isCompleted ? 'product-page-header__step--completed' : ''}`}>
                      <div className={`product-page-header__step-circle ${isActive ? 'product-page-header__step-circle--active' : ''} ${isCompleted ? 'product-page-header__step-circle--completed' : ''}`}>
                        {isCompleted ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8L6.5 10.5L12 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </div>
                      <span className={`product-page-header__step-label ${isActive ? 'product-page-header__step-label--active' : ''}`}>
                        {step.label}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className={`product-page-header__step ${isActive ? 'product-page-header__step--active' : ''}`}>
                    <div className={`product-page-header__step-circle ${isActive ? 'product-page-header__step-circle--active' : ''}`}>
                      <span>{step.number}</span>
                    </div>
                    <span className={`product-page-header__step-label ${isActive ? 'product-page-header__step-label--active' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="product-page-header__right">
          {/* Which? Trusted Trader Badge */}
          <div className="product-page-header__badge">
            <div className="product-page-header__badge-content">
              <span className="product-page-header__badge-title">Which?</span>
              <span className="product-page-header__badge-dot">●</span>
            </div>
            <span className="product-page-header__badge-subtitle">Trusted Trader</span>
          </div>

          {/* Help Button */}
          <button className="product-page-header__help-button">
            <span>Help</span>
            <span className="product-page-header__help-emoji">☺</span>
          </button>

          {/* Shopping Basket */}
          <button className="product-page-header__basket">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="currentColor"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="currentColor"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19C19.5304 16 20.0391 15.7893 20.4142 15.4142C20.7893 15.0391 21 14.5304 21 14V6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="product-page-header__basket-badge">1</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProductPageHeader;

