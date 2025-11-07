import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Typography,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import {
  Close,
  Flag,
} from '@mui/icons-material';
import { reportLocation } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const ReportLocation = ({ location, open, onClose }) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('incorrect_info');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await reportLocation(
        location.id,
        {
          type: reportType,
          description: description.trim(),
          locationName: location.name,
          locationAddress: location.address || '',
        },
        user?.uid || null
      );

      if (result.error) {
        setError('Failed to submit report: ' + result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportType('incorrect_info');
    setDescription('');
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag sx={{ color: '#f44336' }} />
          <Typography variant="h6">Report Location</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'background.paper' }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thank you! Your report has been submitted. We'll review it and update the location information if needed.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Help us keep location information accurate. Please report any incorrect information about:
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 600 }}>
              {location.name}
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary' }}>
                What's wrong?
              </FormLabel>
              <RadioGroup
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <FormControlLabel
                  value="incorrect_info"
                  control={<Radio />}
                  label="Incorrect information (address, hours, phone, etc.)"
                />
                <FormControlLabel
                  value="closed"
                  control={<Radio />}
                  label="Location is permanently closed"
                />
                <FormControlLabel
                  value="wrong_location"
                  control={<Radio />}
                  label="Wrong location on map"
                />
                <FormControlLabel
                  value="duplicate"
                  control={<Radio />}
                  label="Duplicate listing"
                />
                <FormControlLabel
                  value="inappropriate"
                  control={<Radio />}
                  label="Inappropriate content"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Other issue"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Please provide details"
              placeholder="Describe what information is incorrect or what the issue is..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      {!success && (
        <DialogActions sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportLocation;

