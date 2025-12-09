import React, { useState, useEffect } from 'react';
import './AdminPanelPage.css';

interface Submission {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fuelType: string;
  boilerType: string;
  propertyType: string;
  bedroomCount: string;
  postcode: string;
  address: string;
  createdAt?: string;
}

interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: string;
  category: 'good' | 'better' | 'best' | '';
  warranty: string;
  features: string;
  expertOpinion: string;
  monthlyPayment: string;
  zeroApr: string;
  suitableBedrooms: string;
  boilerType: string;
}

const AdminPanelPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    description: '',
    price: '',
    originalPrice: '',
    rating: '',
    category: '',
    warranty: '',
    features: '',
    expertOpinion: '',
    monthlyPayment: '',
    zeroApr: '',
    suitableBedrooms: '',
    boilerType: '',
  });
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productFormSuccess, setProductFormSuccess] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Helper function to get API URL dynamically
  const getApiUrl = (): string => {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Use current window location for network access
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Handle HTTPS frontend -> HTTP backend (use http for local backend)
    // In production, you should use HTTPS for both
    const backendProtocol = (hostname === 'localhost' || hostname === '127.0.0.1') 
      ? 'http' 
      : protocol;
    
    return `${backendProtocol}//${hostname}:5000/api`;
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const fetchUrl = `${apiUrl}/forms/all`;
      
      console.log('Fetching submissions from:', fetchUrl);
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch submissions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubmissions(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load submissions';
      
      // Provide more helpful error messages
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        const apiUrl = getApiUrl();
        setError(`Cannot connect to server at ${apiUrl}. Please ensure the backend server is running.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/forms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      setSubmissions(submissions.filter(sub => sub._id !== id));
      if (selectedSubmission?._id === id) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert('Failed to delete submission');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormLoading(true);
    setProductFormError(null);
    setProductFormSuccess(false);

    try {
      // Validate required fields
      if (!productFormData.name || !productFormData.brand || !productFormData.description ||
          !productFormData.price || !productFormData.rating || !productFormData.category ||
          !productFormData.warranty || !productFormData.expertOpinion) {
        throw new Error('Please fill in all required fields');
      }

      // Parse features (comma-separated string to array)
      const features = productFormData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      // Parse suitableBedrooms (comma-separated string to array)
      const suitableBedrooms = productFormData.suitableBedrooms
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      // Validate rating is a valid number
      const ratingValue = parseFloat(productFormData.rating);
      if (isNaN(ratingValue)) {
        throw new Error('Rating must be a valid number');
      }

      // Prepare product data
      const productData: any = {
        name: productFormData.name.trim(),
        brand: productFormData.brand.trim(),
        description: productFormData.description.trim(),
        price: productFormData.price.trim(),
        rating: ratingValue,
        category: productFormData.category,
        warranty: productFormData.warranty.trim(),
        features: features,
        expertOpinion: productFormData.expertOpinion.trim(),
      };

      // Add optional fields if provided
      if (productFormData.originalPrice) {
        productData.originalPrice = productFormData.originalPrice;
      }
      if (productFormData.monthlyPayment) {
        productData.monthlyPayment = productFormData.monthlyPayment;
      }
      if (productFormData.zeroApr) {
        productData.zeroApr = productFormData.zeroApr;
      }
      if (suitableBedrooms.length > 0) {
        productData.suitableBedrooms = suitableBedrooms;
      }
      if (productFormData.boilerType) {
        productData.boilerType = productFormData.boilerType;
      }

      const apiUrl = getApiUrl();
      
      // Use FormData if image is being uploaded, otherwise use JSON
      if (productImage) {
        const formData = new FormData();
        formData.append('image', productImage);
        
        // Always append required fields first
        formData.append('name', productData.name || '');
        formData.append('brand', productData.brand || '');
        formData.append('description', productData.description || '');
        formData.append('price', productData.price || '');
        formData.append('rating', String(productData.rating || ''));
        formData.append('category', productData.category || '');
        formData.append('warranty', productData.warranty || '');
        formData.append('expertOpinion', productData.expertOpinion || '');
        
        // Append optional fields if they exist
        if (productData.features && Array.isArray(productData.features) && productData.features.length > 0) {
          formData.append('features', JSON.stringify(productData.features));
        }
        if (productData.originalPrice) {
          formData.append('originalPrice', productData.originalPrice);
        }
        if (productData.monthlyPayment) {
          formData.append('monthlyPayment', productData.monthlyPayment);
        }
        if (productData.zeroApr) {
          formData.append('zeroApr', productData.zeroApr);
        }
        if (productData.suitableBedrooms && Array.isArray(productData.suitableBedrooms) && productData.suitableBedrooms.length > 0) {
          formData.append('suitableBedrooms', JSON.stringify(productData.suitableBedrooms));
        }
        if (productData.boilerType) {
          formData.append('boilerType', productData.boilerType);
        }

        console.log('Sending product data:', {
          name: productData.name,
          brand: productData.brand,
          description: productData.description,
          price: productData.price,
          rating: productData.rating,
          category: productData.category,
          warranty: productData.warranty,
          expertOpinion: productData.expertOpinion,
          hasImage: !!productImage
        });

        const response = await fetch(`${apiUrl}/products/create`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create product');
        }
      } else {
        const response = await fetch(`${apiUrl}/products/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create product');
        }
      }

      setProductFormSuccess(true);
      // Reset form
      setProductFormData({
        name: '',
        brand: '',
        description: '',
        price: '',
        originalPrice: '',
        rating: '',
        category: '',
        warranty: '',
        features: '',
        expertOpinion: '',
        monthlyPayment: '',
        zeroApr: '',
        suitableBedrooms: '',
        boilerType: '',
      });
      setProductImage(null);
      setImagePreview(null);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setProductFormSuccess(false);
        setShowProductForm(false);
      }, 3000);
    } catch (err) {
      console.error('Error creating product:', err);
      setProductFormError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setProductFormLoading(false);
    }
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-container">
        <header className="admin-panel-header">
          <h1>Admin Panel</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowProductForm(!showProductForm)} 
              className="refresh-btn"
              style={{ backgroundColor: showProductForm ? '#28a745' : '#007bff' }}
            >
              {showProductForm ? 'Hide Product Form' : 'Create Product'}
            </button>
            <button onClick={fetchSubmissions} className="refresh-btn">
              Refresh
            </button>
          </div>
        </header>

        {loading && <div className="loading">Loading submissions...</div>}
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchSubmissions} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {showProductForm && (
          <div className="submission-details" style={{ marginBottom: '30px' }}>
            <h2>Create New Product</h2>
            {productFormSuccess && (
              <div style={{ 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                padding: '15px', 
                borderRadius: '5px', 
                marginBottom: '15px' 
              }}>
                Product created successfully!
              </div>
            )}
            {productFormError && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '15px', 
                borderRadius: '5px', 
                marginBottom: '15px' 
              }}>
                {productFormError}
              </div>
            )}
            <form onSubmit={handleProductSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productFormData.name}
                    onChange={handleProductFormChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Brand <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={productFormData.brand}
                    onChange={handleProductFormChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Description <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={productFormData.description}
                    onChange={handleProductFormChange}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px', 
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }} 
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Price <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={productFormData.price}
                    onChange={handleProductFormChange}
                    placeholder="£1,930"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Original Price
                  </label>
                  <input
                    type="text"
                    name="originalPrice"
                    value={productFormData.originalPrice}
                    onChange={handleProductFormChange}
                    placeholder="£2,130"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Rating <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={productFormData.rating}
                    onChange={handleProductFormChange}
                    min="0"
                    max="5"
                    step="0.1"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Category <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="category"
                    value={productFormData.category}
                    onChange={handleProductFormChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="">Select category</option>
                    <option value="good">Good</option>
                    <option value="better">Better</option>
                    <option value="best">Best</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Warranty <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="warranty"
                    value={productFormData.warranty}
                    onChange={handleProductFormChange}
                    placeholder="5 year warranty"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="features"
                    value={productFormData.features}
                    onChange={handleProductFormChange}
                    placeholder="Energy Efficient, Compact Design"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Expert Opinion <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    name="expertOpinion"
                    value={productFormData.expertOpinion}
                    onChange={handleProductFormChange}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Monthly Payment
                  </label>
                  <input
                    type="text"
                    name="monthlyPayment"
                    value={productFormData.monthlyPayment}
                    onChange={handleProductFormChange}
                    placeholder="£26.90"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Zero APR Text
                  </label>
                  <input
                    type="text"
                    name="zeroApr"
                    value={productFormData.zeroApr}
                    onChange={handleProductFormChange}
                    placeholder="Up-to 4 years 0% APR"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Suitable Bedrooms (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="suitableBedrooms"
                    value={productFormData.suitableBedrooms}
                    onChange={handleProductFormChange}
                    placeholder="1, 2, 3"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Boiler Type
                  </label>
                  <select
                    name="boilerType"
                    value={productFormData.boilerType}
                    onChange={handleProductFormChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="">Select boiler type</option>
                    <option value="combi">Combi</option>
                    <option value="regular">Regular</option>
                    <option value="system">System</option>
                    <option value="back-boiler">Back Boiler</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={productFormLoading}
                className="refresh-btn"
                style={{ width: '100%', backgroundColor: '#28a745' }}
              >
                {productFormLoading ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="submissions-stats">
              <p>Total Submissions: <strong>{submissions.length}</strong></p>
            </div>

            <div className="admin-content">
              <div className="submissions-list">
                <h2>Submissions</h2>
                {submissions.length === 0 ? (
                  <div className="no-submissions">No submissions found</div>
                ) : (
                  <div className="submissions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Postcode</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr
                            key={submission._id}
                            className={selectedSubmission?._id === submission._id ? 'selected' : ''}
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <td>{submission.firstName} {submission.lastName}</td>
                            <td>{submission.email}</td>
                            <td>{submission.phone}</td>
                            <td>{submission.postcode}</td>
                            <td>{formatDate(submission.createdAt)}</td>
                            <td>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(submission._id);
                                }}
                                className="delete-btn"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedSubmission && (
                <div className="submission-details">
                  <h2>Submission Details</h2>
                  <div className="details-content">
                    <div className="detail-row">
                      <strong>ID:</strong>
                      <span>{selectedSubmission._id}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Name:</strong>
                      <span>{selectedSubmission.firstName} {selectedSubmission.lastName}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Email:</strong>
                      <span>{selectedSubmission.email}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Phone:</strong>
                      <span>{selectedSubmission.phone}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Fuel Type:</strong>
                      <span>{selectedSubmission.fuelType}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Boiler Type:</strong>
                      <span>{selectedSubmission.boilerType}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Property Type:</strong>
                      <span>{selectedSubmission.propertyType}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Bedrooms:</strong>
                      <span>{selectedSubmission.bedroomCount}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Postcode:</strong>
                      <span>{selectedSubmission.postcode}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Address:</strong>
                      <span>{selectedSubmission.address}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Created At:</strong>
                      <span>{formatDate(selectedSubmission.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="close-btn"
                  >
                    Close Details
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;

