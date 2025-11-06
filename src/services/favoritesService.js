import { getDocument, updateDocument } from './firestoreService';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const FAVORITES_COLLECTION = 'favorites';

/**
 * Get user's favorite locations
 */
export const getFavorites = async (userId) => {
  try {
    const docRef = doc(db, FAVORITES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { favorites: docSnap.data().locationIds || [], error: null };
    } else {
      return { favorites: [], error: null };
    }
  } catch (error) {
    return { favorites: [], error: error.message };
  }
};

/**
 * Add location to favorites
 */
export const addFavorite = async (userId, locationId) => {
  try {
    const docRef = doc(db, FAVORITES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    const currentFavorites = docSnap.exists() ? (docSnap.data().locationIds || []) : [];
    
    if (currentFavorites.includes(locationId)) {
      return { error: 'Location already in favorites' };
    }
    
    await setDoc(docRef, {
      locationIds: [...currentFavorites, locationId],
      updatedAt: new Date(),
    }, { merge: true });
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Remove location from favorites
 */
export const removeFavorite = async (userId, locationId) => {
  try {
    const docRef = doc(db, FAVORITES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { error: null };
    }
    
    const currentFavorites = docSnap.data().locationIds || [];
    const updatedFavorites = currentFavorites.filter(id => id !== locationId);
    
    await setDoc(docRef, {
      locationIds: updatedFavorites,
      updatedAt: new Date(),
    }, { merge: true });
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Check if location is favorited
 */
export const isFavorite = async (userId, locationId) => {
  try {
    const { favorites } = await getFavorites(userId);
    return favorites.includes(locationId);
  } catch (error) {
    return false;
  }
};


