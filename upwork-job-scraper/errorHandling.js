const APP_VERSION = chrome.runtime.getManifest().version; // Get version from manifest.json

// Initialize Sentry
if (typeof Sentry !== "undefined") {
  Sentry.init({
    dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
    tracesSampleRate: 1.0,
    release: `upwork-job-scraper@${chrome.runtime.getManifest().version}`,
    environment: "production",
  });
}

// Function to log and report errors
function logAndReportError(context, error) {
  const errorInfo = {
    context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    userAgent: navigator.userAgent,
  };

  console.error("Error logged:", errorInfo);

  // Send error to Sentry
  if (typeof Sentry !== "undefined") {
    Sentry.captureException(error, {
      extra: errorInfo,
    });
  }
}

// Function to send a test error
function sendTestError(customMessage = "This is a test error") {
  const testError = new Error(customMessage);
  window.logAndReportError("Test Error", testError);
  console.log("Test error sent. Check the webhook for the report.");
}

// Expose the function to the global scope so it can be called from the console
globalThis.sendTestError = sendTestError;
