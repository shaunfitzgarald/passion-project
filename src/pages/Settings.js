import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
} from '@mui/material';
import {
  DarkMode,
  Notifications,
  LocationOn,
  Map,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { isAdmin } = useAuth();
  const [nightMode, setNightMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [clusterMarkers, setClusterMarkers] = useState(true);
  const [locationRandomizer, setLocationRandomizer] = useState(50);

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      <Paper sx={{ bgcolor: '#2a2a2a', mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkMode sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText
              primary="Night Mode"
              secondary="Dark theme for better visibility"
            />
            <Switch
              checked={nightMode}
              onChange={(e) => setNightMode(e.target.checked)}
              color="primary"
            />
          </ListItem>

          <Divider sx={{ bgcolor: '#444' }} />

          <ListItem>
            <ListItemIcon>
              <Map sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText
              primary="Cluster Markers"
              secondary="Group nearby markers together"
            />
            <Switch
              checked={clusterMarkers}
              onChange={(e) => setClusterMarkers(e.target.checked)}
              color="primary"
            />
          </ListItem>

          <Divider sx={{ bgcolor: '#444' }} />

          <ListItem>
            <ListItemIcon>
              <LocationOn sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText
              primary="Location Randomizer"
              secondary="Vary your location slightly for privacy"
            />
            <Box sx={{ width: 150, ml: 2 }}>
              <Slider
                value={locationRandomizer}
                onChange={(e, newValue) => setLocationRandomizer(newValue)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    color: '#1976d2',
                  },
                  '& .MuiSlider-track': {
                    color: '#1976d2',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Less
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  More
                </Typography>
              </Box>
            </Box>
          </ListItem>

          <Divider sx={{ bgcolor: '#444' }} />

          <ListItem>
            <ListItemIcon>
              <Notifications sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              secondary="Receive updates about new locations"
            />
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              color="primary"
            />
          </ListItem>
        </List>
      </Paper>

      {isAdmin && (
        <Paper sx={{ bgcolor: '#2a2a2a', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Admin Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have admin privileges. You can add and delete locations without approval,
            and manage users through the Admin Dashboard.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;

