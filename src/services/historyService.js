/**
 * Location history service - tracks recently viewed locations
 * Uses localStorage for client-side storage
 */

const HISTORY_KEY = 'locationHistory';
const MAX_HISTORY_ITEMS = 20;

/**
 * Add location to history
 */
export const addToHistory = (location) => {
  try {
    const history = getHistory();
    
    // Remove if already exists (to move to top)
    const filtered = history.filter(item => item.id !== location.id);
    
    // Add to beginning
    const updated = [
      {
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        latitude: location.latitude,
        longitude: location.longitude,
        icon: location.icon,
        viewedAt: new Date().toISOString(),
      },
      ...filtered
    ].slice(0, MAX_HISTORY_ITEMS); // Keep only last 20
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get location history
 */
export const getHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    // Sort by viewedAt (most recent first)
    return history.sort((a, b) => 
      new Date(b.viewedAt) - new Date(a.viewedAt)
    );
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

/**
 * Clear history
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Remove specific location from history
 */
export const removeFromHistory = (locationId) => {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== locationId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

