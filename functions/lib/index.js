"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocode = exports.extractLocation = exports.geocodeFlow = exports.extractLocationFlow = void 0;
const z = require("zod");
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
const flow_1 = require("@genkit-ai/flow");
const googleai_1 = require("@genkit-ai/googleai");
const functions_1 = require("@genkit-ai/firebase/functions");
const firebase_1 = require("@genkit-ai/firebase");
(0, core_1.configureGenkit)({
    plugins: [
        (0, firebase_1.firebase)(),
        (0, googleai_1.googleAI)(),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});
exports.extractLocationFlow = (0, flow_1.defineFlow)({
    name: 'extractLocation',
    inputSchema: z.object({ userQuery: z.string() }),
    outputSchema: z.object({
        locationData: z.any(),
        error: z.string().nullable().optional()
    }),
}, async ({ userQuery }) => {
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
    
    User query: "${userQuery}"`;
    try {
        const llmResponse = await (0, ai_1.generate)({
            model: googleai_1.gemini15Flash,
            prompt: prompt,
            config: {
                temperature: 0.2, // Low temperature for consistent formatting
            }
        });
        const text = llmResponse.text();
        // Basic cleanup if MD block is returned
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        const locationData = JSON.parse(jsonText);
        return { locationData };
    }
    catch (e) {
        return { locationData: null, error: e.message };
    }
});
exports.geocodeFlow = (0, flow_1.defineFlow)({
    name: 'geocode',
    inputSchema: z.object({ address: z.string() }),
    outputSchema: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        error: z.string().nullable().optional()
    }),
}, async ({ address }) => {
    const prompt = `Given this address: "${address}", provide the latitude and longitude coordinates as a JSON object:
    {
      "latitude": number,
      "longitude": number
    }
    Return ONLY the JSON, no additional text.`;
    try {
        const llmResponse = await (0, ai_1.generate)({
            model: googleai_1.gemini15Flash,
            prompt: prompt
        });
        const text = llmResponse.text().trim();
        let jsonText = text;
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        const coords = JSON.parse(jsonText);
        return { latitude: coords.latitude, longitude: coords.longitude };
    }
    catch (e) {
        return { error: e.message };
    }
});
// Expose the flows as Cloud Functions
exports.extractLocation = (0, functions_1.onCallGenkit)({
    authPolicy: () => true, // WARNING: Public access for demo purposes. Secure this in production!
}, exports.extractLocationFlow);
exports.geocode = (0, functions_1.onCallGenkit)({
    authPolicy: () => true, // WARNING: Public access for demo.
}, exports.geocodeFlow);
//# sourceMappingURL=index.js.map