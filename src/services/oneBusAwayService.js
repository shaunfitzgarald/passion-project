/**
 * OneBusAway API Service
 * Documentation: https://developer.onebusaway.org/api/where
 * 
 * Note: OneBusAway requires a server instance for each city/region.
 * San Diego may or may not have a OneBusAway deployment.
 * If not available, we'll fall back to Google Transit API or other alternatives.
 */

const ONEBUSAWAY_API_KEY = process.env.REACT_APP_ONEBUSAWAY_API_KEY || '';
// San Diego MTS OneBusAway endpoint
// Documentation: https://www.sdmts.com/business-center/app-developers/real-time-data
const ONEBUSAWAY_BASE_URL = process.env.REACT_APP_ONEBUSAWAY_BASE_URL || 'https://realtime.sdmts.com/api/api/where';

/**
 * Make a request to OneBusAway API
 */
const makeRequest = async (endpoint, params = {}) => {
  // Note: San Diego MTS API may or may not require an API key
  // If no key is provided, try without it first
  const queryParams = new URLSearchParams();
  
  if (ONEBUSAWAY_API_KEY) {
    queryParams.append('key', ONEBUSAWAY_API_KEY);
  }
  
  // Add other parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });

  try {
    const url = `${ONEBUSAWAY_BASE_URL}/${endpoint}.json?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.code !== 200) {
      return { error: data.text || 'API request failed' };
    }
    
    return { data: data.data, references: data.references || {} };
  } catch (error) {
    console.error('OneBusAway API error:', error);
    return { error: error.message };
  }
};

/**
 * Get nearby bus stops for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 500)
 * @returns {Promise} Array of nearby stops
 */
export const getNearbyStops = async (lat, lng, radius = 500) => {
  const result = await makeRequest('stops-for-location', {
    lat: lat.toString(),
    lon: lng.toString(),
    radius: radius.toString(),
  });

  if (result.error) {
    return { error: result.error, stops: [] };
  }

  const stops = result.data?.list || [];
  const references = result.references || {};
  
  // Enrich stops with route information from references
  const enrichedStops = stops.map(stop => {
    const stopRoutes = (stop.routeIds || []).map(routeId => {
      // Handle both object and array reference formats
      if (references.routes) {
        if (Array.isArray(references.routes)) {
          return references.routes.find(r => r.id === routeId) || null;
        } else {
          return references.routes[routeId] || null;
        }
      }
      return null;
    }).filter(Boolean);

    return {
      id: stop.id,
      name: stop.name,
      code: stop.code,
      lat: stop.lat,
      lng: stop.lon,
      direction: stop.direction,
      routes: stopRoutes,
      distance: stop.distance || 0,
    };
  });

  return { stops: enrichedStops, error: null };
};

/**
 * Get arrivals and departures for a specific stop
 * @param {string} stopId - Stop ID
 * @returns {Promise} Arrival/departure information
 */
export const getStopArrivals = async (stopId) => {
  const result = await makeRequest('arrivals-and-departures-for-stop', {
    id: stopId,
  });

  if (result.error) {
    return { error: result.error, arrivals: [] };
  }

  const arrivals = result.data?.arrivalsAndDepartures || [];
  const references = result.references || {};

  // Enrich arrivals with route and trip information
  const enrichedArrivals = arrivals.map(arrival => {
    const route = references.routes?.[arrival.routeId] || {};
    const trip = references.trips?.[arrival.tripId] || {};

    return {
      routeId: arrival.routeId,
      routeName: route.shortName || route.longName || 'Unknown Route',
      routeColor: route.color,
      tripHeadsign: trip.tripHeadsign,
      scheduledArrivalTime: arrival.scheduledArrivalTime,
      predictedArrivalTime: arrival.predictedArrivalTime,
      scheduledDepartureTime: arrival.scheduledDepartureTime,
      predictedDepartureTime: arrival.predictedDepartureTime,
      status: arrival.status,
    };
  });

  return { arrivals: enrichedArrivals, error: null };
};

/**
 * Get routes for a specific agency
 * @param {string} agencyId - Agency ID
 * @returns {Promise} Array of routes
 */
export const getRoutesForAgency = async (agencyId) => {
  const result = await makeRequest('routes-for-agency', {
    id: agencyId,
  });

  if (result.error) {
    return { error: result.error, routes: [] };
  }

  const routes = result.data?.list || [];
  return { routes, error: null };
};

/**
 * Get agencies with coverage (to find available agencies)
 * @returns {Promise} Array of agencies
 */
export const getAgenciesWithCoverage = async () => {
  const result = await makeRequest('agencies-with-coverage');

  if (result.error) {
    return { error: result.error, agencies: [] };
  }

  const agencies = result.data?.references?.agencies || [];
  return { agencies, error: null };
};

/**
 * Get routes near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise} Array of routes
 */
export const getRoutesForLocation = async (lat, lng, radius = 500) => {
  const result = await makeRequest('routes-for-location', {
    lat: lat.toString(),
    lon: lng.toString(),
    radius: radius.toString(),
  });

  if (result.error) {
    return { error: result.error, routes: [] };
  }

  const routes = result.data?.list || [];
  return { routes, error: null };
};

/**
 * Get stops for a specific route
 * @param {string} routeId - Route ID
 * @returns {Promise} Array of stops for the route
 */
export const getStopsForRoute = async (routeId) => {
  const result = await makeRequest('stops-for-route', {
    id: routeId,
  });

  if (result.error) {
    return { error: result.error, stops: [] };
  }

  const stops = result.data?.references?.stops || [];
  return { stops, error: null };
};

