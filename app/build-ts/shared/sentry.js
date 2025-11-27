import * as Sentry from '@sentry/browser';
export function initSentry(dsn) {
    if (!dsn)
        return;
    Sentry.init({ dsn });
}
