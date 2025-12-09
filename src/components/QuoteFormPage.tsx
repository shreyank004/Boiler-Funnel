import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FuelSelector from './FuelSelector';
import BoilerTypeSelector from './BoilerTypeSelector';
import PropertyTypeSelector from './PropertyTypeSelector';
import BedroomSelector from './BedroomSelector';
import BathtubSelector from './BathtubSelector';
import ShowerCubicleSelector from './ShowerCubicleSelector';
import FlueExitSelector from './FlueExitSelector';
import BoilerReplacementTimingSelector from './BoilerReplacementTimingSelector';
import PostcodeSelector from './PostcodeSelector';
import ContactForm from './ContactForm';
import { submitForm } from '../utils/api';

type FuelType = 'mains-gas' | 'lpg' | 'unknown-fuel';
type BoilerType = 'combi' | 'regular' | 'system' | 'back-boiler';
type PropertyType = 'detached' | 'bungalow' | 'flat-apartment';
type BedroomCount = '1' | '2' | '3' | '4' | '5+';
type BathtubCount = 'none' | '1' | '2' | '3+';
type ShowerCubicleCount = 'none' | '1' | '2+';
type FlueExitType = 'external-wall' | 'roof';
type ReplacementTiming = 'asap' | 'this-week' | 'next-week';

interface QuoteFormPageProps {
  onFormComplete?: (formData: any, contactData: any, submissionId: string | null) => void;
}

const QuoteFormPage: React.FC<QuoteFormPageProps> = ({ onFormComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
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
  }>({
    fuelType: null,
    boilerType: null,
    propertyType: null,
    bedroomCount: null,
    bathtubCount: null,
    showerCubicleCount: null,
    flueExitType: null,
    replacementTiming: null,
    postcode: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFuelSelect = (fuelType: FuelType) => {
    setFormData((prev) => ({ ...prev, fuelType }));
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleBoilerTypeSelect = (boilerType: BoilerType) => {
    setFormData((prev) => ({ ...prev, boilerType }));
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handlePropertyTypeSelect = (propertyType: PropertyType) => {
    setFormData((prev) => ({ ...prev, propertyType }));
    setTimeout(() => setCurrentStep(4), 300);
  };

  const handleBedroomSelect = (bedroomCount: BedroomCount) => {
    setFormData((prev) => ({ ...prev, bedroomCount }));
    setTimeout(() => setCurrentStep(5), 300);
  };

  const handleBathtubSelect = (bathtubCount: BathtubCount) => {
    setFormData((prev) => ({ ...prev, bathtubCount }));
    setTimeout(() => setCurrentStep(6), 300);
  };

  const handleShowerCubicleSelect = (showerCubicleCount: ShowerCubicleCount) => {
    setFormData((prev) => ({ ...prev, showerCubicleCount }));
    setTimeout(() => setCurrentStep(7), 300);
  };

  const handleFlueExitSelect = (flueExitType: FlueExitType) => {
    setFormData((prev) => ({ ...prev, flueExitType }));
    setTimeout(() => setCurrentStep(8), 300);
  };

  const handleReplacementTimingSelect = (replacementTiming: ReplacementTiming) => {
    setFormData((prev) => ({ ...prev, replacementTiming }));
    setTimeout(() => setCurrentStep(9), 300);
  };

  const handlePostcodeSearch = (postcode: string, address: string) => {
    setFormData((prev) => ({ ...prev, postcode, address }));
    setTimeout(() => setCurrentStep(10), 300);
  };

  const handleContactSubmit = async (contactDataInput: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agreedToTerms: boolean;
  }) => {
    const { agreedToTerms, ...contactInfo } = contactDataInput;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare form submission data
      const submissionData = {
        ...formData,
        ...contactInfo,
      };

      // Submit to MongoDB
      const response = await submitForm(submissionData);
      
      let submissionId: string | null = null;
      if (response.success && response.id) {
        submissionId = response.id;
        console.log('Form submitted successfully with ID:', response.id);
      } else {
        throw new Error(response.error || 'Failed to submit form');
      }

      // Store data in localStorage for persistence
      localStorage.setItem('formData', JSON.stringify(formData));
      localStorage.setItem('contactData', JSON.stringify(contactInfo));
      if (submissionId) {
        localStorage.setItem('submissionId', submissionId);
      }

      // Call the callback if provided
      if (onFormComplete) {
        onFormComplete(formData, contactInfo, submissionId);
      }

      // Redirect to product page with state
      navigate('/choose', {
        state: {
          formData,
          contactData: contactInfo,
          submissionId,
        },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
      // Still redirect to product page even if save fails
      // Store data in localStorage for persistence
      localStorage.setItem('formData', JSON.stringify(formData));
      localStorage.setItem('contactData', JSON.stringify(contactInfo));
      
      if (onFormComplete) {
        onFormComplete(formData, contactInfo, null);
      }
      navigate('/choose', {
        state: {
          formData,
          contactData: contactInfo,
          submissionId: null,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate progress percentage (10 steps total, so each step is 10%)
  const totalSteps = 10;
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="QuoteFormPage">
      {currentStep === 1 && (
        <FuelSelector
          onSelect={handleFuelSelect}
          selectedFuel={formData.fuelType}
          progress={progress}
        />
      )}
      {currentStep === 2 && (
        <BoilerTypeSelector
          onSelect={handleBoilerTypeSelect}
          selectedType={formData.boilerType}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 3 && (
        <PropertyTypeSelector
          onSelect={handlePropertyTypeSelect}
          selectedType={formData.propertyType}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 4 && (
        <BedroomSelector
          onSelect={handleBedroomSelect}
          selectedCount={formData.bedroomCount}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 5 && (
        <BathtubSelector
          onSelect={handleBathtubSelect}
          selectedCount={formData.bathtubCount}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 6 && (
        <ShowerCubicleSelector
          onSelect={handleShowerCubicleSelect}
          selectedCount={formData.showerCubicleCount}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 7 && (
        <FlueExitSelector
          onSelect={handleFlueExitSelect}
          selectedType={formData.flueExitType}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 8 && (
        <BoilerReplacementTimingSelector
          onSelect={handleReplacementTimingSelect}
          selectedTiming={formData.replacementTiming}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 9 && (
        <PostcodeSelector
          onSearch={handlePostcodeSearch}
          initialPostcode={formData.postcode}
          initialAddress={formData.address}
          onBack={handleBack}
          progress={progress}
        />
      )}
      {currentStep === 10 && (
        <ContactForm 
          onSubmit={handleContactSubmit} 
          onBack={handleBack} 
          progress={progress} 
        />
      )}
      {submitError && (
        <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
          {submitError}
        </div>
      )}
    </div>
  );
};

export default QuoteFormPage;

