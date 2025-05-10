Sentry.init({
  dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
  tracesSampleRate: 1.0,
  release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
  environment: "production",
});

Sentry.addEventProcessor((event, hint) => {
  if (event.exception && event.exception.values) {
    event.exception.values.forEach((exception) => {
      if (exception.stacktrace && exception.stacktrace.frames) {
        exception.stacktrace.frames.forEach((frame) => {
          if (frame.filename) {
            // Normalize chrome-extension://<ID>/path/to/file.js to app:///path/to/file.js
            frame.filename = frame.filename.replace(
              /^chrome-extension:\/\/[^\/]+\//,
              "app:///"
            );
          }
        });
      }
    });
  }
  return event;
});

// Wrap the existing error logging function
function logAndReportError(context, error) {
  const errorInfo = {
    context: context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    appVersion: chrome.runtime.getManifest().version,
    userAgent: navigator.userAgent,
  };

  console.error("Error logged:", errorInfo);

  // Send error to Sentry
  Sentry.captureException(error, {
    extra: errorInfo,
  });
}

// Make logAndReportError available globally
window.logAndReportError = logAndReportError;

// Add a custom breadcrumb for extension startup
Sentry.addBreadcrumb({
  category: "lifecycle",
  message: "Extension initialized",
  level: "info",
});
