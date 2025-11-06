/**
 * Test Google Maps API Key
 * Run this in browser console to test if API key works
 */
export const testGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapTest`;
    
    window.initMapTest = () => {
      resolve({ success: true, message: 'API key is valid and Maps API loaded successfully' });
      delete window.initMapTest;
      document.head.removeChild(script);
    };
    
    script.onerror = () => {
      reject({ success: false, message: 'Failed to load Google Maps API script' });
      delete window.initMapTest;
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
    
    document.head.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
        delete window.initMapTest;
        reject({ success: false, message: 'Timeout: API did not load within 10 seconds' });
      }
    }, 10000);
  });
};


