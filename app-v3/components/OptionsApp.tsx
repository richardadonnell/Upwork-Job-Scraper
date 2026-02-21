import {
	Badge,
	Box,
	Button,
	Flex,
	ScrollArea,
	Separator,
	Spinner,
	Text,
} from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
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
import { SchedulePage } from "./SchedulePage";
import { SearchTargetsPage } from "./SearchTargetsPage";

type Page =
	| "dashboard"
	| "search-targets"
	| "schedule"
	| "delivery"
	| "history"
	| "activity";

const NAV_ITEMS: { id: Page; label: string }[] = [
	{ id: "dashboard", label: "Dashboard" },
	{ id: "search-targets", label: "Search + Webhook URLs" },
	{ id: "schedule", label: "Set Schedule" },
	{ id: "delivery", label: "Browser Notifications" },
	{ id: "history", label: "Scraped Jobs" },
	{ id: "activity", label: "Activity Logs" },
];

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
			} catch {
				setSaveState("error");
			} finally {
				setSaving(false);
				if (saveSucceeded) {
					saveStatusTimeoutRef.current = window.setTimeout(() => {
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
	let autoSaveColor: "red" | "gray" | "green" = "green";
	if (saveState === "error") {
		autoSaveColor = "red";
	} else if (saving) {
		autoSaveColor = "gray";
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
		<Flex className="app-shell">
			{/* Sidebar */}
			<Box className="app-sidebar">
				{/* Logo / Title */}
				<Box px="4" pt="5" pb="4">
					<Box mb="2">
						<img
							src="/logo.svg"
							alt="Upwork Job Scraper logo"
							width={48}
							height={48}
						/>
					</Box>
					<Text size="3" weight="bold" as="p" mt="0" mb="1">
						Upwork Job Scraper + Webhook Extension
					</Text>
				</Box>

				<Separator size="4" />

				{/* Scraper controls */}
				<Box px="4" py="3">
					<Flex direction="column" gap="2">
						<Box
							style={{
								padding: "8px 10px",
								border: "1px solid var(--gray-4)",
								borderRadius: "var(--radius-2)",
								background:
									"color-mix(in srgb, var(--gray-2) 70%, transparent)",
							}}
						>
							<Text size="1" color="gray" as="p" m="0">
								Next scraper run
							</Text>
							<Text
								size="2"
								weight="medium"
								color={nextRunDisplay.primaryColor}
								as="p"
								m="0"
								mt="1"
							>
								{nextRunDisplay.primary}
							</Text>
							{nextRunDisplay.secondary && (
								<Text size="1" color="gray" as="p" m="0" mt="1">
									{nextRunDisplay.secondary}
								</Text>
							)}
						</Box>

						<Button
							size="2"
							variant="soft"
							color={settings.masterEnabled ? "green" : "gray"}
							onClick={() =>
								setSettings({
									...settings,
									masterEnabled: !settings.masterEnabled,
								})
							}
							style={{ width: "100%" }}
						>
							{settings.masterEnabled ? "Scraper Enabled" : "Scraper Disabled"}
						</Button>
						<Button
							size="2"
							variant="outline"
							color="gray"
							disabled={scraping || !canRunScrape}
							onClick={handleManualScrape}
							style={{ width: "100%" }}
						>
							{scraping ? (
								<Flex align="center" gap="1">
									<Spinner size="1" />
									<Text>Scraping...</Text>
								</Flex>
							) : (
								"Run scrape now"
							)}
						</Button>
					</Flex>
				</Box>

				<Separator size="4" />

				{/* Nav */}
				<Box className="app-nav">
					{NAV_ITEMS.map((item) => (
						<Box
							key={item.id}
							className={`app-nav-item ${
								activePage === item.id ? "app-nav-item--active" : ""
							}`}
							onClick={() => setActivePage(item.id)}
						>
							<Text
								size="1"
								weight={activePage === item.id ? "medium" : "regular"}
								color={activePage === item.id ? "green" : undefined}
							>
								{item.label}
							</Text>
						</Box>
					))}
				</Box>

				{/* Bottom action area */}
				<Box px="4" py="4">
					<Flex justify="center" mb="3">
						<Badge variant="soft" color="grass">
							{extensionVersion}
						</Badge>
					</Flex>

					{isSettingsPage && (
						<Flex direction="column" gap="2">
							<Button
								size="2"
								variant="soft"
								color={autoSaveColor}
								disabled
								style={{ width: "100%" }}
							>
								{saving ? (
									<Flex align="center" gap="1">
										<Spinner size="1" />
										<Text>{autoSaveLabel}</Text>
									</Flex>
								) : (
									autoSaveLabel
								)}
							</Button>
						</Flex>
					)}
				</Box>
			</Box>

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
