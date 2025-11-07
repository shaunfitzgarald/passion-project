# OneBusAway API Setup Instructions

## Overview

OneBusAway is a transit API that provides real-time bus arrival information, routes, and stops. However, **OneBusAway requires a server deployment for each city/region**, and San Diego may or may not have an active OneBusAway instance.

## Important Notes

1. **San Diego Transit Systems**: San Diego uses:
   - **MTS (Metropolitan Transit System)** - Covers central and southern San Diego County
   - **NCTD (North County Transit District)** - Covers northern San Diego County

2. **OneBusAway Deployment**: Check if San Diego has a OneBusAway deployment:
   - Visit: https://github.com/OneBusAway/onebusaway-application-modules/wiki/OneBusAway-Deployments
   - Or search for "San Diego OneBusAway" online

3. **Alternative Options**: If OneBusAway is not available for San Diego, consider:
   - **Google Transit API** (already integrated via Google Maps)
   - **TransitLand API** (https://transit.land/)
   - **MTS/NCTD Direct APIs** (if they provide public APIs)

## Setup Steps (If OneBusAway is Available)

### 1. Get API Key

1. Visit the OneBusAway developer page for your region
2. Register for an API key
3. The API key is used to track usage and may be required for all requests

### 2. Find the Server URL

OneBusAway deployments have different server URLs. Common formats:
- `https://api.onebusaway.org/api/where/` (if using the main instance)
- `https://[city].onebusaway.org/api/where/` (city-specific)
- Check the OneBusAway deployments wiki for San Diego-specific URL

### 3. Configure Environment Variables

Add to your `.env` file:

```env
REACT_APP_ONEBUSAWAY_API_KEY=your_api_key_here
REACT_APP_ONEBUSAWAY_BASE_URL=https://api.onebusaway.org/api/where
```

**Note**: Replace the base URL with the actual San Diego OneBusAway server URL if different.

### 4. Test the API

The application will automatically:
- Try to fetch nearby bus stops when viewing a location
- Display bus stops on the map when enabled
- Show real-time arrival information

If the API is not available or not configured, the app will gracefully fall back to showing a message directing users to use the Transit button for Google Maps directions.

## Features Implemented

1. **Nearby Bus Stops**: Shows bus stops within 500 meters of a location
2. **Bus Stop Markers**: Displays bus stops on the map with custom icons
3. **Real-time Arrivals**: Shows next bus arrivals when clicking on a stop
4. **Route Information**: Displays which routes serve each stop
5. **Transit Schedule Component**: Enhanced to show actual transit data

## API Endpoints Used

- `stops-for-location` - Get nearby bus stops
- `arrivals-and-departures-for-stop` - Get real-time arrival times
- `routes-for-location` - Get routes near a location
- `stops-for-route` - Get all stops for a specific route

## Troubleshooting

1. **"API key not configured"**: Add the API key to `.env` file
2. **"API request failed"**: Check if San Diego has a OneBusAway deployment
3. **No data returned**: The API may not be available for San Diego - use Google Maps transit directions instead
4. **CORS errors**: OneBusAway servers should support CORS, but if not, you may need a backend proxy

## Alternative: Google Transit API

If OneBusAway is not available, the app already uses Google Maps transit directions, which provides:
- Bus routes and schedules
- Real-time transit information
- Detailed directions
- Integration with Google Maps app

The Transit button in location InfoWindows opens Google Maps with transit directions, which is a reliable fallback.

