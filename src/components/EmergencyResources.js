import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Collapse,
  Fab,
  Slide,
} from '@mui/material';
import {
  LocalHospital,
  Phone,
  Warning,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Close,
} from '@mui/icons-material';
import { getLocations } from '../services/locationService';
import { checkOpenStatus } from '../utils/locationUtils';

const EmergencyResources = () => {
  const [emergencyLocations, setEmergencyLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const scrollableRef = useRef(null);

  useEffect(() => {
    loadEmergencyResources();
  }, []);

  const loadEmergencyResources = async () => {
    setLoading(true);
    try {
      const result = await getLocations();
      if (!result.error) {
        // Filter for emergency/crisis resources
        const emergency = result.documents.filter(loc => {
          const categories = (loc.categories || []).map(c => c.toLowerCase());
          const resources = (loc.resources || []).map(r => r.toLowerCase());
          const name = (loc.name || '').toLowerCase();
          const desc = (loc.description || '').toLowerCase();
          
          const emergencyKeywords = [
            'emergency', 'crisis', 'hotline', '24/7', '24 hour', 'urgent',
            'shelter', 'homeless', 'suicide', 'mental health', 'crisis center',
            'emergency shelter', 'crisis intervention'
          ];
          
          return emergencyKeywords.some(keyword => 
            name.includes(keyword) || 
            desc.includes(keyword) ||
            categories.some(c => c.includes(keyword)) ||
            resources.some(r => r.includes(keyword)) ||
            (loc.hours && loc.hours.toLowerCase().includes('24'))
          );
        });
        
        setEmergencyLocations(emergency);
      }
    } catch (error) {
      console.error('Error loading emergency resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const emergencyHotlines = [
    { name: 'National Suicide Prevention Lifeline', phone: '988', description: '24/7 crisis support' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: '24/7 crisis support via text' },
    { name: 'San Diego Access & Crisis Line', phone: '(888) 724-7240', description: '24/7 mental health crisis support' },
    { name: '211 San Diego', phone: '211', description: 'Information and referral service' },
    { name: 'National Domestic Violence Hotline', phone: '(800) 799-7233', description: '24/7 support for domestic violence' },
  ];

  return (
    <>
      {/* Collapsed Red Circle Button - Bottom Right, organized with other buttons */}
      <Fab
        onClick={() => setExpanded(!expanded)}
        sx={{
          position: 'absolute',
          bottom: 80, // Positioned above comparison button (48px button + 12px gap)
          right: 20,
          zIndex: 1000,
          bgcolor: '#d32f2f',
          color: '#fff',
          width: 48,
          height: 48,
          '&:hover': {
            bgcolor: '#b71c1c',
          },
          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
          transition: 'all 0.3s ease',
        }}
        aria-label="Emergency Resources"
      >
        <Warning sx={{ fontSize: 24 }} />
      </Fab>

      {/* Expanded Panel - Slides out from the button */}
      <Slide direction="left" in={expanded} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1001,
            bgcolor: '#1a1a1a',
            color: '#fff',
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 'calc(100vh - 100px)',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#d32f2f',
              cursor: 'pointer',
            }}
            onClick={() => setExpanded(false)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Emergency Resources
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Close />
            </IconButton>
          </Box>

          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              flex: 1, 
              minHeight: 0,
              height: '100%',
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <Box sx={{ flexShrink: 0, overflow: 'visible', mb: 2 }}>
              <Box sx={{ mb: 2, bgcolor: '#5f1a1a', p: 1.5, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                  In a crisis? Call 988
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  National Suicide Prevention Lifeline - Available 24/7
                </Typography>
              </Box>

              {/* Emergency Hotlines */}
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#fff' }}>
                Crisis Hotlines
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {emergencyHotlines.map((hotline, idx) => (
                  <Card key={idx} sx={{ bgcolor: '#2a2a2a', border: '1px solid #444', flexShrink: 0 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                        {hotline.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Phone sx={{ fontSize: 14, color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                          {hotline.phone}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {hotline.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 1, pt: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        href={`tel:${hotline.phone.replace(/\D/g, '')}`}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontSize: '0.7rem',
                          '&:hover': { borderColor: '#66bb6a', bgcolor: 'rgba(76, 175, 80, 0.1)' },
                        }}
                      >
                        Call Now
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* 24/7 Locations */}
            {!loading && emergencyLocations.length > 0 && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  24/7 Available Locations ({emergencyLocations.length})
                </Typography>
                <Box 
                  ref={scrollableRef}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5, 
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: 1,
                    pb: 1,
                    minHeight: 0,
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': {
                      width: '10px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: '#1a1a1a',
                      borderRadius: '5px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: '#555',
                      borderRadius: '5px',
                      '&:hover': {
                        bgcolor: '#666',
                      },
                    },
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    
                    const element = e.currentTarget;
                    const { scrollTop, scrollHeight, clientHeight } = element;
                    const isScrollingDown = e.deltaY > 0;
                    const isScrollingUp = e.deltaY < 0;
                    
                    const canScrollDown = scrollTop < scrollHeight - clientHeight - 1;
                    const canScrollUp = scrollTop > 1;
                    
                    if ((isScrollingDown && !canScrollDown) || (isScrollingUp && !canScrollUp)) {
                      e.preventDefault();
                    }
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {emergencyLocations.map((location) => {
                    const openStatus = checkOpenStatus(location.hours);
                    return (
                      <Card
                        key={location.id}
                        sx={{
                          bgcolor: '#2a2a2a',
                          border: '1px solid #444',
                          cursor: 'pointer',
                          flexShrink: 0,
                          '&:hover': { bgcolor: '#333', transform: 'translateY(-1px)' },
                          transition: 'all 0.2s',
                        }}
                        onClick={() => {
                          window.location.href = `/?location=${location.id}`;
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', flex: 1, lineHeight: 1.4 }}>
                              {location.name}
                            </Typography>
                            {openStatus.isOpen === true && (
                              <Chip
                                label="Open"
                                size="small"
                                sx={{ bgcolor: '#4caf50', color: '#fff', fontSize: '0.65rem', height: 20, ml: 1, flexShrink: 0 }}
                              />
                            )}
                          </Box>
                          {location.address && (
                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1, lineHeight: 1.4 }}>
                              {location.address}
                              {location.city && `, ${location.city}`}
                              {location.state && ` ${location.state}`}
                            </Typography>
                          )}
                          {location.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Phone sx={{ fontSize: 14, color: '#4caf50', flexShrink: 0 }} />
                              <Typography
                                variant="caption"
                                component="a"
                                href={`tel:${location.phone.replace(/\D/g, '')}`}
                                sx={{ color: '#90caf9', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                              >
                                {location.phone}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexShrink: 0 }}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Loading locations...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default EmergencyResources;
