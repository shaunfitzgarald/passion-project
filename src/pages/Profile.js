import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import { Person, Email } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/userService';

const Profile = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    
    const result = await createUserProfile(user.uid, {
      email: user.email,
      displayName: displayName,
      role: userProfile?.role || 'user',
    });

    setLoading(false);
    if (result.error) {
      alert('Error saving profile: ' + result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Your Profile
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#2a2a2a', textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {displayName || user?.email || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>
            {isAdmin && (
              <Chip label="Admin" color="primary" size="small" />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: '#2a2a2a' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Profile Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: '#999' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#777',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#999',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: '#999' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#999',
                      '& fieldset': {
                        borderColor: '#555',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#999',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Email cannot be changed
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;

