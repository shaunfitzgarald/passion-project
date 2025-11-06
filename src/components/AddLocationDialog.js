import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import AddEditLocation from './AddEditLocation';
import { useAuth } from '../contexts/AuthContext';

const AddLocationDialog = ({ open, onClose, onSuccess, location = null }) => {
  const { user, isAdmin } = useAuth();
  const isEditing = !!location;

  const handleSave = () => {
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Location' : 'Add New Location'}</DialogTitle>
      <DialogContent>
        {!isEditing && !isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your location submission will be reviewed by an admin before it appears on the map.
          </Alert>
        )}
        {!isEditing && isAdmin && (
          <Alert severity="success" sx={{ mb: 2 }}>
            As an admin, your location will be added immediately without approval.
          </Alert>
        )}
        {isEditing && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are editing this location. Changes will be saved immediately.
          </Alert>
        )}
        <AddEditLocation
          location={location}
          onClose={onClose}
          onSave={handleSave}
          userId={user?.uid}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLocationDialog;

