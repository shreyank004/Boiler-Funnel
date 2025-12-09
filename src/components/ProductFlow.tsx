import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductPage from './ProductPage';
import CustomisePage from './CustomisePage';
import BookPage from './BookPage';
import CompletePage from './CompletePage';
import ThankYouPage from './ThankYouPage';

type FuelType = 'mains-gas' | 'lpg' | 'unknown-fuel';
type BoilerType = 'combi' | 'regular' | 'system' | 'back-boiler';
type PropertyType = 'detached' | 'bungalow' | 'flat-apartment';
type BedroomCount = '1' | '2' | '3' | '4' | '5+';
type BathtubCount = 'none' | '1' | '2' | '3+';
type ShowerCubicleCount = 'none' | '1' | '2+';
type FlueExitType = 'external-wall' | 'roof';
type ReplacementTiming = 'asap' | 'this-week' | 'next-week';

interface FormData {
  fuelType: FuelType | null;
  boilerType: BoilerType | null;
  propertyType: PropertyType | null;
  bedroomCount: BedroomCount | null;
  bathtubCount: BathtubCount | null;
  showerCubicleCount: ShowerCubicleCount | null;
  flueExitType: FlueExitType | null;
  replacementTiming: ReplacementTiming | null;
  postcode: string;
  address: string;
}

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const ProductFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from location state first (if navigated from QuoteFormPage)
    const state = location.state as { formData?: FormData; contactData?: ContactData; submissionId?: string } | null;
    
    if (state?.formData && state?.contactData) {
      setFormData(state.formData);
      setContactData(state.contactData);
      setSubmissionId(state.submissionId || null);
      
      // Also save to localStorage for persistence
      localStorage.setItem('formData', JSON.stringify(state.formData));
      localStorage.setItem('contactData', JSON.stringify(state.contactData));
      if (state.submissionId) {
        localStorage.setItem('submissionId', state.submissionId);
      }
      setLoading(false);
    } else {
      // Try to load from localStorage
      try {
        const storedFormData = localStorage.getItem('formData');
        const storedContactData = localStorage.getItem('contactData');
        const storedSubmissionId = localStorage.getItem('submissionId');

        if (storedFormData && storedContactData) {
          setFormData(JSON.parse(storedFormData));
          setContactData(JSON.parse(storedContactData));
          setSubmissionId(storedSubmissionId);
        } else {
          // No data found, redirect to quote form
          navigate('/quote', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        navigate('/quote', { replace: true });
        return;
      } finally {
        setLoading(false);
      }
    }
  }, [location.state, navigate]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!formData || !contactData) {
    return null; // Navigation will handle redirect
  }

  // Render the appropriate component based on the current path
  const path = location.pathname;
  
  if (path === '/choose' || path.startsWith('/choose')) {
    return (
      <ProductPage 
        formData={formData} 
        contactData={contactData}
        submissionId={submissionId}
      />
    );
  }
  
  if (path === '/customise' || path.startsWith('/customise')) {
    return (
      <CustomisePage 
        formData={formData} 
        contactData={contactData}
      />
    );
  }
  
  if (path === '/book' || path.startsWith('/book')) {
    return (
      <BookPage 
        formData={formData} 
        contactData={contactData}
      />
    );
  }
  
  if (path === '/complete' || path.startsWith('/complete')) {
    return (
      <CompletePage 
        formData={formData} 
        contactData={contactData}
      />
    );
  }
  
  if (path === '/thank-you' || path.startsWith('/thank-you')) {
    return (
      <ThankYouPage 
        formData={formData} 
        contactData={contactData}
      />
    );
  }

  // Default to product page
  return (
    <ProductPage 
      formData={formData} 
      contactData={contactData}
      submissionId={submissionId}
    />
  );
};

export default ProductFlow;

