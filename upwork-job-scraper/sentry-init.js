var APP_VERSION = "1.38";
var SENTRY_DSN = "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488";

function initializeSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: "upwork-job-scraper@" + APP_VERSION,
    environment: "production",
  });
}

function logAndReportError(context, error) {
  console.error(context, error);
  Sentry.captureException(error, { 
    tags: { context: context },
    extra: {
      appVersion: APP_VERSION,
    },
  });
}
