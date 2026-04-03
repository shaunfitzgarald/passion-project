const EXTRACT_URL = 'https://extractlocation-geuymlr6ja-uc.a.run.app';
const GEOCODE_URL = 'https://geocode-geuymlr6ja-uc.a.run.app';

/**
 * Use Genkit Cloud Function to extract location information
 */
export const extractLocationFromText = async (userQuery) => {
  try {
    const response = await fetch(EXTRACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { userQuery } }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Wrap result in expected structure for frontend compatibility
    return result.data; 
  } catch (error) {
    console.error('Genkit Error:', error);
    return { 
      locationData: null, 
      error: error.message || 'Failed to extract location information.' 
    };
  }
};

/**
 * Use Genkit Cloud Function to geocode
 */
export const geocodeWithGemini = async (address) => {
  try {
    const response = await fetch(GEOCODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { address } }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Genkit Geocode Error:', error);
    return { error: 'Could not geocode with AI' };
  }
};

