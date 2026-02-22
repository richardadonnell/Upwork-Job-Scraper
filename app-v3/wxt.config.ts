import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "wxt";

const EXTENSION_VERSION = "3.0.0";
const DEFAULT_SENTRY_RELEASE = `upwork-job-scraper@${EXTENSION_VERSION}`;

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: () => ({
		name: "Upwork Job Scraper",
		version: EXTENSION_VERSION,
		description:
			"Automatically scrape Upwork job listings and send them to a webhook.",
		permissions: ["storage", "tabs", "scripting", "alarms", "notifications"],
		host_permissions: [
			"https://www.upwork.com/*",
			"https://*.ingest.sentry.io/*",
		],
		action: {
			default_title: "Upwork Job Scraper",
			default_icon: {
				16: "icon/16.png",
				32: "icon/32.png",
				48: "icon/48.png",
				96: "icon/96.png",
				128: "icon/128.png",
			},
		},
	}),
	vite: () => {
		const plugins = [];

		if (
			process.env.SENTRY_AUTH_TOKEN &&
			process.env.SENTRY_ORG &&
			process.env.SENTRY_PROJECT
		) {
			const releaseName =
				process.env.WXT_SENTRY_RELEASE?.trim() || DEFAULT_SENTRY_RELEASE;

			plugins.push(
				sentryVitePlugin({
					authToken: process.env.SENTRY_AUTH_TOKEN,
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					release: {
						name: releaseName,
					},
					sourcemaps: {
						assets: ["./.output/**/*"],
					},
				}),
			);
		}

		return {
			build: {
				sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
			},
			plugins,
		};
	},
});
