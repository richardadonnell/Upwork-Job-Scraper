declare global {
	interface ImportMetaEnv {
		readonly WXT_SENTRY_DSN?: string;
		readonly WXT_SENTRY_ENVIRONMENT?: string;
		readonly WXT_SENTRY_RELEASE?: string;
		readonly WXT_SENTRY_TRACES_SAMPLE_RATE?: string;
		readonly WXT_SENTRY_ENABLE_LOGS?: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};
