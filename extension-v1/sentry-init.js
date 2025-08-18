Sentry.init({
  dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
  tracesSampleRate: 1.0,
  release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
  environment: "production",
  beforeSend(event, hint) {
    const originalException = hint.originalException;

    // --- Handle CustomEvent exceptions ---
    if (
      originalException instanceof CustomEvent &&
      originalException.type === "error"
    ) {
      let customEventMessage = "CustomEvent (type=error) occurred";
      const details = originalException.detail;

      if (typeof details === "string") {
        customEventMessage = details;
      } else if (details && typeof details.message === "string") {
        customEventMessage = details.message;
      } else if (details) {
        try {
          customEventMessage = JSON.stringify(details).substring(0, 250); // Cap length
        } catch (e) {
          customEventMessage =
            "CustomEvent (type=error) with unserializable details";
        }
      }

      // Reconstruct the exception part of the Sentry event
      event.exception = {
        values: [
          {
            type: "CustomEventError", // Custom type to identify these
            value: customEventMessage,
            // Sentry will attempt to generate a stacktrace if not provided or if it's poor
            // We don't have a good JS stacktrace from a bare CustomEvent typically
            // stacktrace: { frames: [] }, // Provide empty frames to signal we handled it
          },
        ],
      };
      // Update event.message as Sentry might use it for grouping or display
      event.message = customEventMessage;

      // Preserve original CustomEvent details in extraData
      event.extra = {
        ...event.extra,
        originalCustomEventDetails: details,
        originalCustomEventType: originalException.type,
      };
      // Add a tag to easily find these modified events
      event.tags = { ...event.tags, processedCustomEvent: "true" };
    } else {
      // --- Existing title refinement for other errors ---
      if (
        event.exception &&
        event.exception.values &&
        event.exception.values.length > 0
      ) {
        let mainException = event.exception.values[0];
        let originalMessage = mainException.value || "";
        let prefix = "[ContentScript/SettingsDirect]"; // Generic prefix

        if (event.extra?.context) {
          prefix = `[CS/${event.extra.context}]`;
        }
        mainException.value = `${prefix} ${originalMessage}`;
        if (event.message) {
          event.message = mainException.value;
        }
      }
    }

    // --- Existing fingerprinting ---
    try {
      const path = new URL(window.location.href).pathname;
      if (path) {
        // Ensure fingerprint is an array, start with {{default}} if not already complex
        if (!event.fingerprint || event.fingerprint.length === 0) {
          event.fingerprint = ["{{default}}"];
        }
        // Avoid adding duplicate path if already part of a more complex fingerprint
        if (!event.fingerprint.includes(path)) {
          event.fingerprint.push(path);
        }
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
