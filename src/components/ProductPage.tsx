import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductPage.css';
import { updateFormSubmission } from '../utils/api';
import ProductPageHeader from './ProductPageHeader';

interface ProductPageProps {
  formData: {
    fuelType: string | null;
    boilerType: string | null;
    propertyType: string | null;
    bedroomCount: string | null;
    bathtubCount: string | null;
    showerCubicleCount: string | null;
    flueExitType: string | null;
    replacementTiming: string | null;
    postcode: string;
    address: string;
  };
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  submissionId?: string | null;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating: number;
  category: 'good' | 'better' | 'best';
  warranty: string;
  features: string[];
  expertOpinion: string;
  monthlyPayment?: string;
  zeroApr?: string;
  suitableBedrooms: string[];
  boilerType?: string;
  imageUrl?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ formData, contactData, submissionId }) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [depositPercentage, setDepositPercentage] = useState<number>(0);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<{ months: number; apr: number } | null>(null);
  const [showWhatsIncluded, setShowWhatsIncluded] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  // Track finance details for each product
  const [productFinanceDetails, setProductFinanceDetails] = useState<Record<string, {
    depositPercentage: number;
    paymentOption: { months: number; apr: number };
    monthlyPayment: number;
  }>>({});

  // Save product selection and finance details to MongoDB
  const saveProductSelection = async (product: Product, financeDetails?: {
    depositPercentage: number;
    depositAmount: number;
    paymentOption: { months: number; apr: number };
    monthlyPayment: number;
    totalPayable: number;
  }) => {
    if (!submissionId) {
      console.warn('No submission ID available, skipping save');
      return;
    }

    try {
      const updates: any = {
        selectedProduct: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
        },
      };

      if (financeDetails) {
        updates.financeDetails = financeDetails;
      }

      await updateFormSubmission(submissionId, updates);
      console.log('Product selection saved successfully');
    } catch (error) {
      console.error('Error saving product selection:', error);
    }
  };

  // Finance calculator function
  const calculateMonthlyPayment = (price: number, months: number, apr: number): number => {
    const monthlyRate = apr / 12 / 100;
    if (monthlyRate === 0) {
      return price / months;
    }
    const monthlyPayment = (price * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    return monthlyPayment;
  };

  // Calculate finance details
  const calculateFinanceDetails = (productPrice: number, deposit: number, months: number, apr: number) => {
    const loanAmount = productPrice - deposit;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, months, apr);
    const totalPayable = monthlyPayment * months;
    const interestPayable = totalPayable - loanAmount;
    
    // Calculate annual interest rate from APR
    // Using compound interest formula approximation
    let annualInterestRate = 0;
    if (apr > 0) {
      // Convert APR to annual interest rate (simplified calculation)
      // For typical loans, annual rate ≈ APR * 0.565 to 0.6
      annualInterestRate = apr * 0.565;
    }
    
    return {
      monthlyPayment,
      deposit,
      months,
      apr,
      loanAmount,
      interestPayable,
      totalPayable,
      annualInterestRate,
    };
  };

  // Extract numeric price from string like "£2,499"
  const extractPrice = (priceString: string): number => {
    return parseFloat(priceString.replace(/[£,]/g, ''));
  };

  const openFinanceModal = (product: Product) => {
    setSelectedProduct(product);
    // Load existing finance details for this product if available
    const existingDetails = productFinanceDetails[product.id];
    if (existingDetails) {
      setDepositPercentage(existingDetails.depositPercentage);
      setSelectedPaymentOption(existingDetails.paymentOption);
    } else {
      setDepositPercentage(0);
      setSelectedPaymentOption(null);
    }
  };

  // Payment options with different APRs
  const paymentOptions = [
    { months: 120, apr: 11.9 },
    { months: 60, apr: 11.9 },
    { months: 36, apr: 11.9 },
    { months: 48, apr: 0 },
    { months: 36, apr: 0 },
    { months: 24, apr: 0 },
    { months: 12, apr: 0 },
  ];

  const closeFinanceModal = () => {
    setSelectedProduct(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/products/all`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        // Map MongoDB _id to id for compatibility
        const mappedProducts: Product[] = (result.data || []).map((product: any) => ({
          ...product,
          id: product._id || product.id,
        }));
        setAllProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductsError(err instanceof Error ? err.message : 'Failed to load products');
        // Fallback to empty array if API fails
        setAllProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);


  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (formData.boilerType) {
      filtered = filtered.filter(
        (product) => product.boilerType === formData.boilerType
      );
    }

    if (formData.bedroomCount) {
      filtered = filtered.filter((product) =>
        product.suitableBedrooms.includes(formData.bedroomCount!)
      );
    }

    return filtered;
  }, [allProducts, formData.bedroomCount, formData.boilerType]);
  // Get bedroom and bathroom counts for display
  const bedroomDisplay = formData.bedroomCount || '1';
  const bathroomDisplay = formData.bathtubCount === 'none' ? '1' : formData.bathtubCount || '1';
  const postcodeDisplay = formData.postcode || 'NN1';

  return (
    <div className="product-page">
      <ProductPageHeader currentStep={1} />
      <div className="product-page__container">
        <div className="product-page__header">
          <h1 className="product-page__title">{filteredProducts.length} available installation packages</h1>
          
          <div className="product-page__filters">
            <div className="product-page__filter-tag">
              <span className="product-page__filter-tag-item">{bedroomDisplay} bedroom</span>
              <span className="product-page__filter-tag-divider"></span>
              <span className="product-page__filter-tag-item">{bathroomDisplay} bathroom</span>
              <span className="product-page__filter-tag-divider"></span>
              <span className="product-page__filter-tag-item">in {postcodeDisplay}</span>
              <button className="product-page__filter-tag-edit" aria-label="Edit filters">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              </div>
            <div className="product-page__header-actions">
            <a 
                      href="#" 
                      className="product-page__product-included-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowWhatsIncluded(true);
                      }}
                    >
              <button className="product-page__action-button product-page__action-button--secondary">
                What's included?
              </button>
              </a>
              <button className="product-page__action-button product-page__action-button--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save for later
              </button>
              </div>
          </div>
        </div>

        <div className="product-page__products">
          {productsLoading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading products...
            </div>
          )}
          {productsError && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              Error loading products: {productsError}
            </div>
          )}
          {!productsLoading && !productsError && (
            <div className="product-page__products-grid">
              {filteredProducts.slice(0, 3).map((product) => (
              <div key={product.id} className={`product-page__product-card product-page__product-card--${product.category}`}>
                <div className="product-page__product-header">
                  <div className="product-page__product-badges">
                    <span className={`product-page__product-badge product-page__product-badge--${product.category}`}>
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </span>
                    {product.zeroApr && (
                      <span className="product-page__product-apr-badge">{product.zeroApr}</span>
                    )}
                  </div>
                  <div className="product-page__product-rating">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    <span>{product.rating}/5</span>
                  </div>
                </div>
                
                <div className="product-page__product-image">
                  {product.imageUrl ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}`}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', padding: '20px' }}
                    />
                  ) : (
                    <div className="product-page__product-placeholder">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#94a3b8" strokeWidth="2"/>
                        <rect x="6" y="8" width="12" height="2" fill="#cbd5e1"/>
                        <rect x="6" y="12" width="8" height="2" fill="#cbd5e1"/>
                      </svg>
                    </div>
                  )}
                  <div className="product-page__product-cover-badge">
                    12 months of free system cover
                  </div>
                  {(product.category === 'better' || product.category === 'best') && (
                    <div className="product-page__product-which-badge">
                      <div className="product-page__product-which-badge-content">
                        <div className="product-page__product-which-badge-text">September 2023 Which? Best Buy</div>
                        <div className="product-page__product-which-badge-subtext">GAS COMBI BOILERS</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="product-page__product-brand">{product.brand}</div>
                <h3 className="product-page__product-name">
                  {product.name}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="product-page__product-name-icon">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 18.01L12.01 17.9989" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h3>
                
                <div className="product-page__product-warranty">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{product.warranty}</span>
                </div>

                {product.category === 'best' && (
                  <div className="product-page__product-warranty">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{product.zeroApr}</span>
                  </div>
                )}

                <div className="product-page__product-expert">
                  <div className="product-page__product-expert-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H15C16.1046 16 17 15.1046 17 14V6C17 4.89543 16.1046 4 15 4H9C7.89543 4 7 4.89543 7 6V14C7 15.1046 7.89543 16 9 16Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="product-page__product-expert-content">
                    <div className="product-page__product-expert-label">Our experts say</div>
                    <div className="product-page__product-expert-text">"{product.expertOpinion}"</div>
                  </div>
                </div>

                <div className="product-page__product-pricing-card">
                  <div className="product-page__product-pricing-header">
                    <span className="product-page__product-price-label">Fixed price (inc. VAT)</span>
                    {product.monthlyPayment && (
                      <span className="product-page__product-monthly-label">or, monthly from</span>
                    )}
                  </div>
                  <div className="product-page__product-pricing-row">
                    <div className="product-page__product-price-section">
                      <div className="product-page__product-price-group">
                    <span className="product-page__product-price-value">{product.price}</span>
                        {product.originalPrice && (
                          <span className="product-page__product-price-original">{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    {product.monthlyPayment && (() => {
                      // Get finance details for this product if available
                      const financeDetails = productFinanceDetails[product.id];
                      const displayMonthlyPayment = financeDetails 
                        ? formatCurrency(financeDetails.monthlyPayment)
                        : product.monthlyPayment;
                      
                      return (
                        <div className="product-page__product-monthly-section">
                          <div className="product-page__product-monthly-amount">
                            <span className="product-page__product-monthly-price">{displayMonthlyPayment}</span>
                            <button 
                              className="product-page__product-monthly-toggle"
                              onClick={() => openFinanceModal(product)}
                              aria-label="View finance options"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="product-page__product-pricing-divider"></div>
                  <div className="product-page__product-pricing-footer">
                    <a 
                      href="#" 
                      className="product-page__product-included-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowWhatsIncluded(true);
                      }}
                    >
                      What's included in my installation?
                    </a>
                  </div>
                </div>

                <div className="product-page__product-actions">
                  <button 
                    className="product-page__product-button product-page__product-button--primary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/customise');
                    }}
                  >
                    More details
                  </button>
                  <button 
                    className="product-page__product-button product-page__product-button--secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Get finance details for this product if available
                      const financeDetails = productFinanceDetails[product.id];
                      const calculatedMonthlyPayment = financeDetails 
                        ? formatCurrency(financeDetails.monthlyPayment)
                        : product.monthlyPayment;
                      // Save selected product to localStorage for BookPage
                      localStorage.setItem('selectedProduct', JSON.stringify({
                        id: product.id,
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        monthlyPayment: calculatedMonthlyPayment,
                      }));
                      navigate('/book');
                    }}
                  >
                    Find soonest install date
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>


      {selectedProduct && (() => {
        const productPrice = extractPrice(selectedProduct.price);
        const depositAmount = productPrice * (depositPercentage / 100);
        const financeAmount = productPrice - depositAmount;

        return (
          <div className="finance-modal" onClick={closeFinanceModal}>
            <div className="finance-modal__content" onClick={(e) => e.stopPropagation()}>
              <button className="finance-modal__close" onClick={closeFinanceModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <h2 className="finance-modal__title">Payment options</h2>
              
              <div className="finance-modal__product-info">
                <div className="finance-modal__product-image">
                  {selectedProduct.imageUrl ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedProduct.imageUrl}`}
                      alt={selectedProduct.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#94a3b8" strokeWidth="2"/>
                      <rect x="6" y="8" width="12" height="2" fill="#cbd5e1"/>
                      <rect x="6" y="12" width="8" height="2" fill="#cbd5e1"/>
                    </svg>
                  )}
                </div>
                <div className="finance-modal__product-details">
                  <p className="finance-modal__product-name">{selectedProduct.brand} {selectedProduct.name}</p>
                  <p className="finance-modal__product-price">{selectedProduct.price}</p>
                </div>
              </div>

              <div className="finance-modal__payment-options">
                {paymentOptions.map((option, index) => {
                  const monthlyPayment = calculateMonthlyPayment(financeAmount, option.months, option.apr);
                  const isSelected = selectedPaymentOption?.months === option.months && selectedPaymentOption?.apr === option.apr;
                  
                  return (
                    <div
                      key={index}
                      className={`finance-modal__payment-option ${isSelected ? 'finance-modal__payment-option--selected' : ''}`}
                      onClick={() => {
                        setSelectedPaymentOption(option);
                        // Update product finance details
                        if (selectedProduct) {
                          const productPrice = extractPrice(selectedProduct.price);
                          const depositAmount = productPrice * (depositPercentage / 100);
                          const loanAmount = productPrice - depositAmount;
                          const monthlyPayment = calculateMonthlyPayment(loanAmount, option.months, option.apr);
                          setProductFinanceDetails(prev => ({
                            ...prev,
                            [selectedProduct.id]: {
                              depositPercentage,
                              paymentOption: option,
                              monthlyPayment,
                            }
                          }));
                          // Save product selection when payment option is selected
                          const financeDetails = calculateFinanceDetails(
                            productPrice,
                            depositAmount,
                            option.months,
                            option.apr
                          );
                          saveProductSelection(selectedProduct, {
                            depositPercentage,
                            depositAmount,
                            paymentOption: option,
                            monthlyPayment: financeDetails.monthlyPayment,
                            totalPayable: financeDetails.totalPayable,
                          });
                        }
                      }}
                    >
                      <div className="finance-modal__payment-radio">
                        {isSelected && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#10b981"/>
                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {!isSelected && (
                          <div className="finance-modal__payment-radio-empty"></div>
                        )}
                      </div>
                      <div className="finance-modal__payment-details">
                        <span className={`finance-modal__payment-amount ${isSelected ? 'finance-modal__payment-amount--selected' : ''}`}>
                          {formatCurrency(monthlyPayment)}
                        </span>
                        <span className="finance-modal__payment-duration">for {option.months} months</span>
                      </div>
                      <span className={`finance-modal__payment-apr ${option.apr === 0 ? 'finance-modal__payment-apr--zero' : ''}`}>
                        {option.apr === 0 ? '0% APR' : `${option.apr}% APR`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="finance-modal__deposit-section">
                <div className="finance-modal__deposit-header">
                  <span className="finance-modal__deposit-label">Choose deposit:</span>
                  <span className="finance-modal__deposit-amount">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="finance-modal__deposit-slider-wrapper">
                  <div 
                    className="finance-modal__deposit-slider-progress"
                    style={{ width: `${(depositPercentage / 50) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={depositPercentage}
                    onChange={(e) => {
                      const newDepositPercentage = Number(e.target.value);
                      setDepositPercentage(newDepositPercentage);
                      // Update product finance details if payment option is selected
                      if (selectedProduct && selectedPaymentOption) {
                        const productPrice = extractPrice(selectedProduct.price);
                        const depositAmount = productPrice * (newDepositPercentage / 100);
                        const loanAmount = productPrice - depositAmount;
                        const monthlyPayment = calculateMonthlyPayment(loanAmount, selectedPaymentOption.months, selectedPaymentOption.apr);
                        setProductFinanceDetails(prev => ({
                          ...prev,
                          [selectedProduct.id]: {
                            depositPercentage: newDepositPercentage,
                            paymentOption: selectedPaymentOption,
                            monthlyPayment,
                          }
                        }));
                      }
                    }}
                    className="finance-modal__deposit-slider"
                  />
                </div>
                <div className="finance-modal__deposit-labels">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              {selectedPaymentOption && (() => {
                const details = calculateFinanceDetails(
                  productPrice,
                  depositAmount,
                  selectedPaymentOption.months,
                  selectedPaymentOption.apr
                );
                
                return (
                  <div className="finance-modal__details-section">
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Monthly payment:</span>
                      <span className="finance-modal__details-value">{formatCurrency(details.monthlyPayment)}</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Deposit:</span>
                      <span className="finance-modal__details-value">{formatCurrency(details.deposit)}</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Payment term:</span>
                      <span className="finance-modal__details-value">{details.months} months</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">APR Representative:</span>
                      <span className="finance-modal__details-value">{details.apr}% APR</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Annual Interest Rate (Fixed):</span>
                      <span className="finance-modal__details-value">{details.annualInterestRate.toFixed(2)}% APR</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Loan amount:</span>
                      <span className="finance-modal__details-value">{formatCurrency(details.loanAmount)}</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Interest payable:</span>
                      <span className="finance-modal__details-value">{formatCurrency(details.interestPayable)}</span>
                    </div>
                    <div className="finance-modal__details-item">
                      <span className="finance-modal__details-label">Total payable:</span>
                      <span className="finance-modal__details-value finance-modal__details-value--total">{formatCurrency(details.totalPayable)}</span>
                    </div>
                    <p className="finance-modal__disclaimer">
                      Representative example. Minimum spend applies.
                    </p>
                  </div>
                );
              })()}

              <button 
                className="finance-modal__continue-button"
                disabled={selectedPaymentOption === null}
                onClick={() => {
                  // Ensure data is saved before continuing
                  if (selectedProduct && selectedPaymentOption) {
                    const productPrice = extractPrice(selectedProduct.price);
                    const depositAmount = productPrice * (depositPercentage / 100);
                    const financeDetails = calculateFinanceDetails(
                      productPrice,
                      depositAmount,
                      selectedPaymentOption.months,
                      selectedPaymentOption.apr
                    );
                    saveProductSelection(selectedProduct, {
                      depositPercentage,
                      depositAmount,
                      paymentOption: selectedPaymentOption,
                      monthlyPayment: financeDetails.monthlyPayment,
                      totalPayable: financeDetails.totalPayable,
                    });
                  }
                  // Get the calculated monthly payment from finance details
                  const financeDetails = productFinanceDetails[selectedProduct.id];
                  const calculatedMonthlyPayment = financeDetails 
                    ? formatCurrency(financeDetails.monthlyPayment)
                    : selectedProduct.monthlyPayment;
                  // Save selected product to localStorage for BookPage
                  localStorage.setItem('selectedProduct', JSON.stringify({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    brand: selectedProduct.brand,
                    price: selectedProduct.price,
                    originalPrice: selectedProduct.originalPrice,
                    monthlyPayment: calculatedMonthlyPayment,
                  }));
                  // Close modal and navigate to booking page
                  closeFinanceModal();
                  navigate('/book');
                }}
              >
                Continue to book →
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })()}

      {showWhatsIncluded && (
        <div className="whats-included-modal" onClick={() => setShowWhatsIncluded(false)}>
          <div className="whats-included-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="whats-included-modal__close" onClick={() => setShowWhatsIncluded(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h2 className="whats-included-modal__title">What's included?</h2>
            <p className="whats-included-modal__intro">
              The prices you see on screen are fixed, include VAT and won't change.
            </p>

            <div className="whats-included-modal__video">
              <div className="whats-included-modal__video-thumbnail">
                <div className="whats-included-modal__video-left">
                  <div className="whats-included-modal__video-left-content">
                    <div className="whats-included-modal__video-left-title">Help & Advice</div>
                    <div className="whats-included-modal__video-left-subtitle">What's Included in Your Boiler Installation?</div>
                  </div>
                </div>
                <div className="whats-included-modal__video-right">
                  <div className="whats-included-modal__video-placeholder"></div>
                </div>
                <div className="whats-included-modal__video-play-button">
                  <svg width="68" height="48" viewBox="0 0 68 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M66.5 24C66.5 36.4264 56.4264 46.5 44 46.5C31.5736 46.5 21.5 36.4264 21.5 24C21.5 11.5736 31.5736 1.5 44 1.5C56.4264 1.5 66.5 11.5736 66.5 24Z" fill="#FF0000" stroke="#FF0000" strokeWidth="3"/>
                    <path d="M38 24L44 28V20L38 24Z" fill="white"/>
                  </svg>
                </div>
                <div className="whats-included-modal__video-actions-top">
                  <button className="whats-included-modal__video-action-btn">Watch Later</button>
                  <button className="whats-included-modal__video-action-btn">Share</button>
                </div>
                <div className="whats-included-modal__video-actions-bottom">
                  <button className="whats-included-modal__video-watch-btn">Watch on YouTube</button>
                </div>
              </div>
              <div className="whats-included-modal__video-title-text">
                What's Included With Your Boiler Installatio...
              </div>
            </div>

            <div className="whats-included-modal__installation">
              <h3 className="whats-included-modal__installation-title">Your installation</h3>
              <ul className="whats-included-modal__installation-list">
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Full Gas Safe installation of your new combi boiler</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Installation of the new wireless heating controls (or smart controls if upgraded)</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Removal of the existing boiler from site</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>12 month workmanship warranty directly with Heatable</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Full protection of the property, surfaces and workspace</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>A full handover, with the boiler's control panel, any external controls and the process for increasing the system pressure and service intervals explained</span>
                </li>
                <li className="whats-included-modal__installation-item">
                  <div className="whats-included-modal__check-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Registration of the appliance with the manufacturer for warranty and service records</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Get Help & Advice + Form Answers */}
      <div className="product-page__bottom-section">
        <div className="product-page__bottom-container">
          {/* Left Column: Get Help & Advice */}
          <div className="product-page__help-section">
            <h2 className="product-page__help-title">Get help & advice</h2>
            <p className="product-page__help-subtitle">From our team of experts.</p>
            
            <div className="product-page__help-options">
              <div className="product-page__help-card">
                <div className="product-page__help-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08V3.08C5.16 3.68 4.68 4.16 4.08 4.16H2.08C2.08 12.24 8.76 18.92 16.84 18.92H18.84C19.44 18.92 19.92 19.4 19.92 20V22.92C19.92 23.52 20.4 24 21 24H24C24.6 24 25.08 23.52 25.08 22.92V19.92C25.08 19.32 24.6 18.84 24 18.84H21C20.4 18.84 19.92 18.36 19.92 17.76V16.92C19.92 16.32 20.4 15.84 21 15.84H24C24.6 15.84 25.08 16.32 25.08 16.92V19.92Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="product-page__help-content">
                  <div className="product-page__help-label">Call our team</div>
                  <a href="tel:03301131333" className="product-page__help-link">0330 113 1333</a>
                </div>
              </div>

              <div className="product-page__help-card">
                <div className="product-page__help-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08V3.08C5.16 3.68 4.68 4.16 4.08 4.16H2.08C2.08 12.24 8.76 18.92 16.84 18.92H18.84C19.44 18.92 19.92 19.4 19.92 20V22.92C19.92 23.52 20.4 24 21 24H24C24.6 24 25.08 23.52 25.08 22.92V19.92C25.08 19.32 24.6 18.84 24 18.84H21C20.4 18.84 19.92 18.36 19.92 17.76V16.92C19.92 16.32 20.4 15.84 21 15.84H24C24.6 15.84 25.08 16.32 25.08 16.92V19.92Z" fill="currentColor"/>
                    <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="product-page__help-content">
                  <div className="product-page__help-label">Or, we'll call you</div>
                  <a href="#" className="product-page__help-link">Request callback</a>
                </div>
              </div>

              <div className="product-page__help-card">
                <div className="product-page__help-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <div className="product-page__help-content">
                  <div className="product-page__help-label">For peace of mind</div>
                  <a href="#" className="product-page__help-link">Request a survey</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Answers */}
          <div className="product-page__answers-section">
            <h2 className="product-page__answers-title">Form answers</h2>
            <p className="product-page__answers-subtitle">Here's what your quotes are based on.</p>
            
            <div className="product-page__answers-list">
              {formData.postcode && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Postcode:</span>
                    <span className="product-page__answer-value">{formData.postcode}</span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}
              
              {formData.fuelType && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Does your boiler run on mains gas?</span>
                    <span className="product-page__answer-value">
                      {formData.fuelType === 'mains-gas' ? 'mains gas' : formData.fuelType === 'lpg' ? 'LPG' : 'Unknown'}
                    </span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}

              {formData.boilerType && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Do you know what type of boiler?</span>
                    <span className="product-page__answer-value">Yes, I know</span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Which type of boiler do you currently have?</span>
                    <span className="product-page__answer-value">
                      {formData.boilerType === 'combi' ? 'Combi boiler' :
                       formData.boilerType === 'regular' ? 'Regular/Standard boiler' :
                       formData.boilerType === 'system' ? 'System boiler' :
                       formData.boilerType === 'back-boiler' ? 'Back boiler' : formData.boilerType}
                    </span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}

              {formData.propertyType && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Which type of property do you have?</span>
                    <span className="product-page__answer-value">
                      {formData.propertyType === 'house' ? 'A house' :
                       formData.propertyType === 'bungalow' ? 'A bungalow' :
                       formData.propertyType === 'flat' ? 'A flat/apartment' : formData.propertyType}
                    </span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}

              {formData.bathtubCount && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">How many bathrooms does your home have?</span>
                    <span className="product-page__answer-value">
                      {formData.bathtubCount === '1' ? '1 bathroom' :
                       formData.bathtubCount === '2' ? '2 bathrooms' :
                       formData.bathtubCount === '3' ? '3 bathrooms' :
                       formData.bathtubCount === '4+' ? '4+ bathrooms' : `${formData.bathtubCount} bathroom`}
                    </span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}

              {formData.bedroomCount && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">How many bedrooms does your home have?</span>
                    <span className="product-page__answer-value">
                      {formData.bedroomCount === '1' ? '1 bedroom' :
                       formData.bedroomCount === '2' ? '2 bedrooms' :
                       formData.bedroomCount === '3' ? '3 bedrooms' :
                       formData.bedroomCount === '4+' ? '4+ bedrooms' : `${formData.bedroomCount} bedroom`}
                    </span>
                  </div>
                  <div className="product-page__answer-divider"></div>
                </>
              )}

              {formData.flueExitType && (
                <>
                  <div className="product-page__answer-item">
                    <span className="product-page__answer-question">Does your boiler's flue go out of the wall?</span>
                    <span className="product-page__answer-value">
                      {formData.flueExitType === 'external-wall' ? 'Yes, it does' :
                       formData.flueExitType === 'roof' ? 'No, it goes through the roof' : 'Unknown'}
                    </span>
                  </div>
                  {(formData.replacementTiming) && <div className="product-page__answer-divider"></div>}
                </>
              )}

              {formData.replacementTiming && (
                <div className="product-page__answer-item">
                  <span className="product-page__answer-question">When do you need your boiler replaced?</span>
                  <span className="product-page__answer-value">
                    {formData.replacementTiming === 'asap' ? 'As soon as possible' :
                     formData.replacementTiming === 'this-week' ? 'This week' :
                     formData.replacementTiming === 'next-week' ? 'Next week' : formData.replacementTiming}
                  </span>
                </div>
              )}
            </div>

            <button className="product-page__restart-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9C20.0172 7.56678 19.2171 6.28542 18.1477 5.27541C17.0782 4.26539 15.7769 3.55976 14.3707 3.22426C12.9645 2.88876 11.5026 2.93334 10.1202 3.35427C8.7378 3.77521 7.48375 4.56091 6.47253 5.63604C5.46131 6.71116 4.72451 8.04108 4.32523 9.49997M3.51 15C3.98279 16.4332 4.78287 17.7146 5.85234 18.7246C6.92181 19.7346 8.22308 20.4402 9.6293 20.7757C11.0355 21.1112 12.4974 21.0667 13.8798 20.6457C15.2622 20.2248 16.5162 19.4391 17.5275 18.364C18.5387 17.2888 19.2755 15.9589 19.6748 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Restart questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

