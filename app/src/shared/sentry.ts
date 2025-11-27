import * as Sentry from '@sentry/browser'

export function initSentry(dsn?: string) {
  if (!dsn) return
  Sentry.init({ dsn })
}
