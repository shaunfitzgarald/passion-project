import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Link,
  Button,
} from '@mui/material';
import {
  DirectionsBus,
  ExpandMore,
  ExpandLess,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import { getNearbyStops, getRoutesForLocation } from '../services/oneBusAwayService';
import { formatDistance } from '../utils/locationUtils';

const TransitSchedule = ({ location, onToggleBusStops, showBusStops = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    if (expanded && location) {
      loadTransitInfo();
    }
  }, [expanded, location]);

  const loadTransitInfo = async () => {
    if (!location || !location.latitude || !location.longitude) return;
    
    setLoading(true);
    
    try {
      // Try to get nearby stops
      const stopsResult = await getNearbyStops(location.latitude, location.longitude, 500);
      
      // Try to get routes for location
      const routesResult = await getRoutesForLocation(location.latitude, location.longitude, 500);
      
      if (stopsResult.error && routesResult.error) {
        // API not available or not configured
        setApiAvailable(false);
        setScheduleInfo({
          message: 'OneBusAway API is not configured or San Diego does not have a OneBusAway deployment. Use the Transit button to see detailed bus routes and schedules in Google Maps.',
          nearbyStops: [],
          routes: [],
        });
      } else {
        setApiAvailable(true);
        setScheduleInfo({
          message: 'Nearby transit stops and routes',
          nearbyStops: stopsResult.stops || [],
          routes: routesResult.routes || [],
        });
      }
    } catch (error) {
      console.error('Error loading transit info:', error);
      setApiAvailable(false);
      setScheduleInfo({
        message: 'Unable to load transit information. Use the Transit button to see detailed bus routes and schedules in Google Maps.',
        nearbyStops: [],
        routes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!location || location.onlineOnly) return null;

  return (
    <Paper
      sx={{
        mt: 1.5,
        pt: 1.5,
        borderTop: '1px solid #444',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DirectionsBus sx={{ fontSize: 16, color: '#3F51B5' }} />
          <Typography variant="caption" sx={{ color: '#999' }}>
            Transit Information
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: '#999', p: 0.5 }}>
          {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : scheduleInfo ? (
            <Box>
              <Alert severity="info" sx={{ mb: 1, bgcolor: '#1a3a5f', color: '#fff', fontSize: '0.75rem' }}>
                {scheduleInfo.message}
              </Alert>
              
              {scheduleInfo.nearbyStops && scheduleInfo.nearbyStops.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    Nearby Bus Stops ({scheduleInfo.nearbyStops.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {scheduleInfo.nearbyStops.slice(0, 5).map((stop, idx) => (
                      <Box
                        key={stop.id || idx}
                        sx={{
                          p: 1,
                          bgcolor: '#2a2a2a',
                          borderRadius: 1,
                          border: '1px solid #444',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                            <LocationOn sx={{ fontSize: 14, color: '#3F51B5', flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                              {stop.name}
                            </Typography>
                          </Box>
                          {stop.distance > 0 && (
                            <Typography variant="caption" sx={{ color: '#999', ml: 1 }}>
                              {formatDistance(stop.distance / 1000)} {/* Convert meters to km */}
                            </Typography>
                          )}
                        </Box>
                        {stop.code && (
                          <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                            Stop Code: {stop.code}
                          </Typography>
                        )}
                        {stop.routes && stop.routes.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {stop.routes.slice(0, 3).map((route, routeIdx) => (
                              <Chip
                                key={routeIdx}
                                label={route.shortName || route.longName || 'Route'}
                                size="small"
                                sx={{
                                  bgcolor: route.color || '#3F51B5',
                                  color: '#fff',
                                  fontSize: '0.6rem',
                                  height: 18,
                                }}
                              />
                            ))}
                            {stop.routes.length > 3 && (
                              <Chip
                                label={`+${stop.routes.length - 3}`}
                                size="small"
                                sx={{ bgcolor: '#555', color: '#fff', fontSize: '0.6rem', height: 18 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {scheduleInfo.routes && scheduleInfo.routes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    Bus Routes ({scheduleInfo.routes.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {scheduleInfo.routes.slice(0, 10).map((route, idx) => (
                      <Chip
                        key={route.id || idx}
                        label={route.shortName || route.longName || `Route ${idx + 1}`}
                        size="small"
                        sx={{
                          bgcolor: route.color || '#2a2a2a',
                          color: '#fff',
                          fontSize: '0.65rem',
                          mr: 0.5,
                          mb: 0.5,
                        }}
                      />
                    ))}
                    {scheduleInfo.routes.length > 10 && (
                      <Chip
                        label={`+${scheduleInfo.routes.length - 10} more`}
                        size="small"
                        sx={{ bgcolor: '#555', color: '#fff', fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #444' }}>
                {onToggleBusStops && (
                  <Box sx={{ mb: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LocationOn />}
                      onClick={() => onToggleBusStops(!showBusStops)}
                      sx={{
                        borderColor: showBusStops ? '#4caf50' : '#555',
                        color: showBusStops ? '#4caf50' : '#fff',
                        fontSize: '0.7rem',
                        '&:hover': { borderColor: showBusStops ? '#66bb6a' : '#777' },
                      }}
                    >
                      {showBusStops ? 'Hide Bus Stops on Map' : 'Show Bus Stops on Map'}
                    </Button>
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: '#999' }}>
                  💡 Tip: Click the "Transit" button above to open Google Maps with detailed transit directions, 
                  including bus routes, schedules, and real-time arrival information.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic', p: 1 }}>
              Click to view transit information
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TransitSchedule;

