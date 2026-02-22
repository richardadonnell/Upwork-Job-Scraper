import { Flex, ScrollArea, Spinner } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { captureContextException } from "../utils/sentry";
import {
	DEFAULT_SETTINGS,
	jobHistoryStorage,
	settingsStorage,
} from "../utils/storage";
import type { Job, Settings } from "../utils/types";

import { ActivityPage } from "./ActivityPage";
import { DashboardPage } from "./DashboardPage";
import { DeliveryPage } from "./DeliveryPage";
import { JobHistoryTab } from "./JobHistoryTab";
import { OptionsSidebar, type Page } from "./OptionsSidebar.tsx";
import { SchedulePage } from "./SchedulePage";
import { SearchTargetsPage } from "./SearchTargetsPage";

const SETTINGS_PAGES: Page[] = ["search-targets", "schedule", "delivery"];
const SCRAPE_ALARM_NAME = "upwork-scrape";

type SaveState = "idle" | "saved" | "error";

function parseTimeToMinutes(value: string): number | null {
	const match = /^(\d{2}):(\d{2})$/.exec(value);
	if (!match) return null;

	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

	return hours * 60 + minutes;
}

function getMinutesInDay(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

function formatApproximateAbsoluteTime(timestamp: number): string {
	const target = new Date(timestamp);
	const now = new Date();
	const sameDay = now.toDateString() === target.toDateString();
	const dayLabel = sameDay
		? "Today"
		: target.toLocaleDateString(undefined, { weekday: "short" });
	return `${dayLabel} ${target.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
	})}`;
}

function getStartTimestampForDate(
	baseDate: Date,
	startMinutes: number,
): number {
	const candidate = new Date(baseDate);
	candidate.setHours(0, 0, 0, 0);
	candidate.setMinutes(startMinutes, 0, 0);
	return candidate.getTime();
}

function getNextActiveWindowStartTimestamp(
	settings: Settings,
	now: Date,
	startMinutes: number,
): number | null {
	for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
		const candidate = new Date(now);
		candidate.setHours(0, 0, 0, 0);
		candidate.setDate(candidate.getDate() + dayOffset);
		const dayIndex = candidate.getDay();
		if (!settings.activeDays[dayIndex]) continue;

		candidate.setMinutes(startMinutes, 0, 0);
		if (candidate.getTime() > now.getTime()) {
			return candidate.getTime();
		}
	}

	return null;
}

function getApproximateCandidateTimestamp(args: {
	settings: Settings;
	now: Date;
	nowMs: number;
	startMinutes: number;
	endMinutes: number;
	scheduledAlarmTimestamp: number | null;
}): { candidateTimestamp: number | null; inCurrentWindow: boolean } {
	const nowMinutes = getMinutesInDay(args.now);
	const dayIndex = args.now.getDay();
	const inActiveDay = args.settings.activeDays[dayIndex];
	const inTimeWindow =
		nowMinutes >= args.startMinutes && nowMinutes <= args.endMinutes;
	const inCurrentWindow = inActiveDay && inTimeWindow;
	const intervalMs =
		Math.max(5, Math.floor(args.settings.minuteInterval || 5)) * 60 * 1000;

	if (inActiveDay && nowMinutes < args.startMinutes) {
		return {
			candidateTimestamp: getStartTimestampForDate(args.now, args.startMinutes),
			inCurrentWindow,
		};
	}

	if (inCurrentWindow) {
		if (
			args.scheduledAlarmTimestamp !== null &&
			args.scheduledAlarmTimestamp > args.nowMs
		) {
			return {
				candidateTimestamp: args.scheduledAlarmTimestamp,
				inCurrentWindow,
			};
		}

		const nextIntervalTimestamp = args.nowMs + intervalMs;
		const endTimestamp = getStartTimestampForDate(args.now, args.endMinutes);
		if (nextIntervalTimestamp <= endTimestamp) {
			return { candidateTimestamp: nextIntervalTimestamp, inCurrentWindow };
		}
	}

	return {
		candidateTimestamp: getNextActiveWindowStartTimestamp(
			args.settings,
			args.now,
			args.startMinutes,
		),
		inCurrentWindow,
	};
}

function getApproximateNextRunDisplay(args: {
	canRunScrape: boolean;
	masterEnabled: boolean;
	scraping: boolean;
	settings: Settings;
	nowMs: number;
	scheduledAlarmTimestamp: number | null;
}): { primary: string; primaryColor: "green" | "gray"; secondary?: string } {
	if (!args.canRunScrape) {
		return { primary: "No search URL configured", primaryColor: "gray" };
	}

	if (!args.masterEnabled) {
		return { primary: "Paused", primaryColor: "gray" };
	}

	if (args.scraping) {
		return { primary: "Running now...", primaryColor: "green" };
	}

	if (!args.settings.activeDays.some(Boolean)) {
		return { primary: "No active days selected", primaryColor: "gray" };
	}

	const startMinutes = parseTimeToMinutes(args.settings.timeWindow.start);
	const endMinutes = parseTimeToMinutes(args.settings.timeWindow.end);
	if (
		startMinutes === null ||
		endMinutes === null ||
		startMinutes > endMinutes
	) {
		return { primary: "Schedule window invalid", primaryColor: "gray" };
	}

	const now = new Date(args.nowMs);
	const { candidateTimestamp, inCurrentWindow } =
		getApproximateCandidateTimestamp({
			settings: args.settings,
			now,
			nowMs: args.nowMs,
			startMinutes,
			endMinutes,
			scheduledAlarmTimestamp: args.scheduledAlarmTimestamp,
		});

	if (candidateTimestamp === null) {
		return { primary: "No upcoming schedule window", primaryColor: "gray" };
	}

	const roundedToMinute = Math.round(candidateTimestamp / 60_000) * 60_000;
	const secondsUntilRun = Math.floor((roundedToMinute - args.nowMs) / 1000);

	if (secondsUntilRun <= 60) {
		return {
			primary: "Starting soon",
			primaryColor: "green",
		};
	}

	return {
		primary: `~ ${formatApproximateAbsoluteTime(roundedToMinute)}`,
		primaryColor: inCurrentWindow ? "green" : "gray",
	};
}

export function OptionsApp() {
	const [activePage, setActivePage] = useState<Page>("dashboard");
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [scraping, setScraping] = useState(false);
	const [nowMs, setNowMs] = useState(() => Date.now());
	const [scheduledAlarmTimestamp, setScheduledAlarmTimestamp] = useState<
		number | null
	>(null);
	const [saveState, setSaveState] = useState<SaveState>("idle");
	const [showSaveSuccess, setShowSaveSuccess] = useState(false);
	const saveTimeoutRef = useRef<number | null>(null);
	const saveStatusTimeoutRef = useRef<number | null>(null);
	const lastSavedSnapshotRef = useRef("");

	useEffect(() => {
		Promise.all([
			settingsStorage.getValue(),
			jobHistoryStorage.getValue(),
		]).then(([s, j]) => {
			setSettings(s);
			setJobs(j);
			lastSavedSnapshotRef.current = JSON.stringify(s);
			setLoading(false);
		});
		const unwatchSettings = settingsStorage.watch((s) => setSettings(s));
		const unwatchJobs = jobHistoryStorage.watch((j) => setJobs(j));
		return () => {
			unwatchSettings();
			unwatchJobs();
		};
	}, []);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setNowMs(Date.now());
		}, 30_000);

		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		let cancelled = false;

		const refreshScheduledAlarm = async () => {
			try {
				const alarm = await browser.alarms.get(SCRAPE_ALARM_NAME);
				if (!cancelled) {
					setScheduledAlarmTimestamp(alarm?.scheduledTime ?? null);
				}
			} catch {
				captureContextException(
					"options",
					new Error("Failed to refresh scheduled alarm"),
					{
						operation: "refreshScheduledAlarm",
					},
				);
				if (!cancelled) {
					setScheduledAlarmTimestamp(null);
				}
			}
		};

		refreshScheduledAlarm();
		const interval = window.setInterval(refreshScheduledAlarm, 15_000);

		return () => {
			cancelled = true;
			window.clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		if (loading) return;

		const snapshot = JSON.stringify(settings);
		if (snapshot === lastSavedSnapshotRef.current) return;

		if (saveTimeoutRef.current) {
			window.clearTimeout(saveTimeoutRef.current);
		}
		if (saveStatusTimeoutRef.current) {
			window.clearTimeout(saveStatusTimeoutRef.current);
		}

		setSaving(true);
		setSaveState("idle");

		saveTimeoutRef.current = window.setTimeout(async () => {
			let saveSucceeded = false;
			try {
				await settingsStorage.setValue(settings);
				await browser.runtime.sendMessage({ type: "settingsUpdated" });
				lastSavedSnapshotRef.current = snapshot;
				saveSucceeded = true;
				setSaveState("saved");
				setShowSaveSuccess(true);
			} catch (err) {
				captureContextException("options", err, {
					operation: "autosave-settings",
				});
				setSaveState("error");
			} finally {
				setSaving(false);
				if (saveSucceeded) {
					saveStatusTimeoutRef.current = window.setTimeout(() => {
						setShowSaveSuccess(false);
						setSaveState("idle");
					}, 2500);
				}
			}
		}, 500);

		return () => {
			if (saveTimeoutRef.current) {
				window.clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [settings, loading]);

	async function handleManualScrape() {
		setScraping(true);
		try {
			await browser.runtime.sendMessage({ type: "manualScrape" });
		} catch (err) {
			captureContextException("options", err, {
				operation: "manualScrape",
			});
			console.error("[Upwork Scraper] Manual scrape failed", err);
		} finally {
			setScraping(false);
		}
	}

	if (loading) {
		return (
			<Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
				<Spinner size="3" />
			</Flex>
		);
	}

	const isSettingsPage = SETTINGS_PAGES.includes(activePage);
	const canRunScrape = settings.searchTargets.some((t) => t.searchUrl.trim());
	const extensionVersion = browser.runtime.getManifest().version;
	const nextRunDisplay = getApproximateNextRunDisplay({
		canRunScrape,
		masterEnabled: settings.masterEnabled,
		scraping,
		settings,
		nowMs,
		scheduledAlarmTimestamp,
	});
	let autoSaveColor: "red" | "gray" | "green" | "grass" = "green";
	if (saveState === "error") {
		autoSaveColor = "red";
	} else if (saving) {
		autoSaveColor = "gray";
	} else if (showSaveSuccess) {
		autoSaveColor = "grass";
	}
	let autoSaveLabel = "Auto-save on";
	if (saving) {
		autoSaveLabel = "Auto-saving...";
	}
	if (saveState === "saved") {
		autoSaveLabel = "Auto-saved ✓";
	} else if (saveState === "error") {
		autoSaveLabel = "Auto-save failed";
	}

	return (
		<Flex
			className={`app-shell ${
				isSidebarCollapsed ? "app-shell--sidebar-collapsed" : ""
			}`}
		>
			<OptionsSidebar
				activePage={activePage}
				onActivePageChange={setActivePage}
				isCollapsed={isSidebarCollapsed}
				onToggleCollapsed={() => setIsSidebarCollapsed((prev) => !prev)}
				nextRunDisplay={nextRunDisplay}
				masterEnabled={settings.masterEnabled}
				onToggleMasterEnabled={() =>
					setSettings({
						...settings,
						masterEnabled: !settings.masterEnabled,
					})
				}
				scraping={scraping}
				canRunScrape={canRunScrape}
				onRunScrape={handleManualScrape}
				extensionVersion={extensionVersion}
				isSettingsPage={isSettingsPage}
				saveState={saveState}
				saving={saving}
				autoSaveColor={autoSaveColor}
				autoSaveLabel={autoSaveLabel}
			/>

			{/* Main content */}
			<ScrollArea className="main-scroll">
				{activePage === "dashboard" && (
					<DashboardPage settings={settings} jobs={jobs} />
				)}
				{activePage === "search-targets" && (
					<SearchTargetsPage settings={settings} onChange={setSettings} />
				)}
				{activePage === "schedule" && (
					<SchedulePage settings={settings} onChange={setSettings} />
				)}
				{activePage === "delivery" && (
					<DeliveryPage settings={settings} onChange={setSettings} />
				)}
				{activePage === "history" && <JobHistoryTab />}
				{activePage === "activity" && <ActivityPage />}
			</ScrollArea>
		</Flex>
	);
}
