import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  DarkMode,
  Notifications,
  LocationOn,
  Map,
  Cookie,
  Language,
  Palette,
  VolumeUp,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateConsent } from '../utils/analytics';

const Settings = () => {
  const { isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : true;
  });
  const [clusterMarkers, setClusterMarkers] = useState(() => {
    const saved = localStorage.getItem('clusterMarkers');
    return saved ? JSON.parse(saved) : true;
  });
  const [locationRandomizer, setLocationRandomizer] = useState(() => {
    const saved = localStorage.getItem('locationRandomizer');
    return saved ? parseInt(saved) : 50;
  });
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [cookies, setCookies] = useState(() => {
    const saved = localStorage.getItem('cookieConsent');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { necessary: true, analytics: false, functional: false, marketing: false };
      }
    }
    return { necessary: true, analytics: false, functional: false, marketing: false };
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('clusterMarkers', JSON.stringify(clusterMarkers));
  }, [clusterMarkers]);

  useEffect(() => {
    localStorage.setItem('locationRandomizer', locationRandomizer.toString());
  }, [locationRandomizer]);

  const handleCookieSave = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(cookies));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    updateConsent(cookies.analytics, cookies.marketing);
    setCookieSettingsOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      <Paper sx={{ bgcolor: 'background.paper', mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkMode />
            </ListItemIcon>
            <ListItemText
              primary="Night Mode"
              secondary="Dark theme for better visibility"
            />
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              color="primary"
            />
          </ListItem>

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <Map />
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

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <LocationOn />
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

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <Notifications />
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

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <Cookie />
            </ListItemIcon>
            <ListItemText
              primary="Cookie Preferences"
              secondary="Manage your cookie settings"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCookieSettingsOpen(true)}
            >
              Manage
            </Button>
          </ListItem>

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText
              primary="Language"
              secondary="English (US)"
            />
            <Typography variant="body2" color="text.secondary">
              Coming soon
            </Typography>
          </ListItem>

          <Divider sx={{ bgcolor: 'divider' }} />

          <ListItem>
            <ListItemIcon>
              <Speed />
            </ListItemIcon>
            <ListItemText
              primary="Map Performance"
              secondary="Optimize map rendering for better performance"
            />
            <Switch
              checked={clusterMarkers}
              onChange={(e) => setClusterMarkers(e.target.checked)}
              color="primary"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Cookie Settings Dialog */}
      <Dialog
        open={cookieSettingsOpen}
        onClose={() => setCookieSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cookie Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cookies.necessary}
                  disabled
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Necessary Cookies
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Required for the website to function properly.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', width: '100%' }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cookies.analytics}
                  onChange={(e) => setCookies({ ...cookies, analytics: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Analytics Cookies
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Help us understand how visitors interact with our website.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', width: '100%' }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cookies.functional}
                  onChange={(e) => setCookies({ ...cookies, functional: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Functional Cookies
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enable enhanced functionality and personalization.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', width: '100%' }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cookies.marketing}
                  onChange={(e) => setCookies({ ...cookies, marketing: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Marketing Cookies
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Used to deliver personalized advertisements.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCookieSettingsOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCookieSave}>
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>

      {isAdmin && (
        <Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
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

