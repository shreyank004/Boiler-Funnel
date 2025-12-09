import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductPageHeader from './ProductPageHeader';
import './BookPage.css';

interface BookPageProps {
  formData?: any;
  contactData?: any;
}

interface SelectedProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  monthlyPayment?: string;
}

const BookPage: React.FC<BookPageProps> = ({ formData, contactData }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [dateError, setDateError] = useState<string>('');

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
  
  const [bookingForm, setBookingForm] = useState({
    title: '',
    firstName: contactData?.firstName || '',
    lastName: contactData?.lastName || '',
    email: contactData?.email || '',
    phone: contactData?.phone || '',
    address: formData?.address || '',
    notes: '',
  });

  // Calendar logic
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDateStatus = (date: number): 'unavailable' | 'full' | 'surcharge' | 'available' => {
    // Mock logic for date availability
    if (date <= 4) return 'unavailable';
    if (date === 5 || date === 6 || date === 25 || date === 26) return 'full';
    if (date === 13 || date === 20 || date === 27) return 'surcharge';
    return 'available';
  };

  // Get surcharge amount for a specific date
  const getSurchargeAmount = (date: Date | null): number => {
    if (!date) return 0;
    const dateNum = date.getDate();
    const status = getDateStatus(dateNum);
    if (status === 'surcharge') {
      return 85; // £85 surcharge
    }
    return 0;
  };

  // Extract numeric price from string like "£2,340"
  const extractPrice = (priceString: string): number => {
    return parseFloat(priceString.replace(/[£,]/g, ''));
  };

  // Calculate total price including surcharge
  const calculateTotalPrice = (): string => {
    const basePrice = selectedProduct ? extractPrice(selectedProduct.price) : 2550;
    const surcharge = getSurchargeAmount(selectedDate);
    const total = basePrice + surcharge;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(total);
  };

  const handleDateClick = (date: number) => {
    const status = getDateStatus(date);
    if (status === 'available' || status === 'surcharge') {
      setSelectedDate(new Date(currentYear, currentMonth, date));
      setDateError(''); // Clear error when date is selected
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Adjust firstDay for 6-day week (Mon-Sat, no Sunday)
    // If first day is Sunday (0), skip it and start on Monday
    let adjustedFirstDay = firstDay;
    if (firstDay === 6) {
      adjustedFirstDay = 0; // Sunday becomes Monday
    }

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="book-page__calendar-day book-page__calendar-day--empty"></div>);
    }

    // Add cells for each day of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dateObj = new Date(currentYear, currentMonth, date);
      const dayOfWeek = dateObj.getDay();
      
      // Skip Sundays (day 0)
      if (dayOfWeek === 0) {
        continue;
      }
      
      const status = getDateStatus(date);
      const isSelected = selectedDate && 
        selectedDate.getDate() === date && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      
      days.push(
        <div
          key={date}
          className={`book-page__calendar-day 
            ${status === 'unavailable' ? 'book-page__calendar-day--unavailable' : ''}
            ${status === 'full' ? 'book-page__calendar-day--full' : ''}
            ${status === 'surcharge' ? 'book-page__calendar-day--surcharge' : ''}
            ${status === 'available' ? 'book-page__calendar-day--available' : ''}
            ${isSelected ? 'book-page__calendar-day--selected' : ''}
          `}
          onClick={() => handleDateClick(date)}
        >
          <span className="book-page__calendar-date">{date}</span>
          {status === 'full' && <span className="book-page__calendar-label">Full</span>}
          {status === 'surcharge' && <span className="book-page__calendar-label">+£85</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="book-page">
      <ProductPageHeader currentStep={3} />
      <div className="book-page__container">
        {/* Back Link */}
        <div className="book-page__back-link">
          <button onClick={() => navigate('/customise')} className="book-page__back-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to customise</span>
          </button>
        </div>

        {/* Main Heading */}
        <h1 className="book-page__title">Book your install</h1>

        {/* Three Column Layout */}
        <div className="book-page__content">
          {/* Left Column - Calendar */}
          <div className="book-page__left-column">
            {/* Calendar Section */}
            <div className="book-page__calendar-section">
              <div className="book-page__calendar-header">
                <button className="book-page__calendar-nav" onClick={handlePrevMonth}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h2 className="book-page__calendar-month">{monthNames[currentMonth]} {currentYear}</h2>
                <button className="book-page__calendar-nav" onClick={handleNextMonth}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="book-page__calendar-weekdays">
                {dayNames.map(day => (
                  <div key={day} className="book-page__calendar-weekday">
                    {day}
                    {day === 'Fri' && <span className="book-page__calendar-dot"></span>}
                  </div>
                ))}
              </div>

              <div className="book-page__calendar-grid">
                {renderCalendar()}
              </div>

              <div className="book-page__calendar-info">
                Your installation should take 1-2 days to complete, and our installers will be on site between 8-10am.
              </div>
              <div className="book-page__calendar-contact">
                Don't see the date you want? <a href="tel:03301131333" className="book-page__contact-link">Call 0330 113 1333</a> or <a href="#" className="book-page__contact-link" onClick={(e) => e.preventDefault()}>start a live chat</a>.
              </div>
            </div>
          </div>

          {/* Middle Column - Form */}
          <div className="book-page__middle-column">
            {/* Form Section */}
            <div className="book-page__form-section">
              <div className="book-page__form-row">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Title *</label>
                  <select
                    className="book-page__form-select"
                    value={bookingForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    <option value="mr">Mr</option>
                    <option value="mrs">Mrs</option>
                    <option value="miss">Miss</option>
                    <option value="ms">Ms</option>
                    <option value="dr">Dr</option>
                  </select>
                </div>
              </div>

              <div className="book-page__form-row book-page__form-row--split">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">First name *</label>
                  <input
                    type="text"
                    className="book-page__form-input"
                    placeholder="e.g. Sam"
                    value={bookingForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Last name *</label>
                  <input
                    type="text"
                    className="book-page__form-input"
                    placeholder="e.g. Doe"
                    value={bookingForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="book-page__form-row">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Email address *</label>
                  <input
                    type="email"
                    className="book-page__form-input"
                    placeholder="e.g. sam.doe@example.com"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="book-page__form-row">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Contact number *</label>
                  <input
                    type="tel"
                    className="book-page__form-input"
                    placeholder="e.g. 07234 123456"
                    value={bookingForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="book-page__form-row">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Install address *</label>
                  <input
                    type="text"
                    className="book-page__form-input"
                    placeholder="Search for your address"
                    value={bookingForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                  <a href="#" className="book-page__form-link" onClick={(e) => e.preventDefault()}>
                    Can't find your address? Enter it manually
                  </a>
                </div>
              </div>

              <div className="book-page__form-row">
                <div className="book-page__form-field">
                  <label className="book-page__form-label">Notes, or comments</label>
                  <textarea
                    className="book-page__form-textarea"
                    placeholder="e.g. My property has..."
                    rows={4}
                    value={bookingForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </div>

              <div className="book-page__form-privacy">
                By submitting your details, you agree to our <a href="#" className="book-page__privacy-link" onClick={(e) => e.preventDefault()}>privacy policy</a>.
              </div>

              {dateError && (
                <div className="book-page__error-message" style={{
                  color: '#ef4444',
                  fontSize: '14px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px'
                }}>
                  {dateError}
                </div>
              )}
              <button className="book-page__submit-button" onClick={() => {
                if (!selectedDate) {
                  setDateError('Please select the date');
                  return;
                }
                setDateError('');
                localStorage.setItem('selectedInstallDate', selectedDate.toISOString());
                // Save surcharge amount for CompletePage
                const surcharge = getSurchargeAmount(selectedDate);
                localStorage.setItem('dateSurcharge', surcharge.toString());
                navigate('/complete');
              }}>
                Book install
              </button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="book-page__right-column">
            <div className="book-page__summary">
              {/* Install Total */}
              <div className="book-page__summary-section">
                <h3 className="book-page__summary-title">Install total</h3>
                <div className="book-page__summary-price">
                  <div className="book-page__price-row">
                    <span className="book-page__price-label">Fixed price (inc. VAT)</span>
                    <div className="book-page__price-amount">
                      {selectedProduct?.originalPrice && (
                        <span className="book-page__price-original">{selectedProduct.originalPrice}</span>
                      )}
                      <span className="book-page__price-current">
                        {calculateTotalPrice()}
                      </span>
                      {getSurchargeAmount(selectedDate) > 0 && (
                        <span className="book-page__price-surcharge" style={{
                          fontSize: '12px',
                          color: '#ef4444',
                          marginLeft: '8px'
                        }}>
                          (includes +£{getSurchargeAmount(selectedDate)} surcharge)
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedProduct?.monthlyPayment && (
                    <div className="book-page__price-row">
                      <span className="book-page__price-label">or, monthly from</span>
                      <div className="book-page__price-dropdown">
                        <span className="book-page__price-monthly">{selectedProduct.monthlyPayment}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <a href="#" className="book-page__summary-link" onClick={(e) => e.preventDefault()}>
                  What's included in my installation?
                </a>
              </div>

              {/* Payment Options */}
              <div className="book-page__summary-section">
                <div className="book-page__payment-options">
                  <div className="book-page__payment-option">
                    <div className="book-page__payment-icon book-page__payment-icon--green">%</div>
                    <span className="book-page__payment-text">Low rate finance</span>
                  </div>
                  <div className="book-page__payment-option">
                    <div className="book-page__payment-icon book-page__payment-icon--pink">K</div>
                    <span className="book-page__payment-text">Klarna pay later</span>
                  </div>
                  <div className="book-page__payment-option">
                    <div className="book-page__payment-icon book-page__payment-icon--blue">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 10H7" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <span className="book-page__payment-text">All cards, no fees</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="book-page__summary-section">
                <div className="book-page__discount">
                  <button className="book-page__discount-button">£50 off</button>
                  <div className="book-page__discount-code">
                    <span className="book-page__discount-text">PMAX50</span>
                    <button className="book-page__discount-remove">
                      <span>Remove</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Your Package */}
              <div className="book-page__summary-section">
                <div className="book-page__summary-header">
                  <h3 className="book-page__summary-title">Your package</h3>
                  <a href="#" className="book-page__summary-change" onClick={(e) => e.preventDefault()}>
                    Change
                  </a>
                </div>
                <div className="book-page__package-item">
                  <div className="book-page__package-image">
                    <div className="book-page__boiler-icon"></div>
                  </div>
                  <div className="book-page__package-details">
                    <div className="book-page__package-name">
                      {selectedProduct ? `${selectedProduct.brand} ${selectedProduct.name}` : 'Worcester Bosch Greenstar 4000 25kW'}
                    </div>
                    <div className="book-page__package-warranty">10 years warranty</div>
                  </div>
                </div>
              </div>

              {/* Your Install Date */}
              {selectedDate && (() => {
                const getOrdinalSuffix = (day: number) => {
                  if (day > 3 && day < 21) return 'th';
                  switch (day % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                  }
                };
                
                const day = selectedDate.getDate();
                const dayShort = selectedDate.toLocaleDateString('en-GB', { weekday: 'short' }).substring(0, 3);
                const dayFull = selectedDate.toLocaleDateString('en-GB', { weekday: 'long' });
                const monthShort = selectedDate.toLocaleDateString('en-GB', { month: 'short' });
                const ordinal = getOrdinalSuffix(day);
                
                return (
                  <div className="book-page__summary-section">
                    <div className="book-page__summary-header">
                      <h3 className="book-page__summary-title">Your install date</h3>
                      <a href="#" className="book-page__summary-change" onClick={(e) => {
                        e.preventDefault();
                        setSelectedDate(null);
                      }}>
                        Change
                      </a>
                    </div>
                    <div className="book-page__install-date">
                      <div className="book-page__date-box">
                        <div className="book-page__date-day-short">{dayShort}</div>
                        <div className="book-page__date-number">{day}{ordinal}</div>
                      </div>
                      <div className="book-page__date-full">
                        {dayFull} {day}{ordinal} {monthShort}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Your Installation */}
              <div className="book-page__summary-section">
                <h3 className="book-page__summary-title">Your installation</h3>
                <div className="book-page__installation-items">
                  <div className="book-page__package-item">
                    <div className="book-page__package-image">
                      <div className="book-page__bottles-icon"></div>
                    </div>
                    <div className="book-page__package-details">
                      <div className="book-page__package-name">
                        System Flush
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="book-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="book-page__package-description">
                        A chemical flush of your system, with inhibitor protection.
                      </div>
                    </div>
                  </div>
                  <div className="book-page__package-item">
                    <div className="book-page__package-image">
                      <div className="book-page__filter-icon"></div>
                    </div>
                    <div className="book-page__package-details">
                      <div className="book-page__package-name">
                        Worcester Greenstar Magnetic Filter
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="book-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="book-page__package-description">
                        Protect your new boiler from sludge, and debris.
                      </div>
                    </div>
                  </div>
                  <div className="book-page__package-item">
                    <div className="book-page__package-image">
                      <div className="book-page__alarm-icon"></div>
                    </div>
                    <div className="book-page__package-details">
                      <div className="book-page__package-name">
                        Carbon Monoxide Alarm
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="book-page__info-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="book-page__package-description">
                        Get alerted if carbon monoxide levels.
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
  );
};

export default BookPage;
