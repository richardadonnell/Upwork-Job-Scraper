import type React from "react";
import { useState } from "react";
import { settingsStorage } from "../utils/storage";
import type { Settings } from "../utils/types";

interface Props {
	settings: Settings;
	onChange: (s: Settings) => void;
}

export function SettingsTab({ settings, onChange }: Props) {
	const [saving, setSaving] = useState(false);
	const [scraping, setScraping] = useState(false);
	const [statusMsg, setStatusMsg] = useState("");

	async function handleSave() {
		setSaving(true);
		setStatusMsg("");
		try {
			await settingsStorage.setValue(settings);
			await browser.runtime.sendMessage({ type: "settingsUpdated" });
			setStatusMsg("Settings saved.");
		} catch {
			setStatusMsg("Error saving settings.");
		} finally {
			setSaving(false);
		}
	}

	async function handleManualScrape() {
		setScraping(true);
		setStatusMsg("");
		try {
			const res = await browser.runtime.sendMessage({ type: "manualScrape" });
			setStatusMsg(
				res?.ok
					? "Scrape complete."
					: `Scrape failed: ${res?.error ?? "unknown error"}`,
			);
		} catch (err) {
			setStatusMsg(`Error: ${String(err)}`);
		} finally {
			setScraping(false);
		}
	}

	const fieldStyle: React.CSSProperties = { marginBottom: 16 };
	const labelStyle: React.CSSProperties = {
		display: "block",
		fontWeight: 500,
		marginBottom: 4,
	};
	const inputStyle: React.CSSProperties = {
		width: "100%",
		padding: "8px 10px",
		border: "1px solid #ccc",
		borderRadius: 4,
		fontSize: 14,
	};

	return (
		<div>
			{/* Master toggle */}
			<div
				style={{
					...fieldStyle,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				<input
					type="checkbox"
					id="masterEnabled"
					checked={settings.masterEnabled}
					onChange={(e) =>
						onChange({ ...settings, masterEnabled: e.target.checked })
					}
					style={{ width: 18, height: 18, cursor: "pointer" }}
				/>
				<label
					htmlFor="masterEnabled"
					style={{ cursor: "pointer", fontWeight: 500 }}
				>
					Enable automatic scraping
				</label>
			</div>

			{/* Search URL */}
			<div style={fieldStyle}>
				<label style={labelStyle} htmlFor="searchUrl">
					Upwork search URL
				</label>
				<input
					id="searchUrl"
					type="url"
					style={inputStyle}
					value={settings.searchUrl}
					placeholder="https://www.upwork.com/nx/search/jobs/?q=..."
					onChange={(e) => onChange({ ...settings, searchUrl: e.target.value })}
				/>
			</div>

			{/* Check frequency */}
			<div style={fieldStyle}>
				<label style={labelStyle}>Check frequency</label>
				<div style={{ display: "flex", gap: 12 }}>
					{(["days", "hours", "minutes"] as const).map((unit) => (
						<div key={unit} style={{ flex: 1 }}>
							<label
								style={{
									display: "block",
									fontSize: 12,
									color: "#666",
									marginBottom: 2,
								}}
							>
								{unit.charAt(0).toUpperCase() + unit.slice(1)}
							</label>
							<input
								type="number"
								min={0}
								max={unit === "days" ? 30 : 59}
								style={inputStyle}
								value={settings.checkFrequency[unit]}
								onChange={(e) =>
									onChange({
										...settings,
										checkFrequency: {
											...settings.checkFrequency,
											[unit]: Number(e.target.value),
										},
									})
								}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Notifications */}
			<div
				style={{
					...fieldStyle,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				<input
					type="checkbox"
					id="notificationsEnabled"
					checked={settings.notificationsEnabled}
					onChange={(e) =>
						onChange({ ...settings, notificationsEnabled: e.target.checked })
					}
					style={{ width: 18, height: 18, cursor: "pointer" }}
				/>
				<label
					htmlFor="notificationsEnabled"
					style={{ cursor: "pointer", fontWeight: 500 }}
				>
					Browser notifications for new jobs
				</label>
			</div>

			{/* Webhook toggle */}
			<div
				style={{
					...fieldStyle,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				<input
					type="checkbox"
					id="webhookEnabled"
					checked={settings.webhookEnabled}
					onChange={(e) =>
						onChange({ ...settings, webhookEnabled: e.target.checked })
					}
					style={{ width: 18, height: 18, cursor: "pointer" }}
				/>
				<label
					htmlFor="webhookEnabled"
					style={{ cursor: "pointer", fontWeight: 500 }}
				>
					Send to webhook
				</label>
			</div>

			{/* Webhook URL */}
			{settings.webhookEnabled && (
				<div style={fieldStyle}>
					<label style={labelStyle} htmlFor="webhookUrl">
						Webhook URL
					</label>
					<input
						id="webhookUrl"
						type="url"
						style={inputStyle}
						value={settings.webhookUrl}
						placeholder="https://hooks.example.com/..."
						onChange={(e) =>
							onChange({ ...settings, webhookUrl: e.target.value })
						}
					/>
				</div>
			)}

			{/* Last run info */}
			{settings.lastRunAt && (
				<p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
					Last run: {new Date(settings.lastRunAt).toLocaleString()} —{" "}
					<span
						style={{
							color:
								settings.lastRunStatus === "success" ? "#14a800" : "#c70e05",
						}}
					>
						{settings.lastRunStatus}
					</span>
				</p>
			)}

			{/* Actions */}
			<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					style={{
						padding: "9px 20px",
						background: "#14a800",
						color: "#fff",
						border: "none",
						borderRadius: 4,
						cursor: "pointer",
						fontWeight: 600,
					}}
				>
					{saving ? "Saving..." : "Save settings"}
				</button>

				<button
					type="button"
					onClick={handleManualScrape}
					disabled={scraping || !settings.searchUrl}
					style={{
						padding: "9px 20px",
						background: "#f5f5f5",
						color: "#333",
						border: "1px solid #ccc",
						borderRadius: 4,
						cursor: "pointer",
					}}
				>
					{scraping ? "Scraping..." : "Run scrape now"}
				</button>

				{statusMsg && (
					<span style={{ fontSize: 13, color: "#555" }}>{statusMsg}</span>
				)}
			</div>
		</div>
	);
}
