import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Add a document to a collection
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

/**
 * Get all documents from a collection
 */
export const getDocuments = async (collectionName, filters = [], orderByField = null, limitCount = null) => {
  try {
    // Check if db is initialized
    if (!db) {
      return { documents: [], error: 'Firestore not initialized' };
    }

    let q = query(collection(db, collectionName));
    
    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter && filter.field && filter.operator && filter.value !== undefined) {
          q = query(q, where(filter.field, filter.operator, filter.value));
        }
      });
    }
    
    // Apply ordering
    if (orderByField && orderByField.field) {
      q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { documents, error: null };
  } catch (error) {
    console.error('Firestore getDocuments error:', error);
    // Don't throw - return empty array with error
    return { documents: [], error: error.message || 'Unknown error' };
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { document: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { document: null, error: 'Document not found' };
    }
  } catch (error) {
    return { document: null, error: error.message };
  }
};

/**
 * Update a document
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

