import {
	appendActivityLog,
	JOB_HISTORY_MAX,
	jobHistoryStorage,
	legacyV1MigrationAppliedStorage,
	seenJobIdsStorage,
	settingsStorage,
} from "./storage";
import type { Job, SearchTarget, Settings } from "./types";

type LegacyPair = {
	id?: unknown;
	name?: unknown;
	searchUrl?: unknown;
	webhookUrl?: unknown;
	enabled?: unknown;
};

type LegacySchedule = {
	days?: {
		sun?: boolean;
		mon?: boolean;
		tue?: boolean;
		wed?: boolean;
		thu?: boolean;
		fri?: boolean;
		sat?: boolean;
	};
	startTime?: string;
	endTime?: string;
};

type LegacySyncSnapshot = {
	settings?: unknown;
	searchWebhookPairs?: unknown;
	jobScrapingEnabled?: unknown;
	checkFrequency?: unknown;
	schedule?: unknown;
	notificationsEnabled?: unknown;
};

function asNonEmptyString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizeLegacyJobUrl(value: unknown): string {
	const fallback = asNonEmptyString(value) ?? "";
	if (!fallback) return "";

	try {
		const parsed = new URL(fallback);
		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		return fallback;
	}
}

function toDeterministicLegacyUid(
	url: string,
	title: string,
	scrapedAtMs: number,
	index: number,
): string {
	if (url) {
		return `legacy-url:${url.toLowerCase()}`;
	}

	const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, " ");
	return `legacy-fallback:${normalizedTitle}:${scrapedAtMs}:${index}`;
}

function toV3Job(legacyRaw: unknown, index: number): Job {
	const legacy = (legacyRaw ?? {}) as Record<string, unknown>;
	const normalizedUrl = normalizeLegacyJobUrl(legacy.url);
	const title = asNonEmptyString(legacy.title) ?? "Untitled Job";

	const scrapedAtNumber =
		typeof legacy.scrapedAt === "number" && Number.isFinite(legacy.scrapedAt)
			? legacy.scrapedAt
			: Date.now();

	const uid = toDeterministicLegacyUid(
		normalizedUrl,
		title,
		scrapedAtNumber,
		index,
	);
	const description = asNonEmptyString(legacy.description) ?? "";
	const jobType = asNonEmptyString(legacy.jobType) ?? "N/A";
	const budget =
		asNonEmptyString(legacy.budget) ??
		asNonEmptyString(legacy.hourlyRange) ??
		"N/A";

	const rawSkills = Array.isArray(legacy.skills) ? legacy.skills : [];
	const skills = rawSkills.filter(
		(v): v is string => typeof v === "string" && v.trim().length > 0,
	);

	const clientSpent = asNonEmptyString(legacy.clientSpent) ?? "N/A";

	return {
		uid,
		title,
		url: normalizedUrl || asNonEmptyString(legacy.url) || "",
		datePosted: asNonEmptyString(legacy.scrapedAtHuman) ?? "Legacy import",
		postedAtMs: scrapedAtNumber,
		postedAtSource: "fallback_scraped_at",
		description,
		jobType,
		budget,
		experienceLevel: asNonEmptyString(legacy.skillLevel) ?? "N/A",
		skills,
		paymentVerified: legacy.paymentVerified === true,
		clientRating: asNonEmptyString(legacy.clientRating) ?? "N/A",
		clientTotalSpent: clientSpent,
		proposals: "N/A",
		scrapedAt: new Date(scrapedAtNumber).toISOString(),
	};
}

function mapLegacyPairToTarget(pairRaw: unknown, index: number): SearchTarget {
	const pair = (pairRaw ?? {}) as LegacyPair;

	const fallbackName = `Target ${index + 1}`;
	const name = asNonEmptyString(pair.name) ?? fallbackName;
	const searchUrl = asNonEmptyString(pair.searchUrl) ?? "";
	const webhookUrl = asNonEmptyString(pair.webhookUrl) ?? "";
	const enabled = typeof pair.enabled === "boolean" ? pair.enabled : true;

	return {
		id:
			typeof pair.id === "string" && pair.id.trim()
				? pair.id
				: crypto.randomUUID(),
		name,
		searchUrl,
		webhookEnabled: enabled && webhookUrl.length > 0,
		webhookUrl,
		payloadMode: "legacy-v1",
		legacyCompatibilityEligible: true,
	};
}

function mapLegacyDays(
	legacySchedule: LegacySchedule | null,
): Settings["activeDays"] | null {
	if (!legacySchedule || typeof legacySchedule !== "object") return null;

	const days = legacySchedule.days;
	if (!days || typeof days !== "object") return null;

	return [
		Boolean(days.sun),
		Boolean(days.mon),
		Boolean(days.tue),
		Boolean(days.wed),
		Boolean(days.thu),
		Boolean(days.fri),
		Boolean(days.sat),
	];
}

function hasMeaningfulV3Settings(value: unknown): boolean {
	if (!value || typeof value !== "object") return false;
	const maybeSettings = value as Partial<Settings>;
	if (!Array.isArray(maybeSettings.searchTargets)) return false;

	return maybeSettings.searchTargets.some((target) => {
		const candidate = target as Partial<SearchTarget>;
		return (
			(typeof candidate.searchUrl === "string" &&
				candidate.searchUrl.trim().length > 0) ||
			(typeof candidate.webhookUrl === "string" &&
				candidate.webhookUrl.trim().length > 0)
		);
	});
}

function hasLegacyData(sync: LegacySyncSnapshot, jobs: unknown[]): boolean {
	const legacyPairs = Array.isArray(sync.searchWebhookPairs)
		? sync.searchWebhookPairs
		: [];

	return (
		legacyPairs.length > 0 ||
		jobs.length > 0 ||
		typeof sync.jobScrapingEnabled === "boolean" ||
		typeof sync.checkFrequency === "number" ||
		typeof sync.notificationsEnabled === "boolean" ||
		Boolean(sync.schedule && typeof sync.schedule === "object")
	);
}

function toLegacySchedule(value: unknown): LegacySchedule | null {
	if (!value || typeof value !== "object") return null;
	return value as LegacySchedule;
}

async function migrateSettingsFromLegacy(
	sync: LegacySyncSnapshot,
): Promise<void> {
	if (hasMeaningfulV3Settings(sync.settings)) {
		return;
	}

	const currentSettings = await settingsStorage.getValue();
	const legacyPairs = Array.isArray(sync.searchWebhookPairs)
		? sync.searchWebhookPairs
		: [];

	const mappedTargets = legacyPairs
		.map((pair, index) => mapLegacyPairToTarget(pair, index))
		.filter((target) => target.searchUrl.trim() || target.webhookUrl.trim());

	const legacySchedule = toLegacySchedule(sync.schedule);
	const mappedDays = mapLegacyDays(legacySchedule);
	const mappedMinuteInterval =
		typeof sync.checkFrequency === "number" &&
		Number.isFinite(sync.checkFrequency)
			? Math.max(5, Math.floor(sync.checkFrequency))
			: currentSettings.minuteInterval;

	const mappedSettings: Settings = {
		...currentSettings,
		masterEnabled:
			typeof sync.jobScrapingEnabled === "boolean"
				? sync.jobScrapingEnabled
				: currentSettings.masterEnabled,
		minuteInterval: mappedMinuteInterval,
		activeDays: mappedDays ?? currentSettings.activeDays,
		timeWindow: {
			start:
				legacySchedule && typeof legacySchedule.startTime === "string"
					? legacySchedule.startTime
					: currentSettings.timeWindow.start,
			end:
				legacySchedule && typeof legacySchedule.endTime === "string"
					? legacySchedule.endTime
					: currentSettings.timeWindow.end,
		},
		notificationsEnabled:
			typeof sync.notificationsEnabled === "boolean"
				? sync.notificationsEnabled
				: currentSettings.notificationsEnabled,
		searchTargets:
			mappedTargets.length > 0 ? mappedTargets : currentSettings.searchTargets,
	};

	await settingsStorage.setValue(mappedSettings);
}

async function migrateHistoryFromLegacy(legacyJobs: unknown[]): Promise<void> {
	if (legacyJobs.length === 0) {
		return;
	}

	const [existingHistory, existingSeenIds] = await Promise.all([
		jobHistoryStorage.getValue(),
		seenJobIdsStorage.getValue(),
	]);

	const migratedHistory = legacyJobs.map((job, index) => toV3Job(job, index));

	const byUid = new Map<string, Job>();
	for (const job of existingHistory) {
		byUid.set(job.uid, job);
	}
	for (const job of migratedHistory) {
		if (!byUid.has(job.uid)) {
			byUid.set(job.uid, job);
		}
	}

	const nextHistory = Array.from(byUid.values())
		.sort((a, b) => b.postedAtMs - a.postedAtMs)
		.slice(0, JOB_HISTORY_MAX);

	const nextSeenIds = Array.from(
		new Set([...existingSeenIds, ...migratedHistory.map((job) => job.uid)]),
	);

	await Promise.all([
		jobHistoryStorage.setValue(nextHistory),
		seenJobIdsStorage.setValue(nextSeenIds),
	]);
}

export async function runLegacyV1MigrationIfNeeded(): Promise<void> {
	const alreadyApplied = await legacyV1MigrationAppliedStorage.getValue();
	if (alreadyApplied) return;

	const [legacySync, legacyLocal] = await Promise.all([
		browser.storage.sync.get([
			"settings",
			"searchWebhookPairs",
			"jobScrapingEnabled",
			"checkFrequency",
			"schedule",
			"notificationsEnabled",
		]),
		browser.storage.local.get(["scrapedJobs"]),
	]);

	const syncSnapshot = legacySync as LegacySyncSnapshot;
	const legacyJobs = Array.isArray(legacyLocal.scrapedJobs)
		? legacyLocal.scrapedJobs
		: [];

	if (!hasLegacyData(syncSnapshot, legacyJobs)) {
		await legacyV1MigrationAppliedStorage.setValue(true);
		return;
	}

	await migrateSettingsFromLegacy(syncSnapshot);
	await migrateHistoryFromLegacy(legacyJobs);

	await legacyV1MigrationAppliedStorage.setValue(true);
	await appendActivityLog("info", "Legacy v1 migration completed");
}
