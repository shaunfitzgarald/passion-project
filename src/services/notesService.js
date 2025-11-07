import { addDocument, getDocuments, updateDocument, deleteDocument } from './firestoreService';

const NOTES_COLLECTION = 'userNotes';

/**
 * Add or update a personal note for a location
 */
export const saveLocationNote = async (locationId, noteText, userId) => {
  // Check if note already exists
  const existing = await getDocuments(
    NOTES_COLLECTION,
    [
      { field: 'locationId', operator: '==', value: locationId },
      { field: 'userId', operator: '==', value: userId }
    ]
  );

  if (existing.error) {
    return { error: existing.error };
  }

  if (existing.documents && existing.documents.length > 0) {
    // Update existing note
    const noteId = existing.documents[0].id;
    return await updateDocument(NOTES_COLLECTION, noteId, {
      note: noteText,
      updatedAt: new Date(),
    });
  } else {
    // Create new note
    const note = {
      locationId,
      userId,
      note: noteText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await addDocument(NOTES_COLLECTION, note);
  }
};

/**
 * Get user's note for a location
 */
export const getLocationNote = async (locationId, userId) => {
  const result = await getDocuments(
    NOTES_COLLECTION,
    [
      { field: 'locationId', operator: '==', value: locationId },
      { field: 'userId', operator: '==', value: userId }
    ]
  );

  if (result.error) {
    return { error: result.error, note: null };
  }

  if (result.documents && result.documents.length > 0) {
    return { note: result.documents[0], error: null };
  }

  return { note: null, error: null };
};

/**
 * Get all notes for a user
 */
export const getUserNotes = async (userId) => {
  return await getDocuments(
    NOTES_COLLECTION,
    [{ field: 'userId', operator: '==', value: userId }],
    { field: 'updatedAt', direction: 'desc' }
  );
};

/**
 * Delete a note
 */
export const deleteLocationNote = async (locationId, userId) => {
  const existing = await getDocuments(
    NOTES_COLLECTION,
    [
      { field: 'locationId', operator: '==', value: locationId },
      { field: 'userId', operator: '==', value: userId }
    ]
  );

  if (existing.error || !existing.documents || existing.documents.length === 0) {
    return { error: 'Note not found' };
  }

  return await deleteDocument(NOTES_COLLECTION, existing.documents[0].id);
};

