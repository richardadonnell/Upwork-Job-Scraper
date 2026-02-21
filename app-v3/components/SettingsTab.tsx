import type React from "react";
import { useState } from "react";
import { settingsStorage } from "../utils/storage";
import type { SearchTarget, Settings } from "../utils/types";
import { EXAMPLE_WEBHOOK_PAYLOAD } from "../utils/types";

interface Props {
	readonly settings: Settings;
	readonly onChange: (s: Settings) => void;
}

// -- Design tokens (mirror CSS vars for inline styles) --
const s = {
	card: {
		background: "var(--surface)",
		border: "1px solid var(--border)",
		borderLeft: "3px solid var(--accent)",
		borderRadius: 8,
		padding: "20px 24px",
		marginBottom: 12,
	} as React.CSSProperties,
	cardHeader: {
		fontFamily: "var(--mono)",
		fontSize: 11,
		fontWeight: 700,
		letterSpacing: "0.1em",
		color: "var(--text-muted)",
		textTransform: "uppercase" as const,
		marginBottom: 16,
		marginTop: 0,
	} as React.CSSProperties,
	input: {
		width: "100%",
		padding: "9px 12px",
		background: "var(--surface-raised)",
		border: "1px solid var(--border)",
		borderRadius: 6,
		color: "var(--text)",
		fontSize: 13,
		fontFamily: "var(--mono)",
		outline: "none",
		transition: "border-color 0.2s, box-shadow 0.2s",
	} as React.CSSProperties,
	label: {
		display: "block",
		fontSize: 12,
		fontWeight: 500,
		color: "var(--text-mid)",
		marginBottom: 6,
		letterSpacing: "0.02em",
	} as React.CSSProperties,
};

function inputStyle(
	id: string,
	focusedInput: string | null,
): React.CSSProperties {
	return {
		...s.input,
		borderColor: focusedInput === id ? "var(--border-focus)" : "var(--border)",
		boxShadow: focusedInput === id ? "0 0 0 3px var(--accent-glow)" : "none",
	};
}

type TestStatus = "idle" | "sending" | "ok" | "error";

/** One search-URL + webhook pair */
function SearchTargetCard({
	target,
	index,
	total,
	focusedInput,
	onFocus,
	onBlur,
	onChange,
	onRemove,
}: {
	readonly target: SearchTarget;
	readonly index: number;
	readonly total: number;
	readonly focusedInput: string | null;
	readonly onFocus: (id: string) => void;
	readonly onBlur: () => void;
	readonly onChange: (updated: SearchTarget) => void;
	readonly onRemove: () => void;
}) {
	const searchId = `searchUrl-${target.id}`;
	const webhookId = `webhookUrl-${target.id}`;
	const toggleId = `webhookEnabled-${target.id}`;
	const [testStatus, setTestStatus] = useState<TestStatus>("idle");

	async function handleTestWebhook() {
		if (!target.webhookUrl) return;
		setTestStatus("sending");
		const payload = {
			...EXAMPLE_WEBHOOK_PAYLOAD,
			timestamp: new Date().toISOString(),
			jobs: EXAMPLE_WEBHOOK_PAYLOAD.jobs.map((job) => ({
				...job,
				scrapedAt: new Date().toISOString(),
			})),
		};
		try {
			const res = await fetch(target.webhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				setTestStatus("ok");
				setTimeout(() => setTestStatus("idle"), 3000);
			} else {
				setTestStatus("error");
				setTimeout(() => setTestStatus("idle"), 4000);
			}
		} catch {
			setTestStatus("error");
			setTimeout(() => setTestStatus("idle"), 4000);
		}
	}

	const testBtnLabels: Record<string, string> = {
		idle: "test",
		sending: "sending…",
		ok: "sent ✓",
		error: "failed ✗",
	};
	const testBtnLabel = testBtnLabels[testStatus] ?? "test";

	function getTestBtnColor(): string {
		if (testStatus === "ok") return "#000";
		if (testStatus === "error") return "var(--danger)";
		if (!target.webhookUrl) return "var(--text-muted)";
		return "var(--text)";
	}
	const testBtnColor = getTestBtnColor();

	return (
		<div
			style={{
				...s.card,
				marginBottom: 8,
				borderLeft: "3px solid var(--accent-dim)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 14,
				}}
			>
				<span style={{ ...s.cardHeader, marginBottom: 0 }}>
					Target {index + 1}
				</span>
				<button
					type="button"
					onClick={onRemove}
					disabled={total <= 1}
					style={{
						background: "transparent",
						border: "1px solid var(--border)",
						borderRadius: 4,
						color: total <= 1 ? "var(--text-muted)" : "var(--danger)",
						cursor: total <= 1 ? "not-allowed" : "pointer",
						fontSize: 11,
						fontFamily: "var(--mono)",
						padding: "3px 8px",
						letterSpacing: "0.04em",
					}}
				>
					remove
				</button>
			</div>

			<div style={{ marginBottom: 14 }}>
				<label style={s.label} htmlFor={searchId}>
					Search URL
				</label>
				<input
					id={searchId}
					type="url"
					style={inputStyle(searchId, focusedInput)}
					value={target.searchUrl}
					placeholder="https://www.upwork.com/nx/search/jobs/?q=..."
					onFocus={() => onFocus(searchId)}
					onBlur={onBlur}
					onChange={(e) => onChange({ ...target, searchUrl: e.target.value })}
				/>
			</div>

			<div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
				<ToggleRow
					id={toggleId}
					label="Send to webhook"
					description="POST new jobs as JSON to a custom endpoint"
					checked={target.webhookEnabled}
					onChange={(v) => onChange({ ...target, webhookEnabled: v })}
				/>
				{target.webhookEnabled && (
					<div style={{ marginTop: 12 }}>
						<label style={s.label} htmlFor={webhookId}>
							Webhook URL
						</label>
						<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
							<input
								id={webhookId}
								type="url"
								style={{ ...inputStyle(webhookId, focusedInput), flex: 1 }}
								value={target.webhookUrl}
								placeholder="https://hooks.example.com/..."
								onFocus={() => onFocus(webhookId)}
								onBlur={onBlur}
								onChange={(e) =>
									onChange({ ...target, webhookUrl: e.target.value })
								}
							/>
							<button
								type="button"
								onClick={handleTestWebhook}
								disabled={!target.webhookUrl || testStatus === "sending"}
								style={{
									flexShrink: 0,
									padding: "9px 12px",
									background:
										testStatus === "ok"
											? "var(--accent)"
											: "var(--surface-raised)",
									border:
										testStatus === "error"
											? "1px solid var(--danger)"
											: "1px solid var(--border)",
									borderRadius: 6,
									color: testBtnColor,
									cursor:
										!target.webhookUrl || testStatus === "sending"
											? "not-allowed"
											: "pointer",
									fontSize: 11,
									fontFamily: "var(--mono)",
									letterSpacing: "0.04em",
									whiteSpace: "nowrap" as const,
									transition: "background 0.2s, border-color 0.2s, color 0.2s",
								}}
							>
								{testBtnLabel}
							</button>
						</div>
						{testStatus === "error" && (
							<p
								style={{
									margin: "6px 0 0",
									fontSize: 11,
									color: "var(--danger)",
									fontFamily: "var(--mono)",
								}}
							>
								Request failed — check the URL or CORS settings on your
								endpoint.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/** Custom toggle switch rendered entirely with inline styles */
function Toggle({
	checked,
	onChange,
	id,
}: {
	readonly checked: boolean;
	readonly onChange: (v: boolean) => void;
	readonly id: string;
}) {
	return (
		<button
			id={id}
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			style={{
				position: "relative",
				display: "inline-flex",
				alignItems: "center",
				width: 40,
				height: 22,
				borderRadius: 11,
				background: checked ? "var(--accent)" : "var(--surface-raised)",
				border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`,
				cursor: "pointer",
				padding: 0,
				flexShrink: 0,
				transition: "background 0.2s, border-color 0.2s",
				boxShadow: checked ? "0 0 8px var(--accent-glow)" : "none",
			}}
		>
			<span
				style={{
					position: "absolute",
					left: checked ? 20 : 3,
					width: 14,
					height: 14,
					borderRadius: "50%",
					background: checked ? "#fff" : "var(--text-muted)",
					transition: "left 0.2s, background 0.2s",
				}}
			/>
		</button>
	);
}

function ToggleRow({
	id,
	label,
	description,
	checked,
	onChange,
}: {
	readonly id: string;
	readonly label: string;
	readonly description?: string;
	readonly checked: boolean;
	readonly onChange: (v: boolean) => void;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 16,
			}}
		>
			<div>
				<label
					htmlFor={id}
					style={{
						fontSize: 13,
						fontWeight: 500,
						color: "var(--text)",
						cursor: "pointer",
						display: "block",
					}}
				>
					{label}
				</label>
				{description && (
					<span
						style={{
							fontSize: 11,
							color: "var(--text-mid)",
							marginTop: 2,
							display: "block",
						}}
					>
						{description}
					</span>
				)}
			</div>
			<Toggle id={id} checked={checked} onChange={onChange} />
		</div>
	);
}

export function SettingsTab({ settings, onChange }: Props) {
	const [saving, setSaving] = useState(false);
	const [scraping, setScraping] = useState(false);
	const [statusMsg, setStatusMsg] = useState("");
	const [statusOk, setStatusOk] = useState(true);
	const [focusedInput, setFocusedInput] = useState<string | null>(null);

	async function handleSave() {
		setSaving(true);
		setStatusMsg("");
		try {
			await settingsStorage.setValue(settings);
			await browser.runtime.sendMessage({ type: "settingsUpdated" });
			setStatusOk(true);
			setStatusMsg("Settings saved.");
		} catch {
			setStatusOk(false);
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
			setStatusOk(res?.ok ?? false);
			setStatusMsg(
				res?.ok
					? "Scrape complete."
					: `Scrape failed: ${res?.error ?? "unknown error"}`,
			);
		} catch (err) {
			setStatusOk(false);
			setStatusMsg(`Error: ${String(err)}`);
		} finally {
			setScraping(false);
		}
	}

	const inputFocusStyle = (id: string) => inputStyle(id, focusedInput);

	return (
		<div>
			{/* Section 1 — General */}
			<div style={s.card}>
				<p style={s.cardHeader}>General</p>
				<ToggleRow
					id="masterEnabled"
					label="Enable automatic scraping"
					description="Periodically checks for new Upwork jobs using the schedule below"
					checked={settings.masterEnabled}
					onChange={(v) => onChange({ ...settings, masterEnabled: v })}
				/>
			</div>

			{/* Section 2 — Search Targets */}
			<div style={s.card}>
				<p style={s.cardHeader}>Search Targets</p>
				{settings.searchTargets.map((target, i) => (
					<SearchTargetCard
						key={target.id}
						target={target}
						index={i}
						total={settings.searchTargets.length}
						focusedInput={focusedInput}
						onFocus={setFocusedInput}
						onBlur={() => setFocusedInput(null)}
						onChange={(updated) => {
							const next = settings.searchTargets.map((t) =>
								t.id === updated.id ? updated : t,
							);
							onChange({ ...settings, searchTargets: next });
						}}
						onRemove={() => {
							const next = settings.searchTargets.filter(
								(t) => t.id !== target.id,
							);
							onChange({ ...settings, searchTargets: next });
						}}
					/>
				))}
				<button
					type="button"
					onClick={() => {
						const newTarget = {
							id: crypto.randomUUID(),
							searchUrl: "",
							webhookEnabled: false,
							webhookUrl: "",
						};
						onChange({
							...settings,
							searchTargets: [...settings.searchTargets, newTarget],
						});
					}}
					style={{
						marginTop: 4,
						padding: "8px 16px",
						background: "transparent",
						border: "1px dashed var(--border)",
						borderRadius: 6,
						color: "var(--text-mid)",
						cursor: "pointer",
						fontSize: 12,
						fontFamily: "var(--mono)",
						width: "100%",
						letterSpacing: "0.04em",
					}}
				>
					+ add target
				</button>
			</div>

			{/* Section 3 — Schedule */}
			<div style={s.card}>
				<p style={s.cardHeader}>Schedule</p>
				<p style={{ ...s.label, margin: "0 0 6px" }}>Check every</p>
				<div style={{ display: "flex", gap: 10 }}>
					{(["days", "hours", "minutes"] as const).map((unit) => {
						const max = unit === "days" ? 30 : 59;
						const short = unit[0];
						return (
							<div key={unit} style={{ flex: 1, position: "relative" }}>
								<input
									type="number"
									min={0}
									max={max}
									style={{
										...inputFocusStyle(`freq-${unit}`),
										paddingRight: 28,
									}}
									value={settings.checkFrequency[unit]}
									onFocus={() => setFocusedInput(`freq-${unit}`)}
									onBlur={() => setFocusedInput(null)}
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
								<span
									style={{
										position: "absolute",
										right: 10,
										top: "50%",
										transform: "translateY(-50%)",
										fontFamily: "var(--mono)",
										fontSize: 11,
										color: "var(--text-muted)",
										pointerEvents: "none" as const,
									}}
								>
									{short}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Section 4 — Delivery */}
			<div style={s.card}>
				<p style={s.cardHeader}>Delivery</p>
				<ToggleRow
					id="notificationsEnabled"
					label="Browser notifications"
					description="Show a desktop notification when new jobs are found"
					checked={settings.notificationsEnabled}
					onChange={(v) => onChange({ ...settings, notificationsEnabled: v })}
				/>
			</div>

			{/* Last run status */}
			{settings.lastRunAt && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 20,
						padding: "10px 14px",
						background: "var(--surface)",
						border: "1px solid var(--border)",
						borderRadius: 6,
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 6,
							height: 6,
							borderRadius: "50%",
							background:
								settings.lastRunStatus === "success"
									? "var(--accent)"
									: "var(--danger)",
							flexShrink: 0,
						}}
					/>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 11,
							color: "var(--text-mid)",
						}}
					>
						last run
					</span>
					<span
						style={{
							fontFamily: "var(--mono)",
							fontSize: 11,
							color: "var(--text)",
						}}
					>
						{new Date(settings.lastRunAt).toLocaleString()}
					</span>
					<span
						style={{
							marginLeft: "auto",
							padding: "2px 8px",
							borderRadius: 4,
							fontSize: 10,
							fontFamily: "var(--mono)",
							fontWeight: 700,
							letterSpacing: "0.06em",
							background:
								settings.lastRunStatus === "success"
									? "rgba(20,168,0,0.12)"
									: "var(--danger-dim)",
							color:
								settings.lastRunStatus === "success"
									? "var(--accent)"
									: "var(--danger)",
							border: `1px solid ${settings.lastRunStatus === "success" ? "var(--accent-dim)" : "var(--danger)"}`,
						}}
					>
						{settings.lastRunStatus}
					</span>
				</div>
			)}

			{/* Action bar */}
			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
					flexWrap: "wrap" as const,
				}}
			>
				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					style={{
						padding: "10px 22px",
						background: saving ? "var(--accent-dim)" : "var(--accent)",
						color: "#fff",
						border: "none",
						borderRadius: 6,
						cursor: saving ? "not-allowed" : "pointer",
						fontWeight: 600,
						fontSize: 13,
						fontFamily: "var(--sans)",
						transition: "background 0.2s, opacity 0.2s",
						letterSpacing: "0.01em",
					}}
				>
					{saving ? "Saving…" : "Save settings"}
				</button>

				<button
					type="button"
					onClick={handleManualScrape}
					disabled={
						scraping || settings.searchTargets.every((t) => !t.searchUrl.trim())
					}
					style={{
						padding: "10px 22px",
						background: "transparent",
						color:
							scraping ||
							settings.searchTargets.every((t) => !t.searchUrl.trim())
								? "var(--text-muted)"
								: "var(--text)",
						border: `1px solid ${scraping || settings.searchTargets.every((t) => !t.searchUrl.trim()) ? "var(--border)" : "var(--text-mid)"}`,
						borderRadius: 6,
						cursor:
							scraping ||
							settings.searchTargets.every((t) => !t.searchUrl.trim())
								? "not-allowed"
								: "pointer",
						fontWeight: 500,
						fontSize: 13,
						fontFamily: "var(--sans)",
						transition: "all 0.2s",
					}}
				>
					{scraping ? "Scraping…" : "Run scrape now"}
				</button>

				{statusMsg && (
					<span
						style={{
							fontSize: 12,
							fontFamily: "var(--mono)",
							color: statusOk ? "var(--accent)" : "var(--danger)",
							padding: "4px 10px",
							background: statusOk
								? "rgba(20,168,0,0.08)"
								: "var(--danger-dim)",
							borderRadius: 4,
							border: `1px solid ${statusOk ? "var(--accent-dim)" : "var(--danger)"}`,
							letterSpacing: "0.02em",
						}}
					>
						{statusMsg}
					</span>
				)}
			</div>
		</div>
	);
}
