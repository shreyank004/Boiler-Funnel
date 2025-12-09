import React, { useState } from 'react';
import './ContactForm.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

interface ContactFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agreedToTerms: boolean;
  }) => void;
  onBack?: () => void;
  progress?: number;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, onBack, progress = 0 }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhone = (phoneValue: string): boolean => {
    if (!phoneValue) {
      setPhoneError('Phone number is required');
      return false;
    }
    const cleanedPhone = phoneValue.replace(/[\s\-\(\)\+]/g, '');
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setPhoneError('Please enter a valid phone number (7-15 digits)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (phoneError) {
      validatePhone(value);
    }
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePhoneBlur = () => {
    validatePhone(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    
    if (agreedToTerms && firstName && lastName && isEmailValid && isPhoneValid) {
      onSubmit({
        firstName,
        lastName,
        email,
        phone,
        agreedToTerms,
      });
    }
  };

  const isFormValid = () => {
    return (
      agreedToTerms &&
      firstName &&
      lastName &&
      email &&
      phone &&
      !emailError &&
      !phoneError
    );
  };

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">
          Your boiler options are now available
        </h1>
        <p className="selector-common__helper">
          To display your boiler choices & prices, we simply require the below information:
        </p>

        <form onSubmit={handleSubmit} className="contact-form__form">
          <div className="contact-form__input-group">
            <label className="contact-form__label">
              First name <span className="contact-form__asterisk">*</span>
            </label>
            <input
              type="text"
              className="contact-form__input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              aria-label="First Name"
            />
          </div>

          <div className="contact-form__input-group">
            <label className="contact-form__label">
              Last name <span className="contact-form__asterisk">*</span>
            </label>
            <input
              type="text"
              className="contact-form__input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              aria-label="Last Name"
            />
          </div>

          <div className="contact-form__input-group">
            <label className="contact-form__label">
              Email address <span className="contact-form__asterisk">*</span>
            </label>
            <input
              type="email"
              className={`contact-form__input ${emailError ? 'contact-form__input--error' : ''}`}
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              required
              aria-label="Email Address"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <span id="email-error" className="contact-form__error" role="alert">
                {emailError}
              </span>
            )}
          </div>

          <div className="contact-form__input-group">
            <label className="contact-form__label">
              Contact number <span className="contact-form__asterisk">*</span>
            </label>
            <input
              type="tel"
              className={`contact-form__input ${phoneError ? 'contact-form__input--error' : ''}`}
              placeholder="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              required
              aria-label="Contact Number"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
            />
            {phoneError && (
              <span id="phone-error" className="contact-form__error" role="alert">
                {phoneError}
              </span>
            )}
          </div>

          <div className="contact-form__separator"></div>

          <div className="contact-form__promise">
            <div className="contact-form__promise-header">
              <div className="contact-form__info-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="10" r="9" fill="#1e293b" />
                  <text
                    x="10"
                    y="14"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontFamily="Arial, sans-serif"
                  >
                    i
                  </text>
                </svg>
              </div>
              <h3 className="contact-form__promise-title">OUR PROMISE TO YOU:</h3>
            </div>
            <ul className="contact-form__promise-list">
              <li className="contact-form__promise-item">
                <div className="contact-form__check-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="10" r="9" fill="#22c55e" />
                    <path
                      d="M6 10L9 13L14 7"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>We promise we won't inundate you</span>
              </li>
              <li className="contact-form__promise-item">
                <div className="contact-form__check-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="10" r="9" fill="#22c55e" />
                    <path
                      d="M6 10L9 13L14 7"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>We'll keep it relevant</span>
              </li>
              <li className="contact-form__promise-item">
                <div className="contact-form__check-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="10" r="9" fill="#22c55e" />
                    <path
                      d="M6 10L9 13L14 7"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>We'll never share your details</span>
              </li>
            </ul>
          </div>

          <div className="contact-form__terms">
            <input
              type="checkbox"
              id="terms-checkbox"
              className="contact-form__checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms-checkbox" className="contact-form__terms-label">
              I agree with{' '}
              <a href="#" className="contact-form__link">
                terms conditions
              </a>{' '}
              and{' '}
              <a href="#" className="contact-form__link">
                privacy policy
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            className="contact-form__button"
            disabled={!isFormValid()}
          >
            Show Boilers
          </button>
        </form>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default ContactForm;

