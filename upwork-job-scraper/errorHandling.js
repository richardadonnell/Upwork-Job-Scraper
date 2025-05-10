const APP_VERSION = chrome.runtime.getManifest().version; // Get version from manifest.json

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
function logAndReportError(
  context,
  error,
  extraData = {},
  sentryLevel = "error"
) {
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
      level: sentryLevel,
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
