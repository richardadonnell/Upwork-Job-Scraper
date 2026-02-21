import {
	Badge,
	Box,
	Button,
	Flex,
	ScrollArea,
	Separator,
	Spinner,
	Switch,
	Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
	DEFAULT_SETTINGS,
	jobHistoryStorage,
	settingsStorage,
} from "../utils/storage";
import type { Job, Settings } from "../utils/types";

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
	| "history";

const NAV_ITEMS: { id: Page; label: string }[] = [
	{ id: "dashboard", label: "Overview" },
	{ id: "search-targets", label: "Search Targets" },
	{ id: "schedule", label: "Schedule" },
	{ id: "delivery", label: "Delivery" },
	{ id: "history", label: "Job History" },
];

const SETTINGS_PAGES: Page[] = ["search-targets", "schedule", "delivery"];

export function OptionsApp() {
	const [activePage, setActivePage] = useState<Page>("dashboard");
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [scraping, setScraping] = useState(false);
	const [statusMsg, setStatusMsg] = useState("");
	const [statusOk, setStatusOk] = useState(true);

	useEffect(() => {
		Promise.all([
			settingsStorage.getValue(),
			jobHistoryStorage.getValue(),
		]).then(([s, j]) => {
			setSettings(s);
			setJobs(j);
			setLoading(false);
		});
		const unwatchSettings = settingsStorage.watch((s) => setSettings(s));
		const unwatchJobs = jobHistoryStorage.watch((j) => setJobs(j));
		return () => {
			unwatchSettings();
			unwatchJobs();
		};
	}, []);

	async function handleSave() {
		setSaving(true);
		setStatusMsg("");
		try {
			await settingsStorage.setValue(settings);
			await browser.runtime.sendMessage({ type: "settingsUpdated" });
			setStatusOk(true);
			setStatusMsg("Saved");
		} catch {
			setStatusOk(false);
			setStatusMsg("Error saving");
		} finally {
			setSaving(false);
			setTimeout(() => setStatusMsg(""), 3000);
		}
	}

	async function handleManualScrape() {
		setScraping(true);
		setStatusMsg("");
		try {
			const res = await browser.runtime.sendMessage({ type: "manualScrape" });
			setStatusOk(res?.ok ?? false);
			setStatusMsg(
				res?.ok ? "Scrape complete" : `Failed: ${res?.error ?? "unknown"}`,
			);
		} catch (err) {
			setStatusOk(false);
			setStatusMsg(`Error: ${String(err)}`);
		} finally {
			setScraping(false);
			setTimeout(() => setStatusMsg(""), 4000);
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

	return (
		<Flex style={{ minHeight: "100vh" }}>
			{/* Sidebar */}
			<Box
				style={{
					width: 220,
					minWidth: 220,
					borderRight: "1px solid var(--gray-4)",
					display: "flex",
					flexDirection: "column",
					position: "sticky",
					top: 0,
					height: "100vh",
				}}
			>
				{/* Logo / Title */}
				<Box px="4" pt="5" pb="4">
					<Text
						size="1"
						color="green"
						weight="bold"
						style={{ letterSpacing: "0.05em", fontFamily: "monospace" }}
					>
						&gt;_
					</Text>
					<Text size="3" weight="bold" as="p" mt="0" mb="1">
						Upwork Scraper
					</Text>
					<Flex align="center" gap="2">
						<Box
							style={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: settings.masterEnabled
									? "var(--accent-9)"
									: "var(--gray-6)",
								boxShadow: settings.masterEnabled
									? "0 0 6px var(--accent-9)"
									: "none",
								transition: "all 0.3s",
								flexShrink: 0,
							}}
						/>
						<Text size="1" color="gray">
							{settings.masterEnabled ? "active" : "paused"}
						</Text>
					</Flex>
				</Box>

				<Separator size="4" />

				{/* Enable toggle */}
				<Flex align="center" justify="between" px="4" py="3" gap="2">
					<Text size="1" color="gray">
						Auto-scrape
					</Text>
					<Switch
						size="1"
						checked={settings.masterEnabled}
						onCheckedChange={(v) =>
							setSettings({ ...settings, masterEnabled: v })
						}
					/>
				</Flex>

				<Separator size="4" />

				{/* Nav */}
				<Box py="2" flexGrow="1">
					{NAV_ITEMS.map((item) => (
						<Box
							key={item.id}
							px="4"
							py="2"
							onClick={() => setActivePage(item.id)}
							style={{
								cursor: "pointer",
								background:
									activePage === item.id ? "var(--accent-3)" : "transparent",
								borderRight:
									activePage === item.id
										? "2px solid var(--accent-9)"
										: "2px solid transparent",
								transition: "background 0.15s",
							}}
							onMouseEnter={(e) => {
								if (activePage !== item.id)
									(e.currentTarget as HTMLDivElement).style.background =
										"var(--gray-3)";
							}}
							onMouseLeave={(e) => {
								if (activePage !== item.id)
									(e.currentTarget as HTMLDivElement).style.background =
										"transparent";
							}}
						>
							<Text
								size="2"
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
								variant="solid"
								color="green"
								disabled={saving}
								onClick={handleSave}
								style={{ width: "100%" }}
							>
								{saving ? (
									<Flex align="center" gap="1">
										<Spinner size="1" />
										<Text>Saving...</Text>
									</Flex>
								) : (
									"Save settings"
								)}
							</Button>
							<Button
								size="2"
								variant="outline"
								color="gray"
								disabled={
									scraping ||
									settings.searchTargets.every((t) => !t.searchUrl.trim())
								}
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
					)}

					{!isSettingsPage && (
						<Button
							size="2"
							variant="outline"
							color="gray"
							disabled={
								scraping ||
								settings.searchTargets.every((t) => !t.searchUrl.trim())
							}
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
					)}

					{statusMsg && (
						<Box mt="2">
							<Badge color={statusOk ? "green" : "red"} variant="soft" size="1">
								{statusMsg}
							</Badge>
						</Box>
					)}
				</Box>
			</Box>

			{/* Main content */}
			<ScrollArea style={{ flex: 1, height: "100vh" }}>
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
			</ScrollArea>
		</Flex>
	);
}
