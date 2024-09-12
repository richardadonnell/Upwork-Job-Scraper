import { logAndReportError } from './error_handling.js';

export function sendTestError(customMessage = "This is a test error") {
  try {
    throw new Error(customMessage);
  } catch (error) {
    logAndReportError("Test error", error);
  }
}