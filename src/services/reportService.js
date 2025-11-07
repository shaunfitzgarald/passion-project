import { addDocument, getDocuments } from './firestoreService';

const REPORTS_COLLECTION = 'locationReports';

/**
 * Report incorrect information about a location
 */
export const reportLocation = async (locationId, reportData, userId) => {
  const report = {
    ...reportData,
    locationId,
    userId: userId || null,
    status: 'pending', // pending, reviewed, resolved, dismissed
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return await addDocument(REPORTS_COLLECTION, report);
};

/**
 * Get reports for a location (admin only)
 */
export const getLocationReports = async (locationId) => {
  return await getDocuments(
    REPORTS_COLLECTION,
    [{ field: 'locationId', operator: '==', value: locationId }],
    { field: 'createdAt', direction: 'desc' }
  );
};

/**
 * Get all pending reports (admin only)
 */
export const getPendingReports = async () => {
  return await getDocuments(
    REPORTS_COLLECTION,
    [{ field: 'status', operator: '==', value: 'pending' }],
    { field: 'createdAt', direction: 'desc' }
  );
};

