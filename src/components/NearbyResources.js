import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  ExpandMore,
  ExpandLess,
  DirectionsBus,
} from '@mui/icons-material';
import { getLocations } from '../services/locationService';
import { calculateDistance, formatDistance } from '../utils/locationUtils';

const NearbyResources = ({ currentLocation, allLocations, onLocationClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      findNearbyResources();
    }
  }, [currentLocation, allLocations]);

  const findNearbyResources = () => {
    if (!currentLocation || !allLocations) return;
    
    setLoading(true);
    
    const currentLat = currentLocation.latitude;
    const currentLng = currentLocation.longitude;
    const maxDistance = 2; // 2 miles radius
    
    const nearby = allLocations
      .filter(loc => {
        // Exclude the current location
        if (loc.id === currentLocation.id) return false;
        
        // Only include physical locations
        if (loc.onlineOnly || !loc.latitude || !loc.longitude) return false;
        
        // Calculate distance
        const distance = calculateDistance(
          currentLat,
          currentLng,
          loc.latitude,
          loc.longitude
        );
        
        return distance !== null && distance <= maxDistance;
      })
      .map(loc => {
        const distance = calculateDistance(
          currentLat,
          currentLng,
          loc.latitude,
          loc.longitude
        );
        return { ...loc, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Show top 5 nearby
    
    setNearbyLocations(nearby);
    setLoading(false);
  };

  if (!currentLocation || nearbyLocations.length === 0) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        bgcolor: '#1a1a1a',
        color: '#fff',
        minWidth: 280,
        maxWidth: 350,
        maxHeight: '40vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid #444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#2a2a2a',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ fontSize: 18, color: '#4caf50' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Nearby Resources ({nearbyLocations.length})
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: '#fff' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(40vh - 60px)' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              {nearbyLocations.map((location) => (
                <Card
                  key={location.id}
                  sx={{
                    mb: 1,
                    bgcolor: '#2a2a2a',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#333' },
                  }}
                  onClick={() => {
                    if (onLocationClick) {
                      onLocationClick(location);
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', flex: 1 }}>
                        {location.name}
                      </Typography>
                      <Chip
                        label={formatDistance(location.distance)}
                        size="small"
                        sx={{ bgcolor: '#4caf50', color: '#fff', fontSize: '0.65rem', height: 20, ml: 1 }}
                      />
                    </Box>
                    {location.address && (
                      <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                        {location.address}
                      </Typography>
                    )}
                    {location.categories && location.categories.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {location.categories.slice(0, 2).map((cat, idx) => (
                          <Chip
                            key={idx}
                            label={cat}
                            size="small"
                            sx={{ bgcolor: '#3a3a3a', color: '#fff', fontSize: '0.6rem', height: 18 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NearbyResources;

