import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a photo for a location
 */
export const uploadLocationPhoto = async (file, locationId, userId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${locationId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, `location-photos/${filename}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

/**
 * Delete a photo
 */
export const deleteLocationPhoto = async (photoUrl) => {
  try {
    // Extract path from URL
    const urlParts = photoUrl.split('/');
    const pathIndex = urlParts.findIndex(part => part === 'location-photos');
    if (pathIndex === -1) {
      return { error: 'Invalid photo URL' };
    }
    
    const path = urlParts.slice(pathIndex).join('/');
    const storageRef = ref(storage, path);
    
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};


