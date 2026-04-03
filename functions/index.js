const { genkit, z } = require('genkit');
const { googleAI, gemini15Flash } = require('@genkit-ai/googleai');
const { onRequest } = require('firebase-functions/v2/https');
const cors = require('cors')({ origin: true });

// Initialize Genkit 1.x instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// Define the flows
const extractLocationFlow = ai.defineFlow(
  {
    name: 'extractLocationFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      locationData: z.any(),
      error: z.string().nullable().optional()
    }),
  },
  async (userQuery) => {
    const prompt = `You are a helpful assistant that extracts location information from user queries. 
    The user will describe a location or ask you to add a location to a map. All locations on the map will be in the county of San Diego, CA. Be sure to use information you already know to complete the entire form if information is not already provided by the user. If you are unsure or do not know the information, do not make up any information. Do not hallucinate any information.
    Extract the following information and return it as a JSON object:
    
    {
      "name": "Location name",
      "address": "Street address",
      "city": "City name",
      "state": "State abbreviation (2 letters)",
      "zipCode": "Zip code",
      "description": "Brief description of the location",
      "phone": "Phone number if mentioned - MUST be formatted as (xxx) xxx-xxxx (e.g., (619) 555-1212)",
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
    - For categories, resources, and benefits, infer from context (e.g., "shelter" -> category: "Housing", icon: "hotel", resource: "Emergency Shelter")
    - For icon, choose the most appropriate based on the location type
    - If address is incomplete, try to infer city/state from context
    - Phone numbers: ALWAYS format as (xxx) xxx-xxxx.
    - Hours: Format using 24-hour time format (HH:MM).
    - Return ONLY valid JSON, no additional text
    
    User query: "${userQuery}"`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      config: { temperature: 0.1 }
    });

    try {
      const text = llmResponse.text();
      let jsonText = text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      const locationData = JSON.parse(jsonText);
      return { locationData };
    } catch (e) {
      return { locationData: null, error: e.message };
    }
  }
);

const geocodeFlow = ai.defineFlow(
  {
    name: 'geocodeFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      error: z.string().nullable().optional()
    }),
  },
  async (address) => {
    const prompt = `Given this address: "${address}", provide the latitude and longitude coordinates as a JSON object:
    {
      "latitude": number,
      "longitude": number
    }
    Return ONLY the JSON, no additional text.`;

    const llmResponse = await ai.generate({
      prompt: prompt
    });

    try {
      const text = llmResponse.text().trim();
      let jsonText = text;
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      const coords = JSON.parse(jsonText);
      return { latitude: coords.latitude, longitude: coords.longitude };
    } catch (e) {
      return { error: e.message };
    }
  }
);

// Expose the flows as standard Firebase Request functions (v2)
exports.extractLocation = onRequest({ cors: true, invoker: 'public' }, (req, res) => {
  cors(req, res, async () => {
    console.log('Received extractLocation request body:', JSON.stringify(req.body));
    const { userQuery } = req.body.data || req.body;
    if (!userQuery) {
      console.warn('No query provided in request');
      return res.status(400).send({ data: { error: 'No query provided' } });
    }
    
    try {
      console.log('Calling extractLocationFlow with query:', userQuery);
      // In Genkit 1.x, flows are functions themselves
      const result = await extractLocationFlow(userQuery);
      console.log('Flow completed successfully');
      res.send({ data: result });
    } catch (error) {
      console.error('Error in extractLocation:', error);
      res.status(500).send({ data: { error: error.message, stack: error.stack } });
    }
  });
});

exports.geocode = onRequest({ cors: true, invoker: 'public' }, (req, res) => {
  cors(req, res, async () => {
    console.log('Received geocode request body:', JSON.stringify(req.body));
    const { address } = req.body.data || req.body;
    if (!address) {
      console.warn('No address provided in request');
      return res.status(400).send({ data: { error: 'No address provided' } });
    }
    
    try {
      console.log('Calling geocodeFlow with address:', address);
      // In Genkit 1.x, flows are functions themselves
      const result = await geocodeFlow(address);
      console.log('Geocode Flow completed successfully');
      res.send({ data: result });
    } catch (error) {
      console.error('Error in geocode:', error);
      res.status(500).send({ data: { error: error.message, stack: error.stack } });
    }
  });
});
