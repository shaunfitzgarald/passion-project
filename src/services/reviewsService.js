import { addDocument, getDocuments, updateDocument, deleteDocument } from './firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const REVIEWS_COLLECTION = 'reviews';

/**
 * Add a review for a location
 */
export const addReview = async (locationId, reviewData, userId) => {
  const review = {
    ...reviewData,
    locationId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return await addDocument(REVIEWS_COLLECTION, review);
};

/**
 * Get reviews for a location
 */
export const getLocationReviews = async (locationId, limit = 50) => {
  return await getDocuments(
    REVIEWS_COLLECTION,
    [{ field: 'locationId', operator: '==', value: locationId }],
    { field: 'createdAt', direction: 'desc' },
    limit
  );
};

/**
 * Get user's reviews
 */
export const getUserReviews = async (userId) => {
  return await getDocuments(
    REVIEWS_COLLECTION,
    [{ field: 'userId', operator: '==', value: userId }],
    { field: 'createdAt', direction: 'desc' }
  );
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, reviewData, userId) => {
  try {
    // Verify user owns the review
    const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    
    if (!reviewDoc.exists()) {
      return { error: 'Review not found' };
    }
    
    const review = reviewDoc.data();
    if (review.userId !== userId) {
      return { error: 'Unauthorized' };
    }
    
    return await updateDocument(REVIEWS_COLLECTION, reviewId, {
      ...reviewData,
      updatedAt: new Date(),
    });
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId, userId, isAdmin = false) => {
  try {
    // Verify user owns the review or is admin
    if (!isAdmin) {
      const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId));
      
      if (!reviewDoc.exists()) {
        return { error: 'Review not found' };
      }
      
      const review = reviewDoc.data();
      if (review.userId !== userId) {
        return { error: 'Unauthorized' };
      }
    }
    
    return await deleteDocument(REVIEWS_COLLECTION, reviewId);
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get average rating for a location
 */
export const getLocationRating = async (locationId) => {
  const result = await getLocationReviews(locationId, 1000); // Get all reviews for calculation
  if (result.error || !result.documents || result.documents.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const reviews = result.documents;
  const ratings = reviews.filter(r => r.rating).map(r => r.rating);
  const average = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;
  
  return { average: Math.round(average * 10) / 10, count: ratings.length };
};

