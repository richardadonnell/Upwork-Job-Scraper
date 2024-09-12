import { APP_VERSION } from './config.js';
import * as Sentry from './sentry.js';

export function logAndReportError(context, error) {
  const errorInfo = {
    context: context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    userAgent: navigator.userAgent
  };

  console.error('Error logged:', errorInfo);
  
  // Send error to Sentry
  Sentry.captureException(error, {
    extra: errorInfo
  });
}