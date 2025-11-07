import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Rating,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Star,
  Edit,
  Delete,
  Send,
  Close,
} from '@mui/icons-material';
import { getLocationReviews, addReview, updateReview, deleteReview, getLocationRating } from '../services/reviewsService';
import { useAuth } from '../contexts/AuthContext';

const ReviewsSection = ({ locationId }) => {
  const { user, isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, reviewId: null });

  useEffect(() => {
    if (locationId) {
      loadReviews();
      loadRating();
    }
  }, [locationId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await getLocationReviews(locationId);
      if (!result.error) {
        setReviews(result.documents);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    const result = await getLocationRating(locationId);
    if (!result.error) {
      setAverageRating(result);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const result = await updateReview(editingReview.id, {
          rating,
          comment: comment.trim(),
        }, user.uid);
        
        if (result.error) {
          alert('Error updating review: ' + result.error);
        } else {
          setComment('');
          setRating(0);
          setEditingReview(null);
          await loadReviews();
          await loadRating();
        }
      } else {
        // Add new review
        const result = await addReview(locationId, {
          rating,
          comment: comment.trim(),
        }, user.uid);
        
        if (result.error) {
          alert('Error adding review: ' + result.error);
        } else {
          setComment('');
          setRating(0);
          await loadReviews();
          await loadRating();
        }
      }
    } catch (error) {
      alert('Error saving review: ' + error.message);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setRating(review.rating || 0);
    setComment(review.comment || '');
  };

  const handleDelete = async () => {
    if (!deleteConfirm.reviewId) return;
    
    const result = await deleteReview(deleteConfirm.reviewId, user?.uid, isAdmin);
    if (!result.error) {
      await loadReviews();
      await loadRating();
    } else {
      alert('Error deleting review: ' + result.error);
    }
    
    setDeleteConfirm({ open: false, reviewId: null });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 3, bgcolor: '#444' }} />
      <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
        Reviews
      </Typography>

      {/* Average Rating */}
      {averageRating.count > 0 && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
              {averageRating.average.toFixed(1)}
            </Typography>
            <Rating value={averageRating.average} readOnly precision={0.1} size="large" />
          </Box>
          <Typography variant="body2" sx={{ color: '#999' }}>
            ({averageRating.count} review{averageRating.count !== 1 ? 's' : ''})
          </Typography>
        </Box>
      )}

      {/* Add Review Form */}
      {user ? (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#2a2a2a' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#fff' }}>
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              sx={{ '& .MuiRating-iconFilled': { color: '#ffc107' } }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#777' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {editingReview && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingReview(null);
                    setComment('');
                    setRating(0);
                  }}
                  sx={{ color: '#fff', borderColor: '#555' }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSubmit}
                disabled={rating === 0 || !comment.trim()}
                sx={{ bgcolor: '#1976d2' }}
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3, bgcolor: '#1a3a5f', color: '#fff' }}>
          Please sign in to leave a review.
        </Alert>
      )}

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <Typography variant="body2" color="text.secondary">
            No reviews yet. Be the first to review this location!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => {
            const isOwner = user && review.userId === user.uid;
            return (
              <Paper key={review.id} sx={{ p: 2, bgcolor: '#2a2a2a' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Rating value={review.rating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Box>
                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        (edited)
                      </Typography>
                    )}
                  </Box>
                  {(isOwner || isAdmin) && (
                    <Box>
                      {isOwner && (
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(review)}
                          sx={{ color: '#1976d2' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm({ open: true, reviewId: review.id })}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {review.comment}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, reviewId: null })}
      >
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this review? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, reviewId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsSection;

