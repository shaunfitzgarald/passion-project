/**
 * Get transit directions with bus route information
 * Uses Google Maps Directions API for detailed transit info
 */

/**
 * Get transit directions URL with detailed route information
 * @param {object} location - Location object with lat/lng
 * @param {object} origin - Origin coordinates {lat, lng} (optional, uses user location)
 * @returns {string} Google Maps transit directions URL
 */
export const getTransitDirectionsUrl = (location, origin = null) => {
  const destLat = location.latitude;
  const destLng = location.longitude;
  
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=transit`;
  
  if (origin) {
    url += `&origin=${origin.lat},${origin.lng}`;
  }
  
  return url;
};

/**
 * Get nearby transit stops information
 * This would typically use a transit API, but for now returns a formatted message
 */
export const getTransitInfo = (location) => {
  // This is a placeholder - in a real implementation, you'd call a transit API
  // like Google Transit API, TransitLand API, or local transit authority API
  return {
    nearbyStops: [],
    routes: [],
    message: 'Use the Transit button to see bus routes and schedules',
  };
};

/**
 * Format transit directions for display
 */
export const formatTransitDirections = (directions) => {
  if (!directions || !directions.routes) return null;
  
  const route = directions.routes[0];
  const leg = route.legs[0];
  
  return {
    duration: leg.duration?.text || 'Unknown',
    distance: leg.distance?.text || 'Unknown',
    steps: leg.steps || [],
    transitDetails: leg.steps
      .filter(step => step.travel_mode === 'TRANSIT')
      .map(step => step.transit_details),
  };
};

