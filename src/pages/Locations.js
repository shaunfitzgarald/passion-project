import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  Divider,
  Link,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { LocationOn, Delete, Edit, Cloud, ExpandMore, ExpandLess, Phone, Email, Language, AccessTime, Flag, DirectionsBus, Directions, DirectionsWalk } from '@mui/icons-material';
import { getLocations, deleteLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import ReviewsSection from '../components/ReviewsSection';
import PhotoGallery from '../components/PhotoGallery';
import ReportLocation from '../components/ReportLocation';
import PersonalNote from '../components/PersonalNote';
import { calculateDistance } from '../utils/locationUtils';
import { addToHistory } from '../services/historyService';

const Locations = ({ onLocationClick, onLocationEdit, userLocation = null }) => {
  const { isAdmin, user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, locationId: null });
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingLocation, setReportingLocation] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  // Helper function to get directions URL
  const getDirectionsUrl = (location, mode = 'transit') => {
    const lat = location.latitude;
    const lng = location.longitude;
    
    if (mode === 'transit') {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
    } else if (mode === 'walking') {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  };

  const loadLocations = async () => {
    setLoading(true);
    try {
      const result = await getLocations();
      if (result.error) {
        console.warn('Error loading locations:', result.error);
        setLocations([]);
      } else {
        setLocations(result.documents);
      }
    } catch (error) {
      console.warn('Error loading locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location) => {
    if (onLocationClick) {
      onLocationClick(location);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.locationId) {
      const result = await deleteLocation(deleteConfirm.locationId, user?.uid, isAdmin);
      if (!result.error) {
        loadLocations();
      } else {
        alert('Error deleting location: ' + result.error);
      }
    }
    setDeleteConfirm({ open: false, locationId: null });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Separate physical locations from online-only services
  const physicalLocations = locations.filter((loc) => !loc.onlineOnly);
  const onlineServices = locations.filter((loc) => loc.onlineOnly);

  const renderLocationCard = (location) => {
    const isExpanded = expandedLocation === location.id;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={location.id}>
        <Card
          sx={{
            bgcolor: '#2a2a2a',
            color: '#fff',
            '&:hover': {
              bgcolor: '#333',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ mb: 0, flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => {
                      // Add to history
                      if (location && location.id) {
                        addToHistory(location);
                      }
                      // Call parent handler
                      if (onLocationClick) {
                        onLocationClick(location);
                      }
                    }}
              >
                {location.name}
              </Typography>
              {location.onlineOnly && (
                <Chip
                  icon={<Cloud />}
                  label="Online"
                  size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff' }}
                />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedLocation(isExpanded ? null : location.id);
                }}
                sx={{ color: '#fff' }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            {location.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && ` ${location.state}`}
                {location.zipCode && ` ${location.zipCode}`}
              </Typography>
            )}
            {location.website && !location.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                🌐 {location.website}
              </Typography>
            )}
            {location.description && (
              <Typography variant="body2" sx={{ mb: 2 }} noWrap={!isExpanded}>
                {location.description}
              </Typography>
            )}
            {location.categories && location.categories.length > 0 && (
              <Box sx={{ mb: 1 }}>
                {location.categories.slice(0, 3).map((category, index) => (
                  <Chip
                    key={index}
                    label={category}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5, bgcolor: '#3a3a3a' }}
                  />
                ))}
                {location.categories.length > 3 && (
                  <Chip
                    label={`+${location.categories.length - 3}`}
                    size="small"
                    sx={{ bgcolor: '#3a3a3a' }}
                  />
                )}
              </Box>
            )}

            {/* Expanded Details */}
            <Collapse in={isExpanded}>
              <Divider sx={{ my: 2, bgcolor: '#444' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {location.description && (
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {location.description}
                  </Typography>
                )}

                {location.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: '#999' }} />
                    <Link href={`tel:${location.phone}`} sx={{ color: '#90caf9' }}>
                      {location.phone}
                    </Link>
                  </Box>
                )}

                {location.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: '#999' }} />
                    <Link href={`mailto:${location.email}`} sx={{ color: '#90caf9' }}>
                      {location.email}
                    </Link>
                  </Box>
                )}

                {location.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language sx={{ fontSize: 16, color: '#999' }} />
                    <Link
                      href={location.website.startsWith('http') ? location.website : `https://${location.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#90caf9' }}
                    >
                      {location.website}
                    </Link>
                  </Box>
                )}

                {location.hours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: '#999' }} />
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {location.hours}
                    </Typography>
                  </Box>
                )}

                {location.resources && location.resources.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Resources:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {location.resources.map((resource, idx) => (
                        <Chip
                          key={idx}
                          label={resource}
                          size="small"
                          sx={{ bgcolor: '#1a5490', color: '#fff', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {location.benefits && location.benefits.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Benefits:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {location.benefits.map((benefit, idx) => (
                        <Chip
                          key={idx}
                          label={benefit}
                          size="small"
                          sx={{ bgcolor: '#4caf50', color: '#fff', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {location.photos && location.photos.length > 0 && (
                  <PhotoGallery photos={location.photos} locationName={location.name} />
                )}

                {/* Personal Note */}
                <PersonalNote locationId={location.id} locationName={location.name} />

                {/* Quick Actions */}
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444' }}>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                    Quick Actions:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {location.phone && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Phone />}
                        href={`tel:${location.phone.replace(/\D/g, '')}`}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontSize: '0.7rem',
                          '&:hover': { borderColor: '#66bb6a', bgcolor: 'rgba(76, 175, 80, 0.1)' },
                        }}
                      >
                        Call
                      </Button>
                    )}
                    {location.email && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Email />}
                        href={`mailto:${location.email}`}
                        sx={{
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          fontSize: '0.7rem',
                          '&:hover': { borderColor: '#42a5f5', bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        }}
                      >
                        Email
                      </Button>
                    )}
                    {!location.onlineOnly && location.latitude && location.longitude && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DirectionsBus />}
                          onClick={() => window.open(getDirectionsUrl(location, 'transit'), '_blank')}
                          sx={{
                            borderColor: '#3F51B5',
                            color: '#3F51B5',
                            fontSize: '0.7rem',
                            '&:hover': { borderColor: '#5c6bc0', bgcolor: 'rgba(63, 81, 181, 0.1)' },
                          }}
                        >
                          Transit
                        </Button>
                        {userLocation && (() => {
                          const distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            location.latitude,
                            location.longitude
                          );
                          return distance !== null && distance < 1 ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DirectionsWalk />}
                              onClick={() => window.open(getDirectionsUrl(location, 'walking'), '_blank')}
                              sx={{
                                borderColor: '#4CAF50',
                                color: '#4CAF50',
                                fontSize: '0.7rem',
                                '&:hover': { borderColor: '#66bb6a', bgcolor: 'rgba(76, 175, 80, 0.1)' },
                              }}
                            >
                              Walk
                            </Button>
                          ) : null;
                        })()}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Directions />}
                          onClick={() => window.open(getDirectionsUrl(location, 'driving'), '_blank')}
                          sx={{
                            borderColor: '#555',
                            color: '#fff',
                            fontSize: '0.7rem',
                            '&:hover': { borderColor: '#777', bgcolor: 'rgba(255,255,255,0.05)' },
                          }}
                        >
                          Drive
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {location.notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontStyle: 'italic' }}>
                      {location.notes}
                    </Typography>
                  </Box>
                )}

                {/* Reviews Section */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #444' }}>
                  <ReviewsSection locationId={location.id} />
                </Box>
              </Box>
            </Collapse>
          </CardContent>
          <CardActions>
            {!location.onlineOnly && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to history
                  if (location && location.id) {
                    addToHistory(location);
                  }
                  // Call parent handler
                  if (onLocationClick) {
                    onLocationClick(location);
                  }
                }}
                sx={{ color: '#fff' }}
                title="View on map"
              >
                <LocationOn />
              </IconButton>
            )}
            {isAdmin && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLocationEdit) {
                      onLocationEdit(location);
                    }
                  }}
                  sx={{ color: '#1976d2' }}
                  title="Edit location"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ open: true, locationId: location.id });
                  }}
                  sx={{ color: '#ff4444' }}
                  title="Delete location"
                >
                  <Delete />
                </IconButton>
              </>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        All Locations ({locations.length})
      </Typography>

      {locations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No locations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Locations will appear here once approved by an admin.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Physical Locations */}
          {physicalLocations.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Physical Locations ({physicalLocations.length})
              </Typography>
              <Grid container spacing={2}>
                {physicalLocations.map((location) => renderLocationCard(location))}
              </Grid>
            </Box>
          )}

          {/* Online-Only Services */}
          {onlineServices.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cloud sx={{ fontSize: 24 }} />
                Online-Only Services ({onlineServices.length})
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#1a3a5f', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  These services are provided online only and do not have a physical location to visit.
                </Typography>
              </Paper>
              <Grid container spacing={2}>
                {onlineServices.map((location) => renderLocationCard(location))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, locationId: null })}
      >
        <DialogTitle>Delete Location</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this location? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, locationId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Locations;

