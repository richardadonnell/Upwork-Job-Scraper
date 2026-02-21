import { useEffect, useState } from "react";
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

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "40vh",
					gap: 12,
				}}
			>
				<div
					style={{
						width: 8,
						height: 8,
						borderRadius: "50%",
						background: "var(--accent)",
						animation: "pulse 1s ease-in-out infinite",
					}}
				/>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 13,
						color: "var(--text-mid)",
					}}
				>
					loading...
				</span>
				<style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8) } 50% { opacity:1; transform:scale(1.2) } }`}</style>
			</div>
		);
	}

	return (
		<div>
			{/* Header */}
			<header
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					paddingBottom: 28,
					marginBottom: 28,
					borderBottom: "1px solid var(--border)",
				}}
			>
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
							marginBottom: 4,
						}}
					>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 13,
								color: "var(--accent)",
								fontWeight: 700,
								letterSpacing: "0.05em",
							}}
						>
							&gt;_
						</span>
						<h1
							style={{
								margin: 0,
								fontSize: 20,
								fontWeight: 700,
								fontFamily: "var(--mono)",
								letterSpacing: "-0.02em",
								color: "var(--text)",
							}}
						>
							Upwork Job Scraper
						</h1>
						<span
							style={{
								padding: "2px 8px",
								background: "var(--surface)",
								border: "1px solid var(--border)",
								borderRadius: 4,
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--text-muted)",
								letterSpacing: "0.06em",
								fontWeight: 500,
							}}
						>
							v3.0.0
						</span>
					</div>
					<p
						style={{
							margin: 0,
							fontSize: 12,
							color: "var(--text-mid)",
							fontFamily: "var(--mono)",
							letterSpacing: "0.03em",
						}}
					>
						chrome extension · mv3
					</p>
				</div>

				{/* Status indicator */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 6,
						marginTop: 4,
					}}
				>
					<div
						style={{
							width: 6,
							height: 6,
							borderRadius: "50%",
							background: settings.masterEnabled
								? "var(--accent)"
								: "var(--text-muted)",
							boxShadow: settings.masterEnabled
								? "0 0 6px var(--accent)"
								: "none",
							transition: "all 0.3s",
						}}
					/>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 11,
							color: "var(--text-mid)",
							letterSpacing: "0.04em",
						}}
					>
						{settings.masterEnabled ? "active" : "paused"}
					</span>
				</div>
			</header>

			{/* Tab bar */}
			<div
				style={{
					display: "inline-flex",
					background: "var(--surface)",
					border: "1px solid var(--border)",
					borderRadius: 8,
					padding: 3,
					marginBottom: 28,
					gap: 2,
				}}
			>
				{(["settings", "history"] as Tab[]).map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						style={{
							padding: "7px 18px",
							border: "none",
							borderRadius: 6,
							background: activeTab === tab ? "var(--accent)" : "transparent",
							cursor: "pointer",
							fontWeight: 600,
							fontSize: 13,
							fontFamily: "var(--sans)",
							color: activeTab === tab ? "#fff" : "var(--text-mid)",
							transition: "all 0.2s",
							letterSpacing: "0.01em",
						}}
					>
						{tab === "history" ? "Job History" : "Settings"}
					</button>
				))}
			</div>
			{activeTab === "settings" && (
				<SettingsTab settings={settings} onChange={setSettings} />
			)}
			{activeTab === "history" && <JobHistoryTab />}
		</div>
	);
}
