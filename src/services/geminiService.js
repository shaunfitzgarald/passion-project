import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import app from '../config/firebase';

// Initialize Firebase AI Logic
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance
const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

/**
 * Use Gemini AI to extract location information from natural language
 */
export const extractLocationFromText = async (userQuery) => {
  try {
    const prompt = `You are a helpful assistant that extracts location information from user queries. 
    The user will describe a location or ask you to add a location to a map. All locations on the map will be in the county of San Diego, CA. Be sure to use information you already know to complete the entire form if the information is not already provided by the user. If you are unsure or do not know the information, do not make up any information. Do not hallucinate any information.
    Extract the following information and return it as a JSON object:
    
    {
      "name": "Location name",
      "address": "Street address",
      "city": "City name",
      "state": "State abbreviation (2 letters)",
      "zipCode": "Zip code",
      "description": "Brief description of the location",
      "phone": "Phone number if mentioned - MUST be formatted as (xxx) xxx-xxxx (e.g., (619) 555-1234)",
      "email": "Email if mentioned",
      "website": "Website URL if mentioned",
      "hours": "Operating hours if mentioned - format using 24-hour time format like 'Mon-Fri 09:00-17:00, Sat 10:00-14:00, Closed Sundays'",
      "categories": ["Category1", "Category2"],
      "resources": ["Resource1", "Resource2"],
      "benefits": ["Benefit1", "Benefit2"],
      "icon": "icon_type (choose from: home, hotel, local_hospital, restaurant, restaurant_menu, school, work, directions_bus, child_care, local_library, volunteer_activism, local_pharmacy, help, location_on)",
      "notes": "Any additional notes"
    }
    
    Rules:
    - Only include fields that are explicitly mentioned or can be reasonably inferred
    - For categories, resources, and benefits, infer from context (e.g., "shelter" -> category: "Housing", icon: "hotel", resource: "Emergency Shelter")
    - For icon, choose the most appropriate based on the location type
    - If address is incomplete, try to infer city/state from context
    - Phone numbers: ALWAYS format as (xxx) xxx-xxxx. Remove all dashes, spaces, dots, or parentheses from input and reformat. Examples:
      * "619-555-1234" -> "(619) 555-1234"
      * "6195551234" -> "(619) 555-1234"
      * "(619) 555-1234" -> "(619) 555-1234"
      * "619.555.1234" -> "(619) 555-1234"
      * "1-619-555-1234" -> "(619) 555-1234" (remove country code)
    - Hours: Format using 24-hour time format (HH:MM). Examples:
      * "Monday through Friday 9am to 5pm" -> "Mon-Fri 09:00-17:00"
      * "Open 24 hours" -> "24:00" or "00:00-23:59"
      * "Monday 9am-5pm, Tuesday 9am-5pm, Wednesday closed" -> "Mon-Tue 09:00-17:00, Wed Closed"
      * "9:00 AM to 5:00 PM Monday through Friday" -> "Mon-Fri 09:00-17:00"
      * "10:30 AM to 2:30 PM" -> "10:30-14:30"
      * Always use 24-hour format: 00:00-23:59 (midnight to 11:59 PM)
    - Return ONLY valid JSON, no additional text
    
    User query: "${userQuery}"
    
    JSON response:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const locationData = JSON.parse(jsonText);

    return { locationData, error: null };
  } catch (error) {
    console.error('Firebase AI Logic error:', error);
    return { 
      locationData: null, 
      error: error.message || 'Failed to extract location information. Please try rephrasing your request.' 
    };
  }
};

/**
 * Use Gemini to geocode an address and get coordinates
 */
export const geocodeWithGemini = async (address) => {
  try {
    const prompt = `Given this address: "${address}", provide the latitude and longitude coordinates as a JSON object:
    {
      "latitude": number,
      "longitude": number
    }
    
    Return ONLY the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const coords = JSON.parse(jsonText);
    return { latitude: coords.latitude, longitude: coords.longitude, error: null };
  } catch (error) {
    console.error('Firebase AI Logic geocoding error:', error);
    // Fallback to regular geocoding
    return { error: 'Could not geocode with AI, will use standard geocoding' };
  }
};

