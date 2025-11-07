import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Link,
} from '@mui/material';
import {
  Cookie,
  Settings,
  Close,
} from '@mui/icons-material';

const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookies, setCookies] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setOpen(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setCookies(saved);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setCookies(allAccepted);
    savePreferences(allAccepted);
    setOpen(false);
    initializeAnalytics();
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setCookies(necessaryOnly);
    savePreferences(necessaryOnly);
    setOpen(false);
  };

  const handleSavePreferences = () => {
    savePreferences(cookies);
    setShowSettings(false);
    setOpen(false);
    if (cookies.analytics) {
      initializeAnalytics();
    }
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics if consent given
    if (cookies.analytics && process.env.REACT_APP_GA_MEASUREMENT_ID) {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      } else {
        // Import and initialize GA if not already loaded
        const { initGA } = require('../utils/analytics');
        initGA(process.env.REACT_APP_GA_MEASUREMENT_ID);
        if (window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'granted',
          });
        }
      }
    }
  };

  return (
    <>
      {/* Cookie Banner */}
      {open && !showSettings && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 9999,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Cookie sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                We use cookies
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSettings(true);
                  }}
                  sx={{ textDecoration: 'underline' }}
                >
                  Learn more
                </Link>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => setShowSettings(true)}
                startIcon={<Settings />}
              >
                Settings
              </Button>
              <Button
                variant="outlined"
                onClick={handleAcceptNecessary}
              >
                Necessary Only
              </Button>
              <Button
                variant="contained"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cookie />
            <Typography variant="h6">Cookie Settings</Typography>
          </Box>
          <Button
            onClick={() => setShowSettings(false)}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We use different types of cookies to optimize your experience on our platform. 
            You can customize your preferences below.
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
                    Required for the website to function properly. These cannot be disabled.
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
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
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
                    Enable enhanced functionality and personalization, such as remembering your preferences.
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
                    Used to deliver personalized advertisements and track campaign effectiveness.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowSettings(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePreferences}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent;

