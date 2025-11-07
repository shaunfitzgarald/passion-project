import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  Delete,
  History,
  Clear,
} from '@mui/icons-material';
import { getHistory, clearHistory, removeFromHistory } from '../services/historyService';
import { useAuth } from '../contexts/AuthContext';

const LocationHistory = ({ onLocationClick }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    const historyData = getHistory();
    setHistory(historyData);
    setLoading(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all location history?')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleRemoveLocation = (locationId) => {
    removeFromHistory(locationId);
    loadHistory();
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Please sign in to view your location history.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Recently Viewed ({history.length})
          </Typography>
        </Box>
        {history.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={handleClearHistory}
            sx={{ borderColor: '#555', color: '#fff' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <History sx={{ fontSize: 64, color: '#555', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No history yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Locations you view will appear here
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {history.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 0, flexGrow: 1, cursor: 'pointer' }}
                      onClick={() => {
                        if (onLocationClick) {
                          onLocationClick(item);
                        }
                      }}
                    >
                      {item.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveLocation(item.id)}
                      sx={{ color: '#ff4444' }}
                      title="Remove from history"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  
                  {item.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.address}
                      {item.city && `, ${item.city}`}
                      {item.state && ` ${item.state}`}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LocationOn sx={{ fontSize: 14, color: '#999' }} />
                    <Typography variant="caption" color="text.secondary">
                      Viewed {new Date(item.viewedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {item.latitude && item.longitude && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocationOn />}
                      onClick={() => {
                        if (onLocationClick) {
                          onLocationClick(item);
                        }
                      }}
                      sx={{
                        mt: 1,
                        borderColor: '#555',
                        color: '#fff',
                        '&:hover': { borderColor: '#777', bgcolor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      View on Map
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LocationHistory;

