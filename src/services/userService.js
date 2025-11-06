import { getDocument, updateDocument } from './firestoreService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

/**
 * Get user profile with role
 */
export const getUserProfile = async (userId) => {
  const result = await getDocument(USERS_COLLECTION, userId);
  if (result.document) {
    return { user: result.document, error: null };
  }
  return { user: null, error: result.error };
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId, role) => {
  return await updateDocument(USERS_COLLECTION, userId, { 
    role, 
    updatedAt: new Date() 
  });
};

/**
 * Check if user is admin
 */
export const isAdmin = async (userId) => {
  const result = await getUserProfile(userId);
  if (result.user && result.user.role === 'admin') {
    return true;
  }
  return false;
};

/**
 * Create or update user profile
 * Uses setDoc to create if doesn't exist, or update if exists
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      role: userData.role || 'user',
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    }, { merge: true }); // merge: true allows updating existing docs
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  const { getDocuments } = await import('./firestoreService');
  return await getDocuments(USERS_COLLECTION, [], { field: 'createdAt', direction: 'desc' });
};

