import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import { AddLocation } from '@mui/icons-material';
import MapView from '../components/MapView';
import { defaultMapCenter, defaultMapZoom } from '../config/googleMaps';
import { getLocations } from '../services/locationService';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [mapZoom, setMapZoom] = useState(defaultMapZoom);

  useEffect(() => {
    loadLocations();

    // Check if we have location state from navigation (e.g., from Locations page)
    if (location.state?.center) {
      setMapCenter(location.state.center);
      setMapZoom(location.state.zoom || 15);
    }
  }, [location.state]);

  const loadLocations = async () => {
    setLoading(true);
    const result = await getLocations();
    if (result.error) {
      console.error('Error loading locations:', result.error);
    } else {
      setLocations(result.documents);
    }
    setLoading(false);
  };

  // Convert locations to map markers
  const markers = locations
    .filter((loc) => loc.latitude && loc.longitude)
    .map((loc) => ({
      position: {
        lat: typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude),
        lng: typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude),
      },
      title: loc.name,
      location: loc,
    }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Welcome to Your Passion Project
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddLocation />}
          onClick={() => navigate('/locations')}
        >
          Manage Locations
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Map {locations.length > 0 && `(${locations.length} locations)`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MapView center={mapCenter} zoom={mapZoom} markers={markers} />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Locations
              </Typography>
              <Typography variant="h3" color="primary">
                {locations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Locations added to the map
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage resources provided by each location. Add categories,
                benefits, and detailed information about services available.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Get Started
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Manage Locations" to add your first location. Include details about
                categories, resources, and benefits offered.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
