Sentry.init({
  dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
  tracesSampleRate: 1.0,
  release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
  environment: "production",
  beforeSend(event, hint) {
    // Basic title refinement for content script/settings direct errors
    if (
      event.exception &&
      event.exception.values &&
      event.exception.values.length > 0
    ) {
      let mainException = event.exception.values[0];
      let originalMessage = mainException.value || "";
      let prefix = "[ContentScript/SettingsDirect]"; // Generic prefix

      // Try to get a more specific context if available from the simpler logAndReportError
      if (event.extra?.context) {
        // `context` is the field used by the simpler logAndReportError
        prefix = `[CS/${event.extra.context}]`;
      }
      mainException.value = `${prefix} ${originalMessage}`;
      if (event.message) {
        event.message = mainException.value;
      }
    }

    // Basic fingerprinting: add current URL path to default
    // This helps group errors that occur on the same page in content scripts.
    try {
      const path = new URL(window.location.href).pathname;
      if (path) {
        event.fingerprint = ["{{default}}", path];
      }
    } catch (e) {
      /* ignore if URL parsing fails */
    }

    return event;
  },
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
