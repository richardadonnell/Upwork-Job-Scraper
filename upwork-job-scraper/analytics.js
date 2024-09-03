// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// Define gtag function
function gtag(){dataLayer.push(arguments);}

// Set default consent to 'denied' for analytics_storage and ad_storage
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied'
});

// Initialize GA4
gtag('js', new Date());
gtag('config', 'G-BYBBYXCXBS');

// Function to update consent
function updateConsent(analytics_storage, ad_storage) {
  gtag('consent', 'update', {
    'analytics_storage': analytics_storage,
    'ad_storage': ad_storage
  });
}

// Function to send custom event
function sendEvent(eventName, eventParams) {
  gtag('event', eventName, eventParams);
}

// Example usage:
// updateConsent('granted', 'denied');
// sendEvent('button_click', {'button_name': 'save_settings'});