// Google Analytics utility functions

export const initGA = (measurementId) => {
  if (!measurementId) {
    console.warn('Google Analytics measurement ID not provided');
    return;
  }

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
  });

  // Set default consent to denied (will be updated when user accepts)
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    wait_for_update: 500,
  });
};

export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};

export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const updateConsent = (analytics, marketing) => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
    });
  }
};

