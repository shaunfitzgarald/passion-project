import { addDocument, getDocuments, getDocument, updateDocument, deleteDocument } from './firestoreService';

const COLLECTION_NAME = 'locations';
const PENDING_COLLECTION = 'pendingLocations';

/**
 * Add a new location (requires admin approval unless user is admin)
 */
export const addLocation = async (locationData, userId, isAdminUser = false) => {
  // If user is admin, add directly to approved locations
  if (isAdminUser) {
    return await addDocument(COLLECTION_NAME, {
      ...locationData,
      approvedAt: new Date(),
      createdBy: userId,
    });
  }
  
  // Regular users need approval
  const pendingData = {
    ...locationData,
    status: 'pending',
    requestedBy: userId,
    requestedAt: new Date(),
  };
  return await addDocument(PENDING_COLLECTION, pendingData);
};

/**
 * Get all approved locations
 */
export const getLocations = async (filters = [], orderByField = { field: 'createdAt', direction: 'desc' }, limitCount = null) => {
  // Only get approved locations (locations in the main collection are already approved)
  return await getDocuments(COLLECTION_NAME, filters, orderByField, limitCount);
};

/**
 * Get pending locations (admin only)
 */
export const getPendingLocations = async () => {
  return await getDocuments(PENDING_COLLECTION, [
    { field: 'status', operator: '==', value: 'pending' }
  ], { field: 'requestedAt', direction: 'desc' });
};

/**
 * Get a single location by ID
 */
export const getLocation = async (locationId) => {
  return await getDocument(COLLECTION_NAME, locationId);
};

/**
 * Update a location
 */
export const updateLocation = async (locationId, locationData) => {
  return await updateDocument(COLLECTION_NAME, locationId, locationData);
};

/**
 * Delete a location (admins can delete directly, others need approval)
 */
export const deleteLocation = async (locationId, userId, isAdminUser = false) => {
  // If user is admin, delete directly
  if (isAdminUser) {
    return await deleteDocument(COLLECTION_NAME, locationId);
  }
  
  // Regular users need approval
  const deletionRequest = {
    locationId,
    status: 'pending',
    requestedBy: userId,
    requestedAt: new Date(),
    type: 'deletion',
  };
  return await addDocument('pendingDeletions', deletionRequest);
};

/**
 * Approve a location (admin only)
 */
export const approveLocation = async (pendingLocationId, pendingLocationData) => {
  // Add to approved locations
  const approvedData = {
    ...pendingLocationData,
    status: 'approved',
    approvedAt: new Date(),
  };
  delete approvedData.status; // Remove pending status
  delete approvedData.requestedBy;
  delete approvedData.requestedAt;
  
  const addResult = await addDocument(COLLECTION_NAME, approvedData);
  if (addResult.error) {
    return addResult;
  }
  
  // Update pending location status
  await updateDocument(PENDING_COLLECTION, pendingLocationId, { status: 'approved' });
  return addResult;
};

/**
 * Reject a location (admin only)
 */
export const rejectLocation = async (pendingLocationId) => {
  return await updateDocument(PENDING_COLLECTION, pendingLocationId, { status: 'rejected' });
};

/**
 * Approve a deletion (admin only)
 */
export const approveDeletion = async (pendingDeletionId, locationId) => {
  // Delete the location
  const deleteResult = await deleteDocument(COLLECTION_NAME, locationId);
  if (deleteResult.error) {
    return deleteResult;
  }
  
  // Update pending deletion status
  await updateDocument('pendingDeletions', pendingDeletionId, { status: 'approved' });
  return deleteResult;
};

