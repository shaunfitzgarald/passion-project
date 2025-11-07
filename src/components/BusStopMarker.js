import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Chip, Button, CircularProgress } from '@mui/material';
import { DirectionsBus, Schedule } from '@mui/icons-material';
import { getStopArrivals } from '../services/oneBusAwayService';

const BusStopMarker = ({ stop, map }) => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [loadingArrivals, setLoadingArrivals] = useState(false);

  const handleStopClick = async () => {
    if (selectedStop === (stop.id || stop.code)) {
      setSelectedStop(null);
      return;
    }

    setSelectedStop(stop.id || stop.code);
    setLoadingArrivals(true);

    const result = await getStopArrivals(stop.id || stop.code);
    if (!result.error) {
      setArrivals(result.arrivals);
    }
    setLoadingArrivals(false);
  };

  // Create custom icon for bus stop
  const createBusStopIcon = () => {
    if (!window.google) return undefined;

    const size = 32;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#3F51B5" stroke="#fff" stroke-width="2"/>
        <path d="M8 8h16v12h-2v4h-4v-4h-8v4H8v-4H6V8zm2 2v8h12v-8H10z" fill="#fff" transform="translate(4, 4) scale(0.7)"/>
      </svg>
    `;

    const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

    return {
      url: svgUrl,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size / 2, size / 2),
    };
  };

  const formatArrivalTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) return 'Departed';
    if (diffMins === 0) return 'Arriving now';
    if (diffMins < 60) return `${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Marker
        position={{ lat: stop.lat, lng: stop.lng }}
        title={stop.name}
        icon={createBusStopIcon()}
        onClick={handleStopClick}
      />
      {selectedStop === (stop.id || stop.code) && (
        <InfoWindow
          position={{ lat: stop.lat, lng: stop.lng }}
          onCloseClick={() => setSelectedStop(null)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -10),
            maxWidth: 300,
          }}
        >
          <Box sx={{ color: '#000', minWidth: 250 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {stop.name}
            </Typography>
            {stop.code && (
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                Stop Code: {stop.code}
              </Typography>
            )}
            
            {stop.routes && stop.routes.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                  Routes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {stop.routes.slice(0, 5).map((route, idx) => (
                    <Chip
                      key={idx}
                      label={route.shortName || route.longName}
                      size="small"
                      sx={{
                        bgcolor: route.color || '#3F51B5',
                        color: '#fff',
                        fontSize: '0.65rem',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #ddd' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Schedule sx={{ fontSize: 14, color: '#666' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Next Arrivals:
                </Typography>
              </Box>
              
              {loadingArrivals ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : arrivals.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {arrivals.slice(0, 3).map((arrival, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 0.5,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={arrival.routeName}
                          size="small"
                          sx={{
                            bgcolor: arrival.routeColor || '#3F51B5',
                            color: '#fff',
                            fontSize: '0.6rem',
                            height: 18,
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {arrival.tripHeadsign}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
                        {formatArrivalTime(arrival.predictedArrivalTime || arrival.scheduledArrivalTime)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                  No arrival data available
                </Typography>
              )}
            </Box>

            <Button
              size="small"
              variant="outlined"
              startIcon={<DirectionsBus />}
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=transit`,
                  '_blank'
                );
              }}
              sx={{ mt: 1, width: '100%' }}
            >
              Get Directions
            </Button>
          </Box>
        </InfoWindow>
      )}
    </>
  );
};

export default BusStopMarker;

