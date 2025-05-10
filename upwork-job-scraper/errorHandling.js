const APP_VERSION = chrome.runtime.getManifest().version; // Get version from manifest.json

// Initialize Sentry
if (typeof Sentry !== "undefined") {
  Sentry.init({
    dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
    tracesSampleRate: 1.0,
    release: `upwork-job-scraper@${chrome.runtime.getManifest().version}`,
    environment: "production",
    beforeSend(event, hint) {
      const exception = hint.originalException;

      // --- Title/Message Refinement ---
      if (
        event.exception &&
        event.exception.values &&
        event.exception.values.length > 0
      ) {
        let mainException = event.exception.values[0];
        let originalMessage = mainException.value || "";
        let prefix = "";

        // Prioritize context from REPORT_ERROR_FROM_SCRIPT
        if (event.extra?.reportedFromScript && event.tags?.errorContext) {
          prefix = `[${event.extra.reportedFromScript} / ${event.tags.errorContext}]`;
        } else if (event.tags?.errorContext) {
          prefix = `[${event.tags.errorContext}]`;
        } else if (event.extra?.reportedFromScript) {
          prefix = `[${event.extra.reportedFromScript}]`;
        }

        // For unhandled promise rejections that were non-Errors, the message might be generic.
        // Try to make it more specific using the original reason if available.
        if (
          event.message &&
          event.message.startsWith("Unhandled promise rejection (non-Error)") &&
          event.extra?.originalPromiseRejectionReason
        ) {
          let reasonSummary = "";
          const originalReason = event.extra.originalPromiseRejectionReason;
          if (typeof originalReason === "string") {
            reasonSummary = originalReason.substring(0, 100); // Max 100 chars of the string reason
          } else if (
            typeof originalReason === "object" &&
            originalReason !== null &&
            originalReason.message
          ) {
            reasonSummary = String(originalReason.message).substring(0, 100);
          } else {
            try {
              reasonSummary = JSON.stringify(originalReason).substring(0, 100);
            } catch (e) {
              reasonSummary = "(unserializable original reason)";
            }
          }
          originalMessage = `Unhandled non-Error rejection: ${reasonSummary}`;
        }

        if (prefix) {
          mainException.value = `${prefix} ${originalMessage}`;
        } else {
          // Ensure originalMessage is set if no prefix was added, but message refinement happened
          mainException.value = originalMessage;
        }
        // Also update event.message if it exists, as Sentry might use it for grouping or display
        if (event.message) {
          event.message = mainException.value;
        }
      }

      // --- Fingerprinting Considerations (Example - can be expanded) ---
      // This is a basic example. More sophisticated fingerprinting might be needed.
      const fingerprintParts = ["{{default}}"]; // Start with Sentry's default grouping
      if (event.tags?.errorContext) {
        fingerprintParts.push(event.tags.errorContext);
      }
      if (event.extra?.reportedFromScript) {
        fingerprintParts.push(event.extra.reportedFromScript);
      }
      // If it was a non-Error promise rejection, and we have the original stringified reason,
      // add a part of it to the fingerprint to group identical non-error rejections.
      if (
        event.extra?.originalPromiseRejectionReason &&
        typeof event.extra.originalPromiseRejectionReason === "string"
      ) {
        fingerprintParts.push(
          String(event.extra.originalPromiseRejectionReason).substring(0, 50)
        );
      }

      // Only apply custom fingerprint if we have more than just '{{default}}'
      if (fingerprintParts.length > 1) {
        event.fingerprint = fingerprintParts;
      }

      return event;
    },
  });
}

// Operation tracking
let currentOperationId = 0;
const operationStack = [];

// Function to generate a unique operation ID
function generateOperationId() {
  return `op_${Date.now()}_${++currentOperationId}`;
}

// Function to start tracking an operation
function startOperation(operationName) {
  const opId = generateOperationId();
  const operation = {
    id: opId,
    name: operationName,
    startTime: Date.now(),
    breadcrumbs: [],
  };
  operationStack.push(operation);

  // Add breadcrumb for operation start
  if (typeof Sentry !== "undefined") {
    Sentry.addBreadcrumb({
      category: "operation",
      message: `Started operation: ${operationName}`,
      level: "info",
      data: { operationId: opId },
    });
  }

  return opId;
}

// Function to add a breadcrumb to the current operation
function addOperationBreadcrumb(message, data = {}, level = "info") {
  const currentOperation = operationStack[operationStack.length - 1];
  if (currentOperation) {
    currentOperation.breadcrumbs.push({
      message,
      timestamp: Date.now(),
      data,
    });

    if (typeof Sentry !== "undefined") {
      Sentry.addBreadcrumb({
        category: "operation",
        message,
        level,
        data: {
          ...data,
          operationId: currentOperation.id,
          operationName: currentOperation.name,
        },
      });
    }
  }
}

// Function to end operation tracking
function endOperation(error = null) {
  const operation = operationStack.pop();
  if (operation) {
    operation.endTime = Date.now();
    operation.duration = operation.endTime - operation.startTime;
    operation.error = error;

    if (typeof Sentry !== "undefined") {
      Sentry.addBreadcrumb({
        category: "operation",
        message: `Ended operation: ${operation.name}${
          error ? " (with error)" : ""
        }`,
        level: error ? "error" : "info",
        data: {
          operationId: operation.id,
          duration: operation.duration,
          error: error?.message,
        },
      });
    }

    return operation;
  }
  return null;
}

// Enhanced error logging function
function logAndReportError(context, error, extraData = {}) {
  const currentOperation = operationStack[operationStack.length - 1];

  const errorInfo = {
    context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    userAgent: navigator.userAgent,
    operation: currentOperation
      ? {
          id: currentOperation.id,
          name: currentOperation.name,
          duration: Date.now() - currentOperation.startTime,
          breadcrumbs: currentOperation.breadcrumbs,
        }
      : null,
    ...extraData,
  };

  console.error("Error logged:", errorInfo);

  // Send error to Sentry with enhanced context
  if (typeof Sentry !== "undefined") {
    Sentry.captureException(error, {
      extra: errorInfo,
      tags: {
        errorContext: context,
        operationName: currentOperation?.name,
        operationId: currentOperation?.id,
      },
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

// Make functions available globally
globalThis.startOperation = startOperation;
globalThis.addOperationBreadcrumb = addOperationBreadcrumb;
globalThis.endOperation = endOperation;
globalThis.logAndReportError = logAndReportError;
