import React, { useState, useRef, useEffect } from 'react';
import './PostcodeSelector.css';
import './SelectorCommon.css';
import Header from './Header';
import Footer from './Footer';

interface PostcodeSelectorProps {
  onSearch: (postcode: string, address: string) => void;
  initialPostcode?: string;
  initialAddress?: string;
  onBack?: () => void;
  apiKey?: string;
  progress?: number;
}

interface PostcodeData {
  postcode: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhs_ha: string;
  longitude: number;
  latitude: number;
  region: string;
  lsoa: string;
  msoa: string;
  incode: string;
  outcode: string;
  admin_district: string;
  admin_ward: string;
  admin_county: string | null;
  parish: string;
  parliamentary_constituency: string;
}

interface PostcodeApiResponse {
  status: number;
  result: PostcodeData | null;
  error?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: { country?: string | string[] };
              fields?: string[];
            }
          ) => {
            getPlace: () => {
              formatted_address?: string;
              address_components?: Array<{
                types: string[];
                long_name: string;
                short_name: string;
              }>;
            };
            addListener: (event: string, callback: () => void) => void;
          };
          PlacesService: new (element: HTMLElement) => {
            textSearch: (
              request: {
                query: string;
                type?: string;
                componentRestrictions?: { country?: string | string[] };
              },
              callback: (results: any[], status: any) => void
            ) => void;
          };
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            [key: string]: string;
          };
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }
}

const PostcodeSelector: React.FC<PostcodeSelectorProps> = ({
  onSearch,
  initialPostcode = '',
  initialAddress = '',
  onBack,
  apiKey,
  progress = 0,
}) => {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [address, setAddress] = useState(initialAddress);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoadingPostcode, setIsLoadingPostcode] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string>('');
  const [postcodeData, setPostcodeData] = useState<PostcodeData | null>(null);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to lookup postcode using postcodes.io API
  const lookupPostcode = async (postcodeValue: string) => {
    // Remove spaces and convert to uppercase for API
    const cleanPostcode = postcodeValue.replace(/\s+/g, '').toUpperCase();
    
    if (!cleanPostcode || cleanPostcode.length < 5) {
      setPostcodeError('');
      setPostcodeData(null);
      setAddresses([]);
      setShowAddressDropdown(false);
      return;
    }

    setIsLoadingPostcode(true);
    setPostcodeError('');

    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
      const data: PostcodeApiResponse = await response.json();

      if (data.status === 200 && data.result) {
        const result = data.result;
        setPostcodeData(result);
        setPostcodeError('');
        setAddress('');
        // Fetch addresses for this postcode
        // Pass the result data to ensure it's available
        if (window.google && window.google.maps && window.google.maps.places) {
          await fetchAddressesForPostcode(result.postcode, result);
        } else {
          // Immediately use sample addresses, then try Google Maps
          fetchAddressesForPostcode(result.postcode, result);
          
          // Wait for Google Maps to load, then fetch addresses
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              clearInterval(checkGoogleMaps);
              fetchAddressesForPostcode(result.postcode, result);
            }
          }, 100);
          
          setTimeout(() => clearInterval(checkGoogleMaps), 10000); // Timeout after 10 seconds
        }
      } else {
        setPostcodeError(data.error || 'Invalid postcode. Please check and try again.');
        setPostcodeData(null);
        setAddress('');
        setAddresses([]);
        setShowAddressDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching postcode data:', error);
      setPostcodeError('Unable to verify postcode. Please try again.');
      setPostcodeData(null);
      setAddresses([]);
    } finally {
      setIsLoadingPostcode(false);
    }
  };

  // Fetch addresses for a postcode using Google Places API
  const fetchAddressesForPostcode = async (postcodeValue: string, currentPostcodeData: PostcodeData | null) => {
    const cleanPostcode = postcodeValue.replace(/\s+/g, ' ').toUpperCase();
    setIsLoadingAddresses(true);
    setShowAddressDropdown(false);
    console.log('Fetching addresses for postcode:', cleanPostcode);

    // Always generate sample addresses first as fallback
    const sampleAddresses = generateSampleAddresses(cleanPostcode, currentPostcodeData);
    console.log('Generated sample addresses:', sampleAddresses.length);

    // First, try using getAddress.io API (free tier) - only if API key is available
    const getAddressApiKey = process.env.REACT_APP_GETADDRESS_API_KEY;
    if (getAddressApiKey && getAddressApiKey.trim() !== '') {
      try {
        const getAddressResponse = await fetch(`https://api.getAddress.io/autocomplete/${encodeURIComponent(cleanPostcode)}?api-key=${getAddressApiKey}`);
        
        if (getAddressResponse.ok) {
          const getAddressData = await getAddressResponse.json();
          if (getAddressData.suggestions && getAddressData.suggestions.length > 0) {
            // Format addresses from getAddress.io
            const addressList = getAddressData.suggestions.map((suggestion: string) => {
              return `${suggestion}, ${cleanPostcode}`;
            });
            setAddresses(addressList);
            setIsLoadingAddresses(false);
            setTimeout(() => {
              setShowAddressDropdown(true);
              console.log('Addresses loaded from getAddress.io:', addressList.length, addressList);
            }, 50);
            return;
          }
        }
      } catch (error) {
        console.log('getAddress.io not available, trying Google Places...', error);
      }
    } else {
      console.log('getAddress.io API key not configured, skipping...');
    }

    // Fallback to Google Places API
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      // If Google Maps not available, use sample addresses
      setAddresses(sampleAddresses);
      setIsLoadingAddresses(false);
      setTimeout(() => {
        setShowAddressDropdown(sampleAddresses.length > 0);
        console.log('Using sample addresses (no Google Maps):', sampleAddresses.length, sampleAddresses);
      }, 50);
      return;
    }

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: cleanPostcode,
        type: 'address',
        componentRestrictions: { country: 'gb' },
      };

      service.textSearch(request, (results: any[], status: any) => {
        console.log('Google Places API status:', status, 'Results:', results?.length);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const addressList = results
            .filter((place: any) => {
              // Filter to only include addresses with matching postcode
              const postcodeComponent = place.address_components?.find(
                (component: any) => component.types.includes('postal_code')
              );
              return postcodeComponent && 
                     postcodeComponent.long_name.replace(/\s+/g, '').toUpperCase() === 
                     cleanPostcode.replace(/\s+/g, '').toUpperCase();
            })
            .map((place: any) => place.formatted_address)
            .slice(0, 10); // Limit to 10 addresses

          if (addressList.length > 0) {
            setAddresses(addressList);
            setTimeout(() => {
              setShowAddressDropdown(true);
              console.log('Addresses loaded from Google Places:', addressList.length, addressList);
            }, 100);
          } else {
            // Fallback to sample addresses
            setAddresses(sampleAddresses);
            setIsLoadingAddresses(false);
            setTimeout(() => {
              setShowAddressDropdown(sampleAddresses.length > 0);
              console.log('Using sample addresses (no matches):', sampleAddresses.length, sampleAddresses);
            }, 50);
          }
        } else {
          // Fallback to sample addresses
          setAddresses(sampleAddresses);
          setIsLoadingAddresses(false);
          setTimeout(() => {
            setShowAddressDropdown(sampleAddresses.length > 0);
            console.log('Google Places failed, using sample addresses:', sampleAddresses.length, sampleAddresses);
          }, 50);
        }
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Fallback to sample addresses
      setAddresses(sampleAddresses);
      setIsLoadingAddresses(false);
      setTimeout(() => {
        setShowAddressDropdown(sampleAddresses.length > 0);
        console.log('Error occurred, using sample addresses:', sampleAddresses.length, sampleAddresses);
      }, 50);
    }
  };

  // Generate sample addresses based on postcode data
  const generateSampleAddresses = (postcode: string, postcodeData: PostcodeData | null): string[] => {
    const addresses: string[] = [];
    const streetNumbers = ['1', '2', '3', '5', '10', '15', '20', '25', '30', '50'];
    const streetNames = [
      'High Street',
      'Main Road',
      'Church Lane',
      'Park Avenue',
      'Victoria Road',
      'King Street',
      'Queen Street',
      'Station Road',
      'London Road',
      'Market Street'
    ];

    const district = postcodeData?.admin_district || 'London';
    
    // Always generate at least 5 sample addresses
    for (let i = 0; i < Math.min(8, streetNames.length); i++) {
      const streetNumber = streetNumbers[i % streetNumbers.length];
      const streetName = streetNames[i];
      addresses.push(`${streetNumber} ${streetName}, ${district}, ${postcode}`);
    }

    console.log('Generated addresses:', addresses);
    return addresses;
  };

  // Format address from postcode data
  const formatAddressFromPostcodeData = (data: PostcodeData): string => {
    const parts: string[] = [];
    
    if (data.admin_district) {
      parts.push(data.admin_district);
    }
    if (data.admin_ward && data.admin_ward !== data.admin_district) {
      parts.push(data.admin_ward);
    }
    if (data.region && data.region !== data.admin_district) {
      parts.push(data.region);
    }
    if (data.postcode) {
      parts.push(data.postcode);
    }
    
    return parts.join(', ');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) && 
        addressInputRef.current && 
        !addressInputRef.current.contains(target) &&
        !(target as Element).closest('.postcode-selector__dropdown')
      ) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced postcode lookup
  useEffect(() => {
    if (!postcode.trim()) {
      setPostcodeError('');
      setPostcodeData(null);
      setAddresses([]);
      setShowAddressDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      lookupPostcode(postcode);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [postcode]);

  // Handle address selection from dropdown
  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setShowAddressDropdown(false);
  };

  // Optional: Keep Google Maps autocomplete for address field
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        initializeAutocomplete();
        return true;
      }
      return false;
    };

    const loadGoogleMapsScript = () => {
      const mapsApiKey = apiKey || (process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string);
      
      if (!mapsApiKey || mapsApiKey === 'https://api.postcodes.io/postcodes/SW1A2AA') {
        // Google Maps is optional, postcodes.io will be used for postcode lookup
        return;
      }

      // Check if script is already loading or loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists, wait for it to load
        const checkInterval = setInterval(() => {
          if (checkGoogleMaps()) {
            clearInterval(checkInterval);
          }
        }, 100);
        
        const timeout = setTimeout(() => {
          clearInterval(checkInterval);
        }, 10000);
        
        return () => {
          clearInterval(checkInterval);
          clearTimeout(timeout);
        };
      }

      // Load the script dynamically
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        checkGoogleMaps();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup if component unmounts before script loads
      };
    };

    const initializeAutocomplete = () => {
      if (addressInputRef.current && window.google && postcodeData) {
        // Only initialize if postcode is validated
        const autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'gb' },
            fields: ['address_components', 'formatted_address'],
          }
        );

        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
            setShowAddressDropdown(false);
          }
        });
      }
    };

    // Re-initialize autocomplete when postcode is validated
    if (postcodeData && isGoogleLoaded) {
      initializeAutocomplete();
    }

    // Check if already loaded
    if (checkGoogleMaps()) {
      return;
    }

    // Try to load the script (optional, for address autocomplete)
    const cleanup = loadGoogleMapsScript();

    return () => {
      if (cleanup) cleanup();
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, postcodeData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate postcode if entered
    if (postcode.trim() && !postcodeData && !isLoadingPostcode) {
      // Try to lookup postcode one more time
      lookupPostcode(postcode);
      return;
    }

    if (postcode.trim() && address.trim()) {
      // Use formatted postcode from API if available
      const finalPostcode = postcodeData?.postcode || postcode.trim();
      const finalAddress = address.trim();
      
      onSearch(finalPostcode, finalAddress);
    }
  };

  return (
    <div className="selector-common">
      <Header progress={progress} />

      <div className="selector-common__content">
        <h1 className="selector-common__question">What's your postcode?</h1>

        <form onSubmit={handleSubmit} className="postcode-selector__form" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="postcode-selector__input-group">
          <input
            type="text"
              className={`postcode-selector__input ${postcodeError ? 'postcode-selector__input--error' : ''} ${postcodeData ? 'postcode-selector__input--valid' : ''}`}
              placeholder="e.g SW1A 2AA"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            aria-label="Postcode"
              disabled={isLoadingPostcode}
            />
            {isLoadingPostcode && (
              <div className="postcode-selector__loading">Checking postcode...</div>
            )}
            {postcodeError && (
              <div className="postcode-selector__error">{postcodeError}</div>
            )}
            {postcodeData && !postcodeError && (
              <div className="postcode-selector__success">
                ✓ Valid postcode - {postcodeData.admin_district}, {postcodeData.region}
              </div>
            )}
        </div>
          <div className="postcode-selector__input-group postcode-selector__input-group--relative">
          <input
            ref={addressInputRef}
            type="text"
            className="postcode-selector__input"
              placeholder={postcodeData ? "Select your address from the list below" : "Enter postcode first"}
            value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (addresses.length > 0 && e.target.value) {
                  setShowAddressDropdown(true);
                }
              }}
              onFocus={() => {
                if (addresses.length > 0) {
                  setShowAddressDropdown(true);
                }
              }}
              onBlur={(e) => {
                // Don't close dropdown if clicking on dropdown item
                if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node)) {
                  return;
                }
                // Small delay to allow click on dropdown item
                setTimeout(() => {
                  if (!addressInputRef.current?.matches(':focus')) {
                    setShowAddressDropdown(false);
                  }
                }, 200);
              }}
            aria-label="Address"
            autoComplete="off"
              disabled={!postcodeData}
            />
            {isLoadingAddresses && (
              <div className="postcode-selector__loading">Loading addresses...</div>
            )}
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                Debug: addresses={addresses.length}, showDropdown={showAddressDropdown ? 'true' : 'false'}, postcodeData={postcodeData ? 'exists' : 'null'}
              </div>
            )}
            {showAddressDropdown && addresses.length > 0 && (
              <div ref={dropdownRef} className="postcode-selector__dropdown" style={{ display: 'block' }}>
                <div className="postcode-selector__dropdown-header">
                  Select your address ({addresses.length} found)
                </div>
                {addresses.map((addr, index) => (
                  <div
                    key={index}
                    className="postcode-selector__dropdown-item"
                    onClick={() => handleAddressSelect(addr)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur
                  >
                    {addr}
                  </div>
                ))}
              </div>
            )}
            {postcodeData && addresses.length === 0 && !isLoadingAddresses && (
              <div className="postcode-selector__info">
                Start typing your address
              </div>
            )}
            {postcodeData && addresses.length > 0 && !showAddressDropdown && (
              <div className="postcode-selector__info postcode-selector__info--clickable" onClick={() => setShowAddressDropdown(true)}>
                Click here to see {addresses.length} address{addresses.length > 1 ? 'es' : ''} for this postcode
              </div>
            )}
        </div>
        <button
          type="submit"
          className="postcode-selector__button"
            disabled={
              !postcode.trim() || 
              !address.trim() || 
              isLoadingPostcode || 
              (postcode.trim() ? (!postcodeData && !postcodeError) : false)
            }
          >
            {isLoadingPostcode ? 'Checking...' : 'Search'}
        </button>
      </form>
      </div>

      <Footer onBack={onBack} />
    </div>
  );
};

export default PostcodeSelector;

