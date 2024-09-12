import { APP_VERSION, SENTRY_DSN } from "./config.js";
import * as Sentry from "./sentry.js";

export function initializeSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    release: `upwork-job-scraper@${APP_VERSION}`,
    environment: "production",
  });

  // Add a custom breadcrumb for extension startup
  Sentry.addBreadcrumb({
    category: "lifecycle",
    message: "Extension initialized",
    level: "info",
  });
}

// Wrap the existing error logging function
export function logAndReportError(context, error) {
  const errorInfo = {
    context: context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    userAgent: navigator.userAgent,
  };
  console.error("Error logged:", errorInfo);

  // Send error to Sentry
  Sentry.captureException(error, { extra: errorInfo });
}
