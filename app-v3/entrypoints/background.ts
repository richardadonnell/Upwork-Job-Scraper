import { runLegacyV1MigrationIfNeeded } from "../utils/legacy-migration";
import { runScrape, setupAlarm } from "../utils/scraper";
import { captureContextException, initSentryContext } from "../utils/sentry";
import type { MessageType } from "../utils/types";

export default defineBackground(() => {
	initSentryContext("background");

	async function initializeFromLifecycle(
		source: "installed" | "startup",
	): Promise<void> {
		try {
			await runLegacyV1MigrationIfNeeded();
		} catch (err) {
			captureContextException("background", err, {
				operation: "runLegacyV1MigrationIfNeeded",
				source,
			});
			console.error(
				`[Upwork Scraper] Legacy migration failed during ${source} initialization`,
				err,
			);
		}

		await setupAlarm();
	}

	// Open options page on toolbar click
	browser.action.onClicked.addListener(() => {
		browser.runtime.openOptionsPage();
	});

	// Set up alarm on install/update
	browser.runtime.onInstalled.addListener(() => {
		initializeFromLifecycle("installed").catch((err) => {
			captureContextException("background", err, {
				operation: "initializeFromLifecycle",
				source: "installed",
			});
			console.error(
				"[Upwork Scraper] Initialization failed on install/update",
				err,
			);
		});
	});

	browser.runtime.onStartup.addListener(() => {
		initializeFromLifecycle("startup").catch((err) => {
			captureContextException("background", err, {
				operation: "initializeFromLifecycle",
				source: "startup",
			});
			console.error("[Upwork Scraper] Initialization failed on startup", err);
		});
	});

	// Fire scrape on alarm
	browser.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === "upwork-scrape") {
			runScrape()
				.catch((err) => {
					captureContextException("background", err, {
						operation: "runScrape",
						source: "alarm",
					});
					console.error("[Upwork Scraper] Scheduled scrape failed", err);
				})
				.finally(() => {
					setupAlarm().catch((err) => {
						captureContextException("background", err, {
							operation: "setupAlarm",
							source: "alarm-finally",
						});
						console.error("[Upwork Scraper] Failed to re-arm alarm", err);
					});
				});
		}
	});

	// Handle messages from options page
	browser.runtime.onMessage.addListener(
		(message: MessageType, _sender, sendResponse) => {
			if (message.type === "manualScrape") {
				runScrape({ manual: true })
					.then(() => sendResponse({ ok: true }))
					.catch((err) => {
						captureContextException("background", err, {
							operation: "runScrape",
							source: "manualScrape-message",
						});
						sendResponse({ ok: false, error: String(err) });
					});
				return true; // keep message channel open for async response
			}

			if (message.type === "settingsUpdated") {
				setupAlarm()
					.then(() => sendResponse({ ok: true }))
					.catch((err) => {
						captureContextException("background", err, {
							operation: "setupAlarm",
							source: "settingsUpdated-message",
						});
						sendResponse({ ok: false, error: String(err) });
					});
				return true;
			}
		},
	);
});
