import {
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
	{ id: "dashboard", label: "Overview" },
	{ id: "search-targets", label: "Search Targets" },
	{ id: "schedule", label: "Schedule" },
	{ id: "delivery", label: "Delivery" },
	{ id: "history", label: "Job History" },
	{ id: "activity", label: "Activity Logs" },
];

const SETTINGS_PAGES: Page[] = ["search-targets", "schedule", "delivery"];

type SaveState = "idle" | "saved" | "error";

export function OptionsApp() {
	const [activePage, setActivePage] = useState<Page>("dashboard");
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [scraping, setScraping] = useState(false);
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
							width={24}
							height={24}
						/>
					</Box>
					<Text size="3" weight="bold" as="p" mt="0" mb="1">
						Upwork Scraper
					</Text>
					<Flex align="center" gap="2">
						<Box
							className={`status-dot ${
								settings.masterEnabled ? "status-dot--on" : "status-dot--off"
							}`}
						/>
						<Text size="1" color="gray">
							{settings.masterEnabled ? "active" : "paused"}
						</Text>
					</Flex>
				</Box>

				<Separator size="4" />

				{/* Scraper controls */}
				<Box px="4" py="3">
					<Flex direction="column" gap="2">
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

				<Separator size="4" />

				{/* Bottom action area */}
				<Box px="4" py="4">
					<Text size="1" color="gray" mb="3" as="p">
						v3.0.0 &middot; chrome &middot; mv3
					</Text>

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
