import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ThankYouPage.css';

interface ThankYouPageProps {
  formData?: any;
  contactData?: any;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ formData, contactData }) => {
  const navigate = useNavigate();

  return (
    <div className="thank-you-page">
      <div className="thank-you-page__container">
        {/* Main Content Card */}
        <div className="thank-you-page__card">
          <div className="thank-you-page__header">
            <div className="thank-you-page__icon">👍</div>
            <h1 className="thank-you-page__title">Payment successful</h1>
          </div>
          
          <p className="thank-you-page__message">
            Thank you for your order! Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>

          {/* Contact Options */}
          <div className="thank-you-page__contact-options">
            <div className="thank-you-page__contact-option">
              <div className="thank-you-page__contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="thank-you-page__contact-content">
                <p className="thank-you-page__contact-label">Chat with us</p>
                <a href="#" className="thank-you-page__contact-link" onClick={(e) => { e.preventDefault(); }}>
                  Start chat
                </a>
              </div>
            </div>

            <div className="thank-you-page__contact-option">
              <div className="thank-you-page__contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2126 21.3522 21.3992C21.1472 21.5858 20.9053 21.7262 20.6426 21.811C20.3799 21.8957 20.1025 21.9231 19.8282 21.891C17.2632 21.6556 14.7621 20.9192 12.45 19.72C10.1788 18.5857 8.14649 16.9989 6.47 15.05C4.79351 13.1011 3.41434 10.8238 2.41 8.33C2.27499 7.99729 2.20314 7.64389 2.19781 7.28667C2.19248 6.92945 2.25378 6.57451 2.37881 6.24C2.50384 5.90549 2.69018 5.59767 2.92881 5.33C3.16744 5.06233 3.45389 4.83967 3.77381 4.67333L6.77381 3.34333C7.05019 3.22826 7.35288 3.18198 7.65381 3.20833C7.95474 3.23468 8.24559 3.33289 8.50381 3.49633L11.1838 5.25633C11.4415 5.42015 11.6582 5.64288 11.8162 5.90633C11.9742 6.16978 12.0691 6.46652 12.0938 6.77333V10.2733C12.0691 10.5801 11.9742 10.8769 11.8162 11.1403C11.6582 11.4038 11.4415 11.6265 11.1838 11.7903L8.50381 13.5503C8.24559 13.7138 7.95474 13.812 7.65381 13.8383C7.35288 13.8647 7.05019 13.8184 6.77381 13.7033L4.09381 12.4433" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="thank-you-page__contact-content">
                <p className="thank-you-page__contact-label">Give us a call</p>
                <a href="tel:03301131333" className="thank-you-page__contact-link">
                  0330 113 1333
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="thank-you-page__footer">
          <div className="thank-you-page__footer-content">
            <div className="thank-you-page__footer-text">
              <p>© 2025 Heatable.</p>
              <p>Heatable Ltd is registered in England and Wales No. 08804726. Registered office is Glebe Business Park, Lunts Heath Road, Widnes, Cheshire, WA8 5SQ.</p>
              <p className="thank-you-page__footer-fca">
                Heatable Ltd is authorised and regulated by the Financial Conduct Authority, FRN 805259 We are a credit broker and not a lender and offer credit from a panel of lenders. We may receive commission if your application is successful and the amount may vary depending on the product chosen and the amount of credit taken out. Credit is provided subject to affordability, age and status. Minimum spend applies. Not all products offered are regulated by the Financial Conduct Authority.
              </p>
            </div>
            <div className="thank-you-page__footer-badges">
              <div className="thank-you-page__badge">
                <div className="thank-you-page__badge-circle">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4L6 11L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>CYBER ESSENTIALS</span>
              </div>
              <div className="thank-you-page__badge">
                <div className="thank-you-page__badge-square">
                  <span>safe</span>
                </div>
              </div>
              <div className="thank-you-page__badge">
                <div className="thank-you-page__badge-square">
                  <span>MCS</span>
                  <span className="thank-you-page__badge-certified">CERTIFIED</span>
                </div>
              </div>
              <div className="thank-you-page__badge">
                <div className="thank-you-page__badge-which">
                  <span>Which?</span>
                  <span className="thank-you-page__badge-trader">Trusted Trader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;

