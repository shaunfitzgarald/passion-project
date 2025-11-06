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
} from '@mui/material';
import { LocationOn, Delete, Edit, Cloud } from '@mui/icons-material';
import { getLocations, deleteLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

const Locations = ({ onLocationClick, onLocationEdit }) => {
  const { isAdmin, user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, locationId: null });

  useEffect(() => {
    loadLocations();
  }, []);

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

  const renderLocationCard = (location) => (
    <Grid item xs={12} sm={6} md={4} key={location.id}>
      <Card
        sx={{
          bgcolor: '#2a2a2a',
          color: '#fff',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#333',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          },
        }}
        onClick={() => handleLocationClick(location)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 0, flexGrow: 1 }}>
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
          </Box>
          {location.address && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {location.address}
            </Typography>
          )}
          {location.website && !location.address && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              🌐 {location.website}
            </Typography>
          )}
          {location.description && (
            <Typography variant="body2" sx={{ mb: 2 }} noWrap>
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
        </CardContent>
        <CardActions>
          {!location.onlineOnly && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleLocationClick(location);
              }}
              sx={{ color: '#fff' }}
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
              >
                <Delete />
              </IconButton>
            </>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

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
    </Box>
  );
};

export default Locations;

