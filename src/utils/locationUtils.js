/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in miles
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (!distance && distance !== 0) return 'Unknown';
  if (distance < 0.1) return '< 0.1 mi';
  if (distance < 1) return `${distance.toFixed(1)} mi`;
  return `${Math.round(distance)} mi`;
};

/**
 * Check if location is currently open based on hours
 * @param {string} hours - Hours string (e.g., "Mon-Fri 09:00-17:00")
 * @returns {object} { isOpen: boolean, status: string, nextOpen: string }
 */
export const checkOpenStatus = (hours) => {
  if (!hours) return { isOpen: null, status: 'Hours not available', nextOpen: null };
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
  
  // Parse hours string (simplified - assumes format like "Mon-Fri 09:00-17:00")
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Check for "24 hours" or "Open 24/7"
  if (hours.toLowerCase().includes('24') || hours.toLowerCase().includes('24/7')) {
    return { isOpen: true, status: 'Open 24 hours', nextOpen: null };
  }
  
  // Check for "Closed"
  if (hours.toLowerCase().includes('closed')) {
    return { isOpen: false, status: 'Closed', nextOpen: null };
  }
  
  // Try to parse time ranges
  const timePattern = /(\d{1,2}):?(\d{2})\s*-\s*(\d{1,2}):?(\d{2})/i;
  const match = hours.match(timePattern);
  
  if (match) {
    const openHour = parseInt(match[1]) * 100 + parseInt(match[2] || 0);
    const closeHour = parseInt(match[3]) * 100 + parseInt(match[4] || 0);
    
    if (currentTime >= openHour && currentTime < closeHour) {
      return { isOpen: true, status: 'Open now', nextOpen: null };
    } else if (currentTime < openHour) {
      return { isOpen: false, status: 'Opens at ' + match[1] + ':' + (match[2] || '00'), nextOpen: null };
    } else {
      return { isOpen: false, status: 'Closed', nextOpen: null };
    }
  }
  
  // If we can't parse, return unknown
  return { isOpen: null, status: hours, nextOpen: null };
};

/**
 * Get share URL for a location
 * @param {object} location - Location object
 * @returns {string} Share URL
 */
export const getShareUrl = (location) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    location: location.id || location.name,
    lat: location.latitude,
    lng: location.longitude,
  });
  return `${baseUrl}/?${params.toString()}`;
};

/**
 * Share location via Web Share API or fallback
 * @param {object} location - Location object
 */
export const shareLocation = async (location) => {
  const shareUrl = getShareUrl(location);
  const shareText = `Check out ${location.name} at ${location.address || location.website || 'this location'}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: location.name,
        text: shareText,
        url: shareUrl,
      });
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  } else {
    // Fallback to clipboard
    copyToClipboard(shareUrl);
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

