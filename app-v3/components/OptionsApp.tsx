import React, { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, settingsStorage } from "../utils/storage";
import type { Settings } from "../utils/types";
import { JobHistoryTab } from "./JobHistoryTab";
import { SettingsTab } from "./SettingsTab";

type Tab = "settings" | "history";

export function OptionsApp() {
	const [activeTab, setActiveTab] = useState<Tab>("settings");
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		settingsStorage.getValue().then((s) => {
			setSettings(s);
			setLoading(false);
		});
	}, []);

	if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

	return (
		<div>
			<header style={{ marginBottom: 24 }}>
				<h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
					Upwork Job Scraper
				</h1>
			</header>

			<nav
				style={{
					display: "flex",
					gap: 8,
					marginBottom: 24,
					borderBottom: "1px solid #e0e0e0",
					paddingBottom: 0,
				}}
			>
				{(["settings", "history"] as Tab[]).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						style={{
							padding: "8px 16px",
							border: "none",
							borderBottom:
								activeTab === tab
									? "2px solid #14a800"
									: "2px solid transparent",
							background: "none",
							cursor: "pointer",
							fontWeight: activeTab === tab ? 600 : 400,
							color: activeTab === tab ? "#14a800" : "#555",
							textTransform: "capitalize",
						}}
					>
						{tab === "history" ? "Job History" : "Settings"}
					</button>
				))}
			</nav>

			{activeTab === "settings" && (
				<SettingsTab settings={settings} onChange={setSettings} />
			)}
			{activeTab === "history" && <JobHistoryTab />}
		</div>
	);
}
