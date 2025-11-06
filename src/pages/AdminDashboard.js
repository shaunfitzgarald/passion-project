import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { Check, Close, AdminPanelSettings, List } from '@mui/icons-material';
import { getPendingLocations, approveLocation, rejectLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import AdminUsers from './AdminUsers';

const AdminDashboard = ({ onLocationApproved }) => {
  const { isAdmin } = useAuth();
  const { updatePendingCount } = useNotifications();
  const [pendingLocations, setPendingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState({ open: false, location: null });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      loadPendingLocations();
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        loadPendingLocations();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadPendingLocations = async () => {
    setLoading(true);
    const result = await getPendingLocations();
    if (!result.error) {
      setPendingLocations(result.documents);
    }
    setLoading(false);
  };

  const handleApprove = async (pendingLocation) => {
    const result = await approveLocation(pendingLocation.id, pendingLocation);
    if (!result.error) {
      await loadPendingLocations();
      updatePendingCount(); // Update notification count
      if (onLocationApproved) {
        onLocationApproved();
      }
      setReviewDialog({ open: false, location: null });
    } else {
      alert('Error approving location: ' + result.error);
    }
  };

  const handleReject = async (pendingLocationId) => {
    const result = await rejectLocation(pendingLocationId);
    if (!result.error) {
      await loadPendingLocations();
      updatePendingCount(); // Update notification count
      setReviewDialog({ open: false, location: null });
    } else {
      alert('Error rejecting location: ' + result.error);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have admin access.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: '1px solid #444' }}
      >
        <Tab
          icon={<List />}
          label={`Pending Locations (${pendingLocations.length})`}
          iconPosition="start"
          sx={{ color: '#fff' }}
        />
        <Tab
          icon={<AdminPanelSettings />}
          label="User Management"
          iconPosition="start"
          sx={{ color: '#fff' }}
        />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Pending Location Approvals ({pendingLocations.length})
          </Typography>

      {pendingLocations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <Typography variant="h6" color="text.secondary">
            No pending locations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All location submissions have been reviewed.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {pendingLocations.map((location) => (
            <Grid item xs={12} key={location.id}>
              <Card sx={{ bgcolor: '#2a2a2a', color: '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6">{location.name}</Typography>
                    <Chip label="Pending" color="warning" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {location.address}
                    {location.city && `, ${location.city}`}
                    {location.state && `, ${location.state}`}
                  </Typography>
                  {location.description && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {location.description}
                    </Typography>
                  )}
                  {location.categories && location.categories.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      {location.categories.map((category, index) => (
                        <Chip
                          key={index}
                          label={category}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  {location.resources && location.resources.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Resources:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {location.resources.slice(0, 5).map((resource, index) => (
                          <Chip
                            key={index}
                            label={resource}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {location.resources.length > 5 && (
                          <Chip
                            label={`+${location.resources.length - 5} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Requested by: {location.requestedBy}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Check />}
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(location)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Close />}
                    variant="outlined"
                    color="error"
                    onClick={() => handleReject(location.id)}
                  >
                    Reject
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setReviewDialog({ open: true, location })}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, location: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Location</DialogTitle>
        <DialogContent>
          {reviewDialog.location && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {reviewDialog.location.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {reviewDialog.location.address}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {Object.entries(reviewDialog.location).map(([key, value]) => {
                if (['id', 'status', 'requestedBy', 'requestedAt'].includes(key)) return null;
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                return (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </Typography>
                    {Array.isArray(value) ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {value.map((item, index) => (
                          <Chip key={index} label={item} size="small" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">{String(value)}</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, location: null })}>
            Close
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Close />}
            onClick={() => reviewDialog.location && handleReject(reviewDialog.location.id)}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Check />}
            onClick={() => reviewDialog.location && handleApprove(reviewDialog.location)}
          >
            Approve
          </Button>
          </DialogActions>
        </Dialog>
        </>
      )}

      {tabValue === 1 && <AdminUsers />}
    </Box>
  );
};

export default AdminDashboard;

