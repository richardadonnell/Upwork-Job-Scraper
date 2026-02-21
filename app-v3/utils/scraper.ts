import {
	appendActivityLog,
	JOB_HISTORY_MAX,
	jobHistoryStorage,
	seenJobIdsStorage,
	settingsStorage,
} from "./storage";
import type { ScrapeResult, SearchTarget } from "./types";

const ALARM_NAME = "upwork-scrape";

export async function setupAlarm(): Promise<void> {
	const settings = await settingsStorage.getValue();
	await browser.alarms.clearAll();

	if (!settings.masterEnabled) return;

	const periodInMinutes = Math.max(5, Math.floor(settings.minuteInterval || 5));

	browser.alarms.create(ALARM_NAME, { periodInMinutes });
}

function parseTimeToMinutes(value: string): number | null {
	const match = /^(\d{2}):(\d{2})$/.exec(value);
	if (!match) return null;

	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

	return hour * 60 + minute;
}

function shouldRunNow(
	settings: Awaited<ReturnType<typeof settingsStorage.getValue>>,
): boolean {
	const now = new Date();
	const dayIndex = now.getDay();
	if (!settings.activeDays[dayIndex]) return false;

	const startMinutes = parseTimeToMinutes(settings.timeWindow.start);
	const endMinutes = parseTimeToMinutes(settings.timeWindow.end);
	if (startMinutes === null || endMinutes === null) return false;
	if (startMinutes > endMinutes) return false;

	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

async function scrapeTarget(target: SearchTarget): Promise<ScrapeResult> {
	let tabIdToRemove: number | undefined;

	try {
		// browser.tabs.create types resolve differently in plain tsc vs WXT's bundler;
		// cast through unknown to extract the id safely in both environments.
		const tab = (await browser.tabs.create({
			url: target.searchUrl,
			active: false,
		})) as unknown as { id?: number };

		if (!tab.id) throw new Error("Failed to get tab ID");
		const tabId = tab.id;
		tabIdToRemove = tabId;

		// Build the base URL (origin + pathname) so we wait for the actual search
		// results page, not an intermediate Cloudflare challenge redirect.
		const { origin, pathname } = new URL(target.searchUrl);
		const expectedBase = origin + pathname;

		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(
				() => reject(new Error("Tab load timeout")),
				60_000,
			);

			const listener = (
				id: number,
				_changeInfo: unknown,
				updatedTab: { status?: string; url?: string },
			) => {
				if (
					id === tabId &&
					updatedTab.status === "complete" &&
					updatedTab.url?.startsWith(expectedBase)
				) {
					clearTimeout(timeout);
					browser.tabs.onUpdated.removeListener(listener);
					resolve();
				}
			};

			browser.tabs.onUpdated.addListener(listener);
		});

		// Upwork is a React SPA — job cards are rendered asynchronously after the
		// browser fires status:complete. Use an inline executeScript (MV3 awaits
		// the returned Promise) to poll for up to 10s before running the scraper.
		await browser.scripting.executeScript({
			target: { tabId },
			func: () =>
				new Promise<void>((resolve) => {
					const deadline = Date.now() + 10_000;
					const check = () => {
						if (
							document.querySelector("article[data-ev-job-uid]") ||
							Date.now() >= deadline
						) {
							resolve();
						} else {
							setTimeout(check, 500);
						}
					};
					check();
				}),
		});

		const results = await browser.scripting.executeScript({
			target: { tabId },
			files: ["content-scripts/upwork-scraper.js"],
		});

		return (
			(results?.[0]?.result as ScrapeResult | undefined) ?? {
				ok: false,
				reason: "error",
			}
		);
	} finally {
		if (tabIdToRemove !== undefined) {
			browser.tabs.remove(tabIdToRemove).catch(() => {});
		}
	}
}

async function processTargetResult(
	target: SearchTarget,
	result: ScrapeResult,
	notificationsEnabled: boolean,
): Promise<number> {
	if (!result.ok || !result.jobs) return 0;

	const preferFreshString = (current: string, fresh: string): string =>
		current.trim() !== "" ? current : fresh;

	const seenIds = await seenJobIdsStorage.getValue();
	const seenSet = new Set(seenIds);
	const newJobs = result.jobs.filter((job) => !seenSet.has(job.uid));

	const existingHistory = await jobHistoryStorage.getValue();
	const latestByUid = new Map(result.jobs.map((job) => [job.uid, job]));
	const backfilledHistory = existingHistory.map((existing) => {
		const fresh = latestByUid.get(existing.uid);
		if (!fresh) return existing;

		return {
			...existing,
			title: preferFreshString(existing.title, fresh.title),
			url: preferFreshString(existing.url, fresh.url),
			datePosted: preferFreshString(existing.datePosted, fresh.datePosted),
			description: preferFreshString(existing.description, fresh.description),
			jobType: preferFreshString(existing.jobType, fresh.jobType),
			budget: preferFreshString(existing.budget, fresh.budget),
			experienceLevel: preferFreshString(
				existing.experienceLevel,
				fresh.experienceLevel,
			),
			skills: existing.skills.length > 0 ? existing.skills : fresh.skills,
			paymentVerified: existing.paymentVerified || fresh.paymentVerified,
			clientRating: preferFreshString(
				existing.clientRating,
				fresh.clientRating,
			),
			clientTotalSpent: preferFreshString(
				existing.clientTotalSpent,
				fresh.clientTotalSpent,
			),
			proposals: preferFreshString(existing.proposals, fresh.proposals),
		};
	});

	const updatedHistory = [...newJobs, ...backfilledHistory].slice(
		0,
		JOB_HISTORY_MAX,
	);
	const updatedSeenIds = [...seenSet, ...newJobs.map((j) => j.uid)];

	await Promise.all([
		jobHistoryStorage.setValue(updatedHistory),
		seenJobIdsStorage.setValue(updatedSeenIds),
	]);

	if (newJobs.length === 0) return 0;

	if (target.webhookEnabled && target.webhookUrl) {
		try {
			await fetch(target.webhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jobs: newJobs,
					timestamp: new Date().toISOString(),
				}),
			});
			await appendActivityLog("info", "Webhook delivered", target.searchUrl);
		} catch (err) {
			console.error(
				`[Upwork Scraper] Webhook delivery failed for ${target.searchUrl}:`,
				err,
			);
			await appendActivityLog(
				"error",
				`Webhook failed: ${String(err)}`,
				target.searchUrl,
			);
		}
	}

	if (notificationsEnabled) {
		for (const job of newJobs.slice(0, 3)) {
			browser.notifications.create({
				type: "basic",
				iconUrl: "/icon/128.png",
				title: "New Upwork Job",
				message: job.title,
			});
		}
		if (newJobs.length > 3) {
			browser.notifications.create({
				type: "basic",
				iconUrl: "/icon/128.png",
				title: "New Upwork Jobs",
				message: `${newJobs.length} new jobs found — open the extension to view them.`,
			});
		}
	}

	return newJobs.length;
}

function resolveRunStatus(
	anyLoggedOut: boolean,
	anyError: boolean,
): "success" | "error" | "logged_out" {
	if (anyLoggedOut) return "logged_out";
	if (anyError) return "error";
	return "success";
}

export async function runScrape(options?: { manual?: boolean }): Promise<void> {
	const settings = await settingsStorage.getValue();

	const activeTargets = settings.searchTargets.filter(
		(t) => t.searchUrl.trim() !== "",
	);

	if (activeTargets.length === 0) {
		console.warn(
			"[Upwork Scraper] Skipping scrape — no search URLs configured.",
		);
		await appendActivityLog("warn", "Skipped — no search URLs configured");
		return;
	}

	if (!options?.manual && !settings.masterEnabled) {
		console.warn(
			"[Upwork Scraper] Skipping scrape — automatic scraping is disabled.",
		);
		await appendActivityLog("warn", "Skipped — automatic scraping is disabled");
		return;
	}

	if (!options?.manual && !shouldRunNow(settings)) {
		console.warn(
			"[Upwork Scraper] Skipping scrape — outside active days/time window.",
		);
		await appendActivityLog(
			"info",
			"Skipped — outside active days/time window",
		);
		return;
	}

	await appendActivityLog(
		"info",
		`Scrape started (${options?.manual ? "manual" : "scheduled"}) — ${activeTargets.length} target${activeTargets.length !== 1 ? "s" : ""}`,
	);

	let anyError = false;
	let anyLoggedOut = false;

	const scrapeOutcomes = await Promise.all(
		activeTargets.map(async (target) => {
			try {
				const result = await scrapeTarget(target);
				if (result.ok && result.jobs) {
					const newCount = await processTargetResult(
						target,
						result,
						settings.notificationsEnabled,
					);
					await appendActivityLog(
						"info",
						`Scraped: ${newCount} new job${newCount !== 1 ? "s" : ""} found`,
						target.searchUrl,
					);
				} else if (result.reason === "logged_out") {
					await appendActivityLog(
						"warn",
						"Logged out — please sign in to Upwork",
						target.searchUrl,
					);
				} else if (result.reason === "no_results") {
					await appendActivityLog("info", "No results found", target.searchUrl);
				} else {
					await appendActivityLog(
						"error",
						`Scrape failed: ${result.error ?? "unknown error"}`,
						target.searchUrl,
					);
				}
				return result;
			} catch (err) {
				console.error(
					`[Upwork Scraper] Scrape error for ${target.searchUrl}:`,
					err,
				);
				await appendActivityLog(
					"error",
					`Scrape failed: ${String(err)}`,
					target.searchUrl,
				);
				return { ok: false, reason: "error" } as ScrapeResult;
			}
		}),
	);

	for (const result of scrapeOutcomes) {
		if (!result.ok) {
			if (result.reason === "logged_out") anyLoggedOut = true;
			else anyError = true;
		}
	}

	await settingsStorage.setValue({
		...settings,
		lastRunAt: new Date().toISOString(),
		lastRunStatus: resolveRunStatus(anyLoggedOut, anyError),
	});
}
