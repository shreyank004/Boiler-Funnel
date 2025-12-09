import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import ProductPageHeader from './ProductPageHeader';
import { createPaymentIntent, confirmPayment } from '../utils/api';
import './CompletePage.css';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1KU022PWcmotn3tG5GqKpZmNHj0zKeu93fAo36F6ZuXgvVnO3yvrT65sQ0cKxe8Y0yRa7lAwyfAcf1NF4ggPGf00dtXCPETL');

interface CompletePageProps {
  formData?: any;
  contactData?: any;
  selectedDate?: Date | null;
}

interface SelectedProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  monthlyPayment?: string;
}


const PaymentForm: React.FC<{ amount: number; submissionId?: string; onSuccess: () => void }> = ({ amount, submissionId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {

    const createIntent = async () => {
      try {
        const result = await createPaymentIntent(amount, submissionId);
        setClientSecret(result.clientSecret);
        setPaymentError(null); 
      } catch (error: any) {
        console.error('Payment intent creation error:', error);
        const errorMessage = error.message || 'Failed to initialize payment. Please check if the backend server is running.';
        setPaymentError(errorMessage);
      }
    };
    createIntent();
  }, [amount, submissionId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {

        try {
          await confirmPayment(paymentIntent.id, submissionId);
          setPaymentSuccess(true);
        
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } catch (error: any) {
          setPaymentError('Payment succeeded but failed to update records. Please contact support.');
        }
        setIsProcessing(false);
      }
    } catch (error: any) {
      setPaymentError(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (paymentSuccess) {
    return (
      <div className="complete-page__payment-success">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="#10b981"/>
          <path d="M16 24L22 30L32 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Payment Successful!</h3>
        <p>Redirecting to confirmation page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="complete-page__stripe-form">
      <div className="complete-page__card-element-wrapper">
        <CardElement options={cardElementOptions} />
      </div>
      {paymentError && (
        <div className="complete-page__payment-error">
          {paymentError}
        </div>
      )}
      <button
        type="submit"
        className="complete-page__pay-button"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <svg className="complete-page__spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="24"/>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 6V4C7 2.89543 7.89543 2 9 2H11C12.1046 2 13 2.89543 13 4V6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Pay £{amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

const CompletePage: React.FC<CompletePageProps> = ({ formData, contactData, selectedDate }) => {
  const navigate = useNavigate();
  
  // Get selected date from props or localStorage
  const getSelectedDate = (): Date | null => {
    if (selectedDate) return selectedDate;
    const storedDate = localStorage.getItem('selectedInstallDate');
    return storedDate ? new Date(storedDate) : new Date(2024, 11, 15); // Default to Dec 15, 2024 for demo
  };

  const installDate = getSelectedDate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'finance' | 'klarna'>('card');
  const [discountCode, setDiscountCode] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  
  // Get submission ID from localStorage if available
  const submissionId = localStorage.getItem('submissionId') || undefined;
  
  // Load selected product from localStorage
  useEffect(() => {
    const storedProduct = localStorage.getItem('selectedProduct');
    if (storedProduct) {
      try {
        setSelectedProduct(JSON.parse(storedProduct));
      } catch (error) {
        console.error('Error parsing selected product from localStorage:', error);
      }
    }
  }, []);


  const extractPrice = (priceString: string): number => {
    return parseFloat(priceString.replace(/[£,]/g, ''));
  };

  const getSurcharge = (): number => {
    const storedSurcharge = localStorage.getItem('dateSurcharge');
    return storedSurcharge ? parseFloat(storedSurcharge) : 0;
  };


  const basePrice = selectedProduct ? extractPrice(selectedProduct.price) : 2600.00;
  const surcharge = getSurcharge();
  const totalPrice = surcharge > 0 ? basePrice + surcharge : basePrice;

  const handlePaymentSuccess = () => {
    navigate('/thank-you');
  };

  const faqs = [
    {
      question: "Can I get a new boiler on finance?",
      answer: "Yes, we offer flexible finance options to help spread the cost of your new boiler."
    },
    {
      question: "Do I need scaffolding to install a boiler?",
      answer: "Scaffolding requirements depend on your property type and boiler location. Our engineers will assess this during the survey."
    },
    {
      question: "Is your calendar guaranteed after I've picked my date?",
      answer: "Yes, once you've selected and confirmed your installation date, it's guaranteed subject to survey approval."
    },
    {
      question: "Who'll be installing my boiler?",
      answer: "All installations are carried out by our team of Gas Safe registered engineers."
    },
    {
      question: "What if I change my mind, or need to cancel?",
      answer: "You can cancel your order within 14 days of purchase for a full refund, subject to our terms and conditions."
    },
    {
      question: "Can I get finance with poor credit?",
      answer: "We work with multiple finance providers to offer options for various credit situations. Apply to see what's available."
    },
    {
      question: "How long does it take to install a replacement boiler?",
      answer: "Most boiler installations take 1-2 days to complete, depending on the complexity of the job."
    },
    {
      question: "When buying a new boiler through Heatable, am I protected?",
      answer: "Yes, all our boilers come with manufacturer warranties, and we're a Which? Trusted Trader."
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatSelectedDate = () => {
    if (!installDate) return null;
    const day = installDate.getDate();
    const dayShort = installDate.toLocaleDateString('en-GB', { weekday: 'short' }).substring(0, 3);
    const dayFull = installDate.toLocaleDateString('en-GB', { weekday: 'long' });
    const monthShort = installDate.toLocaleDateString('en-GB', { month: 'short' });
    const ordinal = getOrdinalSuffix(day);
    return { dayShort, dayFull, monthShort, day, ordinal };
  };

  const dateInfo = formatSelectedDate();

  return (
    <Elements stripe={stripePromise}>
      <div className="complete-page">
        <ProductPageHeader currentStep={4} />
      <div className="complete-page__container">
        <h1 className="complete-page__title">Complete your order</h1>

        <div className="complete-page__content">
          <div className="complete-page__left-column">
            <div className="complete-page__help-section">
              <div className="complete-page__help-header">
                <div className="complete-page__help-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 14V10M10 6H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="complete-page__help-title">Help & info</h2>
              </div>

              <div className="complete-page__faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="complete-page__faq-item">
                    <button
                      className="complete-page__faq-question"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      <svg
                        className={`complete-page__faq-chevron ${expandedFaq === index ? 'complete-page__faq-chevron--expanded' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {expandedFaq === index && (
                      <div className="complete-page__faq-answer">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <a href="#" className="complete-page__ask-link" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 5.5C5.5 6.32843 6.17157 7 7 7H8C8.82843 7 9.5 7.67157 9.5 8.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
                </svg>
                Ask a question
              </a>
            </div>

            <div className="complete-page__trustpilot">
              <div className="complete-page__trustpilot-rating">
                <span className="complete-page__trustpilot-text">Excellent</span>
                <div className="complete-page__trustpilot-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 0L10.163 5.528L16 6.112L12 9.944L12.944 16L8 13.056L3.056 16L4 9.944L0 6.112L5.837 5.528L8 0Z" fill="#00B67A"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="complete-page__trustpilot-reviews">
                12,801 reviews on Trustpilot
              </div>
            </div>
          </div>


          <div className="complete-page__middle-column">
            <div className="complete-page__payment-section">
              <h2 className="complete-page__payment-title">
                Pay by card, or spread the cost with low monthly payments
              </h2>


              <div className="complete-page__discount-section">
                <input
                  type="text"
                  className="complete-page__discount-input"
                  placeholder="Enter a discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className="complete-page__discount-button">Apply</button>
              </div>


              <div className="complete-page__payment-methods">
                <div className={`complete-page__payment-method ${selectedPaymentMethod === 'card' ? 'complete-page__payment-method--selected' : ''}`}>
                  <label className="complete-page__payment-radio">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={() => setSelectedPaymentMethod('card')}
                    />
                    <span className="complete-page__payment-label">Pay by card</span>
                    {selectedPaymentMethod === 'card' && (
                      <svg className="complete-page__payment-check" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="#10b981"/>
                        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </label>

                  {selectedPaymentMethod === 'card' && (
                    <div className="complete-page__card-form">
                      <div className="complete-page__total-price">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4H18V16H2V4Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 10H7" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span className="complete-page__total-badge">5</span>
                        <span>Total price £{totalPrice.toFixed(2)}</span>
                      </div>

                      <div className="complete-page__card-acceptance">
                        <span>We accept all major credit and debit cards</span>
                        <div className="complete-page__card-logos">
                          <span className="complete-page__visa-logo">VISA</span>
                          <span className="complete-page__amex-logo">AMEX</span>
                        </div>
                      </div>

                      <PaymentForm amount={totalPrice} submissionId={submissionId} onSuccess={handlePaymentSuccess} />

                      <div className="complete-page__payment-terms">
                        By proceeding you agree to our privacy policy and terms.
                      </div>
                    </div>
                  )}
                </div>

              
                <div className={`complete-page__payment-method ${selectedPaymentMethod === 'finance' ? 'complete-page__payment-method--selected' : ''}`}>
                  <label className="complete-page__payment-radio">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'finance'}
                      onChange={() => setSelectedPaymentMethod('finance')}
                    />
                    <span className="complete-page__payment-label">Finance</span>
                  </label>
                </div>

              
                <div className={`complete-page__payment-method ${selectedPaymentMethod === 'klarna' ? 'complete-page__payment-method--selected' : ''}`}>
                  <label className="complete-page__payment-radio">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === 'klarna'}
                      onChange={() => setSelectedPaymentMethod('klarna')}
                    />
                    <span className="complete-page__payment-label">Klarna</span>
                    <span className="complete-page__klarna-logo">Klarna</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          
          <div className="complete-page__right-column">
            <div className="complete-page__order-summary">
              <div className="complete-page__summary-section">
                <h3 className="complete-page__summary-title">Install total</h3>
                <div className="complete-page__summary-price">
                  <div className="complete-page__price-row">
                    <span className="complete-page__price-label">Fixed price (inc. VAT)</span>
                    <div className="complete-page__price-wrapper">
                      <div className="complete-page__price-amount">
                        {selectedProduct?.originalPrice && (
                          <span className="complete-page__price-original">{selectedProduct.originalPrice}</span>
                        )}
                        <span className="complete-page__price-current">
                          {selectedProduct 
                            ? new Intl.NumberFormat('en-GB', {
                                style: 'currency',
                                currency: 'GBP',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(surcharge > 0 ? basePrice + surcharge : basePrice)
                            : '£2,600'}
                        </span>
                      </div>
                      {surcharge > 0 && (
                        <span className="complete-page__price-surcharge">
                          (includes +£{surcharge} surcharge)
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedProduct?.monthlyPayment && (
                    
                    <div className="complete-page__price-row">
                      <span className="complete-page__price-label">or, monthly from</span>
                      <div className="complete-page__price-dropdown">
                        <span className="complete-page__price-monthly">{selectedProduct.monthlyPayment}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <button className="complete-page__whats-included-button">
                  What's included in my installation?
                </button>
              </div>

              
              <div className="complete-page__summary-section">
                <div className="complete-page__payment-options">
                  <div className="complete-page__payment-option">
                    <div className="complete-page__payment-icon complete-page__payment-icon--green">%</div>
                    <span className="complete-page__payment-text">Low rate finance</span>
                  </div>
                  <div className="complete-page__payment-option">
                    <div className="complete-page__payment-icon complete-page__payment-icon--pink">K</div>
                    <span className="complete-page__payment-text">Klarna pay later</span>
                  </div>
                  <div className="complete-page__payment-option">
                    <div className="complete-page__payment-icon complete-page__payment-icon--blue">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 10H7" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <span className="complete-page__payment-text">All cards, no fees</span>
                  </div>
                </div>
              </div>

        
              <div className="complete-page__summary-section">
                <div className="complete-page__summary-header">
                  <h3 className="complete-page__summary-title">Your package</h3>
                  <a href="#" className="complete-page__summary-change" onClick={(e) => e.preventDefault()}>
                    Change
                  </a>
                </div>
                <div className="complete-page__package-item">
                  <div className="complete-page__package-image">
                    <div className="complete-page__boiler-icon"></div>
                  </div>
                  <div className="complete-page__package-details">
                    <div className="complete-page__package-name">
                      {selectedProduct ? `${selectedProduct.brand} ${selectedProduct.name}` : 'Worcester Bosch Greenstar 4000 25kW'}
                    </div>
                    <div className="complete-page__package-warranty">10 years warranty</div>
                  </div>
                </div>
              </div>

             
              {dateInfo && (
                <div className="complete-page__summary-section">
                  <div className="complete-page__summary-header">
                    <h3 className="complete-page__summary-title">Your install date</h3>
                    <a href="#" className="complete-page__summary-change" onClick={(e) => e.preventDefault()}>
                      Change
                    </a>
                  </div>
                  <div className="complete-page__install-date">
                    <div className="complete-page__date-box">
                      <div className="complete-page__date-day-short">{dateInfo.dayShort}</div>
                      <div className="complete-page__date-number">{dateInfo.day}{dateInfo.ordinal}</div>
                    </div>
                    <div className="complete-page__date-full">
                      {dateInfo.dayFull} {dateInfo.day}{dateInfo.ordinal} {dateInfo.monthShort}
                    </div>
                  </div>
                </div>
              )}

         
              <div className="complete-page__summary-section">
                <h3 className="complete-page__summary-title">Your installation</h3>
                <div className="complete-page__installation-items">
                  <div className="complete-page__package-item">
                    <div className="complete-page__package-image">
                      <div className="complete-page__bottles-icon"></div>
                    </div>
                    <div className="complete-page__package-details">
                      <div className="complete-page__package-name">
                        System Flush
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="complete-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="complete-page__package-description">
                        A chemical flush of your system, with inhibitor protection.
                      </div>
                    </div>
                  </div>
                  <div className="complete-page__package-item">
                    <div className="complete-page__package-image">
                      <div className="complete-page__filter-icon"></div>
                    </div>
                    <div className="complete-page__package-details">
                      <div className="complete-page__package-name">
                        Worcester Greenstar Magnetic Filter
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="complete-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="complete-page__package-description">
                        Protect your new boiler from sludge, and debris.
                      </div>
                    </div>
                  </div>
                  <div className="complete-page__package-item">
                    <div className="complete-page__package-image">
                      <div className="complete-page__alarm-icon"></div>
                    </div>
                    <div className="complete-page__package-details">
                      <div className="complete-page__package-name">
                        Carbon Monoxide Alarm
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="complete-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="complete-page__package-description">
                        Get alerted if carbon monoxide levels get too high.
                      </div>
                    </div>
                  </div>
                  <div className="complete-page__package-item">
                    <div className="complete-page__package-image">
                      <div className="complete-page__gas-safe-icon"></div>
                    </div>
                    <div className="complete-page__package-details">
                      <div className="complete-page__package-name">
                        Gas safe installation
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="complete-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="complete-page__package-description">
                        Full removal and replacement of existing combi boiler.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Elements>
  );
};

export default CompletePage;