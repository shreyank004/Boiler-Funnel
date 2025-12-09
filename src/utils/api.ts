const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface FormSubmissionData {
  // Form data
  fuelType?: string | null;
  boilerType?: string | null;
  propertyType?: string | null;
  bedroomCount?: string | null;
  bathtubCount?: string | null;
  showerCubicleCount?: string | null;
  flueExitType?: string | null;
  replacementTiming?: string | null;
  postcode?: string;
  address?: string;
  
  // Contact data
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Optional: Product selection
  selectedProduct?: {
    id: string;
    name: string;
    brand: string;
    price: string;
  };
  
  // Optional: Finance details
  financeDetails?: {
    depositPercentage: number;
    depositAmount: number;
    paymentOption: {
      months: number;
      apr: number;
    };
    monthlyPayment: number;
    totalPayable: number;
  };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  id?: string;
  data?: any;
  error?: string;
}

/**
 * Submit form data to the backend
 */
export const submitForm = async (data: FormSubmissionData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit form');
    }

    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

export const updateFormSubmission = async (
  submissionId: string,
  updates: Partial<FormSubmissionData>
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update form submission');
    }
 
    return result;
  } catch (error) {
    console.error('Error updating form submission:', error);
    throw error;
  }
};

/**
 * Get all form submissions
 */
export const getAllSubmissions = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/all`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch submissions');
    }

    return result;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

/**
 * Get a single form submission by ID
 */
export const getSubmissionById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch submission');
    }

    return result;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw error;
  }
};

/**
 * Create a Stripe payment intent
 */
export const createPaymentIntent = async (
  amount: number,
  submissionId?: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; clientSecret: string; paymentIntentId: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'gbp',
        submissionId,
        metadata
      }),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = 'Failed to create payment intent';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server. Please make sure the backend server is running on ${API_BASE_URL}`);
    }
    
    throw error;
  }
};

/**
 * Confirm a payment
 */
export const confirmPayment = async (
  paymentIntentId: string,
  submissionId?: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        submissionId
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to confirm payment');
    }

    return result;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

