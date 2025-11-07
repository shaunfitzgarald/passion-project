import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Note,
  Edit,
  Delete,
  Save,
  Close,
} from '@mui/icons-material';
import { saveLocationNote, getLocationNote, deleteLocationNote } from '../services/notesService';
import { useAuth } from '../contexts/AuthContext';

const PersonalNote = ({ locationId, locationName }) => {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user && locationId) {
      loadNote();
    }
  }, [user, locationId]);

  const loadNote = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await getLocationNote(locationId, user.uid);
    if (!result.error) {
      setSavedNote(result.note);
      setNote(result.note ? result.note.note : '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await saveLocationNote(locationId, note.trim(), user.uid);
    if (!result.error) {
      await loadNote();
      setEditing(false);
      setDialogOpen(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!user || !savedNote) return;
    
    if (window.confirm('Delete this note?')) {
      setLoading(true);
      const result = await deleteLocationNote(locationId, user.uid);
      if (!result.error) {
        setSavedNote(null);
        setNote('');
        setEditing(false);
        setDialogOpen(false);
      }
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Note sx={{ fontSize: 16, color: '#999' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>
              Personal Note
            </Typography>
          </Box>
          <Box>
            {savedNote && !editing && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(true);
                    setDialogOpen(true);
                  }}
                  sx={{ color: '#1976d2', p: 0.5 }}
                >
                  <Edit sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{ color: '#f44336', p: 0.5 }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </>
            )}
            {!savedNote && (
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(true);
                  setDialogOpen(true);
                }}
                sx={{ color: '#1976d2', p: 0.5 }}
              >
                <Edit sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {savedNote && !editing && (
          <Paper sx={{ p: 1.5, bgcolor: '#2a2a2a', border: '1px solid #444' }}>
            <Typography variant="body2" sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
              {savedNote.note}
            </Typography>
          </Paper>
        )}
        
        {!savedNote && !editing && (
          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
            Click edit to add a personal note about this location
          </Typography>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(false);
          if (savedNote) {
            setNote(savedNote.note || '');
          } else {
            setNote('');
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Note />
            <Typography variant="h6">Personal Note</Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {locationName}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Add your personal notes about this location..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          {savedNote && (
            <Button
              onClick={handleDelete}
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !note.trim()}
            startIcon={<Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PersonalNote;

