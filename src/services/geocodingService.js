import { GOOGLE_MAPS_API_KEY } from '../config/googleMaps';

/**
 * Geocode an address to get latitude and longitude
 */
export const geocodeAddress = async (address, city = '', state = '', zipCode = '') => {
  if (!GOOGLE_MAPS_API_KEY) {
    return { error: 'Google Maps API key not configured' };
  }

  try {
    // Build full address string
    const addressParts = [address, city, state, zipCode].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    if (!fullAddress.trim()) {
      return { error: 'Address is required' };
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      // Extract address components
      const addressComponents = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      };

      result.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes('street_number') || types.includes('route')) {
          addressComponents.street = (addressComponents.street + ' ' + component.long_name).trim();
        }
        if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        }
        if (types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        }
        if (types.includes('country')) {
          addressComponents.country = component.short_name;
        }
      });

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        addressComponents,
        error: null,
      };
    } else {
      return { error: data.error_message || 'Address not found' };
    }
  } catch (error) {
    return { error: error.message || 'Failed to geocode address' };
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (latitude, longitude) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return { error: 'Google Maps API key not configured' };
  }

  try {
    if (!latitude || !longitude) {
      return { error: 'Latitude and longitude are required' };
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract address components
      const addressComponents = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      };

      result.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes('street_number') || types.includes('route')) {
          addressComponents.street = (addressComponents.street + ' ' + component.long_name).trim();
        }
        if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        }
        if (types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        }
        if (types.includes('country')) {
          addressComponents.country = component.short_name;
        }
      });

      return {
        formattedAddress: result.formatted_address,
        addressComponents,
        error: null,
      };
    } else {
      return { error: data.error_message || 'Location not found' };
    }
  } catch (error) {
    return { error: error.message || 'Failed to reverse geocode' };
  }
};


