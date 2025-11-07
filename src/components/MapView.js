import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Link, Button, IconButton, Tooltip } from '@mui/material';
import {
      LocationOn,
      Home,
      LocalHospital,
      Restaurant,
      School,
      Work,
      DirectionsBus,
      ChildCare,
      LocalLibrary,
      VolunteerActivism,
      LocalPharmacy,
      RestaurantMenu,
      Hotel,
      Help,
      Phone,
      Email,
      Language,
      AccessTime,
      MyLocation,
      Directions,
      Favorite,
      FavoriteBorder,
      Edit,
      Flag,
      Share,
      CheckCircle,
      Cancel,
      DirectionsWalk,
    } from '@mui/icons-material';
import { GOOGLE_MAPS_API_KEY, defaultMapCenter, defaultMapZoom } from '../config/googleMaps';
import { calculateDistance, formatDistance, checkOpenStatus, shareLocation } from '../utils/locationUtils';
import { useTheme } from '../contexts/ThemeContext';
import PhotoGallery from './PhotoGallery';
import ReportLocation from './ReportLocation';
import PersonalNote from './PersonalNote';
import NearbyResources from './NearbyResources';
import TransitSchedule from './TransitSchedule';
import BusStopMarker from './BusStopMarker';
import { addToHistory } from '../services/historyService';
import { getNearbyStops } from '../services/oneBusAwayService';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

// Dark map styles
const darkMapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }]
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }]
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }]
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }]
  }
];

// Light map styles (minimal styling to use Google's default light theme)
const lightMapStyles = [];

const MapView = ({ 
  center = defaultMapCenter, 
  zoom = defaultMapZoom, 
  markers = [],
  filters = {},
  onFavoriteToggle = null,
  favorites = [],
  userLocation = null,
  onUserLocationRequest = null,
  onLocationEdit = null,
  allLocations = [],
  onLocationClick = null,
}) => {
  const { isDarkMode } = useTheme();
  const mapRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingLocation, setReportingLocation] = useState(null);
  const [nearbyBusStops, setNearbyBusStops] = useState([]);
  const [showBusStops, setShowBusStops] = useState(false);

  // Icon mapping
  const getIconComponent = (iconName) => {
    const iconMap = {
      home: Home,
      hotel: Hotel,
      local_hospital: LocalHospital,
      restaurant: Restaurant,
      restaurant_menu: RestaurantMenu,
      school: School,
      work: Work,
      directions_bus: DirectionsBus,
      child_care: ChildCare,
      local_library: LocalLibrary,
      volunteer_activism: VolunteerActivism,
      local_pharmacy: LocalPharmacy,
      help: Help,
      location_on: LocationOn,
    };
    return iconMap[iconName] || LocationOn;
  };

  // Create custom icon with different colors for different types
  const getIconColor = (iconName) => {
    const colorMap = {
      home: '#4CAF50', // Green for housing
      hotel: '#FF9800', // Orange for shelter
      local_hospital: '#F44336', // Red for healthcare
      restaurant: '#E91E63', // Pink for food
      restaurant_menu: '#9C27B0', // Purple for food pantry
      school: '#2196F3', // Blue for education
      work: '#00BCD4', // Cyan for employment
      directions_bus: '#3F51B5', // Indigo for transportation
      child_care: '#FFC107', // Amber for childcare
      local_library: '#795548', // Brown for community center
      volunteer_activism: '#009688', // Teal for non-profit
      local_pharmacy: '#8BC34A', // Light green for pharmacy
      help: '#9E9E9E', // Grey for other
      location_on: '#1976d2', // Default blue
    };
    return colorMap[iconName] || '#1976d2';
  };

  // Get Material Icons SVG path for each icon type
  const getIconPath = (iconName) => {
    const iconPaths = {
      home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      hotel: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7h8v-7z',
      local_hospital: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
      restaurant: 'M8.1 13.34l2.83-2.83L3.91 3c-1.29 1.29-1.29 3.38 0 4.67l4.19 4.18zm6.78-1.81c1.29.01 2.3-1.01 2.31-2.31.01-1.3-1.01-2.31-2.31-2.31-1.29 0-2.3 1.01-2.31 2.31 0 1.3 1.01 2.31 2.31 2.31zm-1.12 2.83c-.47-.47-1.11-.73-1.78-.73-.67 0-1.31.26-1.78.73l-4.19 4.19c-.47.47-.73 1.11-.73 1.78s.26 1.31.73 1.78c.47.47 1.11.73 1.78.73.67 0 1.31-.26 1.78-.73l4.19-4.19c.47-.47.73-1.11.73-1.78s-.26-1.31-.73-1.78zm-8.48-5.19c-.47-.47-1.11-.73-1.78-.73-.67 0-1.31.26-1.78.73-.47.47-.73 1.11-.73 1.78s.26 1.31.73 1.78c.47.47 1.11.73 1.78.73.67 0 1.31-.26 1.78-.73.47-.47.73-1.11.73-1.78s-.26-1.31-.73-1.78zM17.65 4.93l-1.41 1.41-3.54-3.54 1.41-1.41c.39-.39 1.02-.39 1.41 0l2.13 2.13c.39.39.39 1.02 0 1.41zm-3.54 3.54l-3.54-3.54 1.41-1.41 3.54 3.54-1.41 1.41z',
      restaurant_menu: 'M8.1 13.34l2.83-2.83L3.91 3c-1.29 1.29-1.29 3.38 0 4.67l4.19 4.18zm6.78-1.81c1.29.01 2.3-1.01 2.31-2.31.01-1.3-1.01-2.31-2.31-2.31-1.29 0-2.3 1.01-2.31 2.31 0 1.3 1.01 2.31 2.31 2.31zm-1.12 2.83c-.47-.47-1.11-.73-1.78-.73-.67 0-1.31.26-1.78.73l-4.19 4.19c-.47.47-.73 1.11-.73 1.78s.26 1.31.73 1.78c.47.47 1.11.73 1.78.73.67 0 1.31-.26 1.78-.73l4.19-4.19c.47-.47.73-1.11.73-1.78s-.26-1.31-.73-1.78z',
      school: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
      work: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
      directions_bus: 'M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z',
      child_care: 'M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.5.54l1.27 1.27c.37-.17.77-.27 1.23-.27zM5.33 4.06L4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z',
      local_library: 'M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM3 3h18v2H3V3z',
      volunteer_activism: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      local_pharmacy: 'M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9h-3v3h-2v-3H8v-2h3V9h2v3h3v2z',
      help: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
      location_on: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    };
    return iconPaths[iconName] || iconPaths.location_on;
  };

  // Create custom icon with the actual icon shape
  const createCustomIcon = (iconName, isSelected = false, isHovered = false) => {
    if (!isLoaded || !window.google) {
      return undefined; // Return default icon if Google Maps not loaded
    }
    
    const baseColor = getIconColor(iconName);
    const color = isSelected || isHovered ? '#ff4444' : baseColor;
    const iconPath = getIconPath(iconName);
    const scale = isSelected || isHovered ? 1.3 : 1.0;
    
    // Create a distinctive circular marker with the icon inside
    // Using a circle background with the icon path on top
    const size = 48;
    const iconSize = 24;
    const iconOffset = (size - iconSize) / 2;
    
    // Create SVG data URL
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="#fff" stroke-width="3"/>
        <path d="${iconPath}" fill="#fff" transform="translate(${iconOffset}, ${iconOffset}) scale(${iconSize/24})"/>
      </svg>
    `;
    
    const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    
    return {
      url: svgUrl,
      scaledSize: new window.google.maps.Size(size * scale, size * scale),
      anchor: new window.google.maps.Point((size * scale) / 2, (size * scale) / 2),
    };
  };

  // Use useLoadScript hook instead of LoadScript component to prevent multiple loads
  const { isLoaded, loadError: scriptLoadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'], // Add places library for future use
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setLoadError(null);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Update map styles when theme changes
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.setOptions({
        styles: isDarkMode ? darkMapStyles : lightMapStyles
      });
    }
  }, [isDarkMode, isLoaded]);

  // Handle script load errors
  React.useEffect(() => {
    if (scriptLoadError) {
      console.error('Google Maps script load error:', scriptLoadError);
      setLoadError('Failed to load Google Maps. This usually means: 1) API key is invalid/restricted, 2) Maps JavaScript API not enabled, 3) Billing not enabled. Check browser console for details.');
    }
  }, [scriptLoadError]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get directions URL (opens in Google/Apple Maps)
  const getDirectionsUrl = (location, mode = 'transit') => {
    const lat = location.latitude;
    const lng = location.longitude;
    const address = encodeURIComponent(
      `${location.address || ''} ${location.city || ''} ${location.state || ''}`.trim()
    );
    
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use platform-specific URLs
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isIOS) {
        // iOS Maps with different modes
        if (mode === 'transit') {
          return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=r`; // r = transit
        } else if (mode === 'walking') {
          return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`; // w = walking
        } else {
          return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`; // d = driving
        }
      } else {
        // Android with different modes
        if (mode === 'transit') {
          return `google.navigation:q=${lat},${lng}&mode=t`; // t = transit
        } else if (mode === 'walking') {
          return `google.navigation:q=${lat},${lng}&mode=w`; // w = walking
        } else {
          return `google.navigation:q=${lat},${lng}`;
        }
      }
    } else {
      // Desktop - open in Google Maps web with different modes
      if (mode === 'transit') {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
      } else if (mode === 'walking') {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
      } else {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
    }
  };

  // Filter markers based on filters
  const filteredMarkers = markers.filter((marker) => {
    const location = marker.location || {};
    
    // Filter by icon type
    if (filters.iconTypes && filters.iconTypes.length > 0) {
      const iconName = location.icon || 'location_on';
      if (!filters.iconTypes.includes(iconName)) {
        return false;
      }
    }
    
    // Filter by favorites only
    if (filters.favoritesOnly && onFavoriteToggle) {
      const locationId = location.id;
      if (!favorites.includes(locationId)) {
        return false;
      }
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchableText = [
        location.name,
        location.description,
        location.address,
        ...(location.categories || []),
        ...(location.resources || []),
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    // Filter by distance
    if (filters.maxDistance && userLocation && location.latitude && location.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        location.latitude,
        location.longitude
      );
      if (distance !== null && distance > filters.maxDistance) {
        return false;
      }
    }
    
    // Filter by open status
    if (filters.openStatus && filters.openStatus !== 'all' && location.hours) {
      const openStatus = checkOpenStatus(location.hours);
      if (filters.openStatus === 'open' && openStatus.isOpen !== true) {
        return false;
      }
      if (filters.openStatus === 'closed' && openStatus.isOpen !== false) {
        return false;
      }
      if (filters.openStatus === '24hours') {
        const hoursLower = (location.hours || '').toLowerCase();
        if (!hoursLower.includes('24') && !hoursLower.includes('24/7')) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Load nearby bus stops when a location is selected and bus stops are enabled
  const loadNearbyBusStops = async (lat, lng) => {
    const result = await getNearbyStops(lat, lng, 500);
    if (!result.error && result.stops) {
      setNearbyBusStops(result.stops);
    }
  };

  useEffect(() => {
    if (selectedMarker !== null && filteredMarkers[selectedMarker] && showBusStops) {
      const location = filteredMarkers[selectedMarker].location;
      if (location && location.latitude && location.longitude) {
        loadNearbyBusStops(location.latitude, location.longitude);
      }
    } else {
      setNearbyBusStops([]);
    }
  }, [selectedMarker, showBusStops, filteredMarkers.length]);

  // Update user location marker
  useEffect(() => {
    if (userLocation && showUserLocation) {
      setUserLocationMarker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
      });
    } else {
      setUserLocationMarker(null);
    }
  }, [userLocation, showUserLocation]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: '#fff',
        p: 3
      }}>
        <Alert severity="warning" sx={{ maxWidth: 600, bgcolor: '#2a2a2a', color: '#fff' }}>
          <Typography variant="h6" gutterBottom>
            Google Maps API Key not configured
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file and restart the server
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: '#fff',
        p: 3
      }}>
        <Alert severity="error" sx={{ maxWidth: 600, bgcolor: '#2a2a2a', color: '#fff' }}>
          <Typography variant="h6" gutterBottom>
            Map Loading Error
          </Typography>
          <Typography variant="body2">
            {loadError}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontSize: '0.875rem' }}>
            Common fixes:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Ensure "Maps JavaScript API" is enabled in Google Cloud Console</li>
              <li>Check API key restrictions allow localhost:3000</li>
              <li>Verify billing is enabled (required even for free tier)</li>
              <li>Check API key restrictions in Google Cloud Console → Credentials</li>
              <li>Open browser console (F12) for detailed error messages</li>
              <li>Restart the dev server after changing .env file</li>
            </ul>
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#999' }}>
            Current API Key: {GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'Not set'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Show loading state while script is loading
  if (!isLoaded) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: '#fff'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* User Location Button - Top Right */}
      {onUserLocationRequest && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Show my location">
            <IconButton
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      };
                      if (onUserLocationRequest) {
                        onUserLocationRequest(loc);
                      }
                      setShowUserLocation(true);
                      if (mapRef.current) {
                        mapRef.current.setCenter(loc);
                        mapRef.current.setZoom(15);
                      }
                    },
                    (error) => {
                      console.error('Error getting location:', error);
                      alert('Unable to get your location. Please enable location services.');
                    }
                  );
                } else {
                  alert('Geolocation is not supported by your browser.');
                }
              }}
              sx={{
                bgcolor: '#1a1a1a',
                color: '#fff',
                '&:hover': { bgcolor: '#2a2a2a' },
                boxShadow: 2,
                width: 48,
                height: 48,
              }}
            >
              <MyLocation />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: isDarkMode ? darkMapStyles : lightMapStyles
        }}
      >
        {/* User Location Marker */}
        {userLocationMarker && showUserLocation && isLoaded && window.google && (
          <Marker
            position={userLocationMarker.position}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3,
            }}
            title="Your Location"
            zIndex={1000}
          />
        )}

        {/* Location Markers with Clustering */}
        {isLoaded && window.google && filteredMarkers.length > 0 && (
          <MarkerClusterer
            averageCenter
            enableRetinaIcons
            gridSize={60}
            maxZoom={15}
          >
            {(clusterer) => (
              <>
                {filteredMarkers.map((marker, index) => {
                  const location = marker.location || {};
                  const iconName = location.icon || 'location_on';
                  const isSelected = selectedMarker === index;
                  const isHovered = hoveredMarker === index;
                  const locationId = location.id;
                  const isFavorited = favorites.includes(locationId);
                  
                  // Calculate distance if user location is available
                  const distance = userLocation && location.latitude && location.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        location.latitude,
                        location.longitude
                      )
                    : null;
                  
                  return (
                    <React.Fragment key={index}>
                      <Marker
                        position={marker.position}
                        title={marker.title}
                        icon={createCustomIcon(iconName, isSelected, isHovered)}
                        onClick={() => {
                          setSelectedMarker(isSelected ? null : index);
                          // Add to history when marker is clicked
                          if (location && location.id) {
                            addToHistory(location);
                          }
                          // Call onLocationClick if provided
                          if (onLocationClick && location) {
                            onLocationClick(location);
                          }
                        }}
                        onMouseOver={() => setHoveredMarker(index)}
                        onMouseOut={() => setHoveredMarker(null)}
                        clusterer={clusterer}
                      />
              {(isSelected || isHovered) && (
                <InfoWindow
                  position={marker.position}
                  onCloseClick={() => setSelectedMarker(null)}
                  options={{
                    pixelOffset: isLoaded && window.google ? new window.google.maps.Size(0, -40) : undefined,
                    maxWidth: 300,
                  }}
                >
                  <Paper sx={{ p: 2, maxWidth: 300, bgcolor: '#2a2a2a', color: '#fff' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#fff' }}>
                      {location.name}
                    </Typography>
                    
                    {location.address && (
                      <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                        {location.address}
                        {location.city && `, ${location.city}`}
                        {location.state && `, ${location.state}`}
                      </Typography>
                    )}
                    
                    {location.description && (
                      <Typography variant="body2" sx={{ mb: 1.5, color: '#fff' }}>
                        {location.description.length > 100 
                          ? `${location.description.substring(0, 100)}...` 
                          : location.description}
                      </Typography>
                    )}
                    
                    {location.categories && location.categories.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {location.categories.slice(0, 3).map((cat, idx) => (
                          <Chip
                            key={idx}
                            label={cat}
                            size="small"
                            sx={{ bgcolor: '#3a3a3a', color: '#fff', fontSize: '0.7rem' }}
                          />
                        ))}
                        {location.categories.length > 3 && (
                          <Chip
                            label={`+${location.categories.length - 3}`}
                            size="small"
                            sx={{ bgcolor: '#3a3a3a', color: '#fff', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
                      {location.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: '#999' }} />
                          <Link href={`tel:${location.phone}`} sx={{ color: '#90caf9', fontSize: '0.875rem' }}>
                            {location.phone}
                          </Link>
                        </Box>
                      )}
                      {location.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 14, color: '#999' }} />
                          <Link href={`mailto:${location.email}`} sx={{ color: '#90caf9', fontSize: '0.875rem' }}>
                            {location.email}
                          </Link>
                        </Box>
                      )}
                      {location.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Language sx={{ fontSize: 14, color: '#999' }} />
                          <Link 
                            href={location.website.startsWith('http') ? location.website : `https://${location.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#90caf9', fontSize: '0.875rem' }}
                          >
                            Website
                          </Link>
                        </Box>
                      )}
                      {location.hours && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 14, color: '#999' }} />
                          <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.875rem' }}>
                            {location.hours}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Open Status & Distance */}
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {location.hours && (() => {
                        const openStatus = checkOpenStatus(location.hours);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {openStatus.isOpen === true ? (
                              <>
                                <CheckCircle sx={{ fontSize: 14, color: '#4caf50' }} />
                                <Typography variant="body2" sx={{ color: '#4caf50', fontSize: '0.875rem', fontWeight: 600 }}>
                                  {openStatus.status}
                                </Typography>
                              </>
                            ) : openStatus.isOpen === false ? (
                              <>
                                <Cancel sx={{ fontSize: 14, color: '#f44336' }} />
                                <Typography variant="body2" sx={{ color: '#f44336', fontSize: '0.875rem' }}>
                                  {openStatus.status}
                                </Typography>
                              </>
                            ) : null}
                          </Box>
                        );
                      })()}
                      
                      {userLocation && location.latitude && location.longitude && (() => {
                        const distance = calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          location.latitude,
                          location.longitude
                        );
                        return distance !== null ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 14, color: '#999' }} />
                            <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.875rem' }}>
                              {formatDistance(distance)} away
                            </Typography>
                          </Box>
                        ) : null;
                      })()}
                    </Box>
                    
                    {location.resources && location.resources.length > 0 && (
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444' }}>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                          Resources:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {location.resources.slice(0, 4).map((res, idx) => (
                            <Chip
                              key={idx}
                              label={res}
                              size="small"
                              sx={{ bgcolor: '#1a5490', color: '#fff', fontSize: '0.65rem', height: '20px' }}
                            />
                          ))}
                          {location.resources.length > 4 && (
                            <Chip
                              label={`+${location.resources.length - 4}`}
                              size="small"
                              sx={{ bgcolor: '#1a5490', color: '#fff', fontSize: '0.65rem', height: '20px' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Photos */}
                    {location.photos && location.photos.length > 0 && (
                      <PhotoGallery photos={location.photos} locationName={location.name} />
                    )}

                    {/* Transit Schedule */}
                    <TransitSchedule 
                      location={location}
                      onToggleBusStops={(show) => setShowBusStops(show)}
                      showBusStops={showBusStops}
                    />
                    
                    {/* Personal Note */}
                    <PersonalNote locationId={locationId} locationName={location.name} />
                    
                    {/* Distance and Actions */}
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {distance !== null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: '#999' }} />
                          <Typography variant="body2" sx={{ color: '#90caf9', fontWeight: 500 }}>
                            {formatDistance(distance)} away
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DirectionsBus />}
                          onClick={() => {
                            const url = getDirectionsUrl(location, 'transit');
                            window.open(url, '_blank');
                          }}
                          sx={{ 
                            bgcolor: '#3F51B5',
                            '&:hover': { bgcolor: '#303f9f' },
                            flex: 1,
                            minWidth: '100px',
                          }}
                          title="Get transit directions (bus/train) - Recommended"
                        >
                          Transit
                        </Button>
                        {distance !== null && distance < 1 && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DirectionsWalk />}
                            onClick={() => {
                              const url = getDirectionsUrl(location, 'walking');
                              window.open(url, '_blank');
                            }}
                            sx={{ 
                              bgcolor: '#4CAF50',
                              '&:hover': { bgcolor: '#388e3c' },
                              flex: 1,
                              minWidth: '80px',
                            }}
                            title="Get walking directions"
                          >
                            Walk
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Directions />}
                          onClick={() => {
                            const url = getDirectionsUrl(location, 'driving');
                            window.open(url, '_blank');
                          }}
                          sx={{ 
                            borderColor: '#555',
                            color: '#fff',
                            fontSize: '0.75rem',
                            '&:hover': { borderColor: '#777', bgcolor: 'rgba(255,255,255,0.05)' },
                          }}
                          title="Get driving directions"
                        >
                          Drive
                        </Button>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Share />}
                          onClick={async () => {
                            await shareLocation(location);
                          }}
                          sx={{ 
                            borderColor: '#555',
                            color: '#fff',
                            fontSize: '0.75rem',
                            '&:hover': { borderColor: '#777', bgcolor: 'rgba(255,255,255,0.05)' },
                          }}
                        >
                          Share
                        </Button>
                        
                        {onLocationEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onLocationEdit(location)}
                            sx={{ 
                              color: '#1976d2',
                              border: '1px solid #555',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                            }}
                            title="Edit location"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        
                        {onFavoriteToggle && (
                          <IconButton
                            size="small"
                            onClick={() => onFavoriteToggle(locationId)}
                            sx={{ 
                              color: isFavorited ? '#f44336' : '#fff',
                              border: '1px solid #555',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            }}
                          >
                            {isFavorited ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        )}

                        <IconButton
                          size="small"
                          onClick={() => {
                            setReportingLocation(location);
                            setReportDialogOpen(true);
                          }}
                          sx={{ 
                            color: '#ff9800',
                            border: '1px solid #555',
                            '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' },
                          }}
                          title="Report incorrect information"
                        >
                          <Flag />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
        </>
      )}
    </MarkerClusterer>
        )}

        {/* Bus Stop Markers */}
        {showBusStops && nearbyBusStops.map((stop) => (
          <BusStopMarker key={stop.id || stop.code || `stop-${stop.lat}-${stop.lng}`} stop={stop} map={mapRef.current} />
        ))}
      </GoogleMap>

      {/* Report Location Dialog */}
      {reportingLocation && (
        <ReportLocation
          location={reportingLocation}
          open={reportDialogOpen}
          onClose={() => {
            setReportDialogOpen(false);
            setReportingLocation(null);
          }}
        />
      )}

      {/* Nearby Resources Panel */}
      {selectedMarker !== null && filteredMarkers[selectedMarker] && (
        <NearbyResources
          currentLocation={filteredMarkers[selectedMarker].location}
          allLocations={allLocations.length > 0 ? allLocations : markers.map(m => m.location)}
          onLocationClick={(loc) => {
            // Find marker index and select it
            const markerIndex = markers.findIndex(m => m.location?.id === loc.id);
            if (markerIndex !== -1) {
              setSelectedMarker(markerIndex);
              if (onLocationClick) {
                onLocationClick(loc);
              }
            }
          }}
        />
      )}
    </Box>
  );
};

export default MapView;

