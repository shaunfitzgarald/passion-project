import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { checkEmailLink, signInWithEmailLink } from '../services/authService';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    // Check if this is a valid email link
    const isValid = checkEmailLink();
    setIsValidLink(isValid);

    // Get email from localStorage if available
    const savedEmail = window.localStorage.getItem('emailForSignIn');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidLink) {
      setError('This is not a valid sign-in link');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signInWithEmailLink(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  };

  if (!isValidLink) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Alert severity="error">
            This is not a valid sign-in link. Please check your email for the correct link.
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Verify Email Link
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
          Enter the email address you used to request the sign-in link.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;


