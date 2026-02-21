import {
	Box,
	Button,
	Card,
	Flex,
	Heading,
	Separator,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import type { SearchTarget, Settings } from "../utils/types";
import { EXAMPLE_WEBHOOK_PAYLOAD } from "../utils/types";

interface Props {
	readonly settings: Settings;
	readonly onChange: (s: Settings) => void;
}

type TestStatus = "idle" | "sending" | "ok" | "error";

const UPWORK_SEARCH_PREFIX = "https://www.upwork.com/nx/search/jobs/";

function isProgressivelyAllowedSearchUrl(value: string) {
	return (
		value === "" ||
		UPWORK_SEARCH_PREFIX.startsWith(value) ||
		value.startsWith(UPWORK_SEARCH_PREFIX)
	);
}

function isValidSearchUrl(value: string) {
	return value.startsWith(UPWORK_SEARCH_PREFIX);
}

function SearchTargetCard({
	target,
	index,
	total,
	onChange,
	onRemove,
}: {
	readonly target: SearchTarget;
	readonly index: number;
	readonly total: number;
	readonly onChange: (t: SearchTarget) => void;
	readonly onRemove: () => void;
}) {
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
			setTestStatus(res.ok ? "ok" : "error");
			setTimeout(() => setTestStatus("idle"), res.ok ? 3000 : 4000);
		} catch {
			setTestStatus("error");
			setTimeout(() => setTestStatus("idle"), 4000);
		}
	}

	const testLabel = {
		idle: "Send Test Webhook Payload",
		sending: "Sending…",
		ok: "Sent ✓",
		error: "Failed ✗",
	}[testStatus];
	const canOpenSearchUrl = isValidSearchUrl(target.searchUrl);
	let testColor: "gray" | "green" | "red" = "gray";
	if (testStatus === "ok") testColor = "green";
	else if (testStatus === "error") testColor = "red";

	function handleOpenSearchUrl() {
		const searchUrl = target.searchUrl.trim();
		if (!searchUrl) return;
		if (!isValidSearchUrl(searchUrl)) return;
		try {
			const parsed = new URL(searchUrl);
			if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
			window.open(parsed.toString(), "_blank", "noopener,noreferrer");
		} catch {
			return;
		}
	}

	return (
		<Card className="surface-card" mb="3">
			<Flex justify="between" align="center" mb="3">
				<Text size="2" weight="bold" color="gray">
					Target {index + 1}
				</Text>
				<Button
					size="1"
					variant="ghost"
					color="red"
					disabled={total <= 1}
					onClick={onRemove}
				>
					Remove
				</Button>
			</Flex>

			<Box mb="3">
				<Text
					as="label"
					size="1"
					weight="medium"
					color="gray"
					mb="1"
					style={{ display: "block" }}
				>
					Search URL
				</Text>
				<Flex gap="2" align="start">
					<Box flexGrow="1">
						<TextField.Root
							size="2"
							type="url"
							placeholder="https://www.upwork.com/nx/search/jobs/..."
							value={target.searchUrl}
							onChange={(e) => {
								const next = e.target.value;
								if (!isProgressivelyAllowedSearchUrl(next)) return;
								onChange({ ...target, searchUrl: next });
							}}
						/>
					</Box>
					<Button
						size="2"
						variant="outline"
						color="gray"
						disabled={!canOpenSearchUrl}
						onClick={handleOpenSearchUrl}
					>
						Open Search URL in New Tab
					</Button>
				</Flex>
			</Box>

			<Separator size="4" mb="3" />

			<Flex
				justify="between"
				align="start"
				gap="3"
				mb={target.webhookEnabled ? "3" : "0"}
			>
				<Box>
					<Text size="2" weight="medium">
						Send to webhook
					</Text>
					<Text size="1" color="gray" as="p" mt="0">
						POST new jobs as JSON to a custom endpoint
					</Text>
				</Box>
				<Switch
					size="2"
					checked={target.webhookEnabled}
					onCheckedChange={(v) => onChange({ ...target, webhookEnabled: v })}
				/>
			</Flex>

			{target.webhookEnabled && (
				<Box>
					<Text
						as="label"
						size="1"
						weight="medium"
						color="gray"
						mb="1"
						style={{ display: "block" }}
					>
						Webhook URL
					</Text>
					<Flex gap="2" align="start">
						<Box flexGrow="1">
							<TextField.Root
								size="2"
								type="url"
								placeholder="https://hooks.example.com/..."
								value={target.webhookUrl}
								onChange={(e) =>
									onChange({ ...target, webhookUrl: e.target.value })
								}
							/>
						</Box>
						<Button
							size="2"
							variant="soft"
							color={testColor}
							disabled={!target.webhookUrl || testStatus === "sending"}
							onClick={handleTestWebhook}
						>
							{testLabel}
						</Button>
					</Flex>
					{testStatus === "error" && (
						<Text size="1" color="red" mt="1" as="p">
							Request failed — check the URL or CORS settings on your endpoint.
						</Text>
					)}
				</Box>
			)}
		</Card>
	);
}

export function SearchTargetsPage({ settings, onChange }: Props) {
	return (
		<Box className="page-shell">
			<Heading className="page-title" size="5">
				Search Targets
			</Heading>
			<Text className="page-subtitle" size="2" color="gray" as="p">
				Configure the Upwork search URLs to monitor, and optional webhooks to
				notify.
			</Text>

			<Separator className="page-divider" size="4" />

			{settings.searchTargets.map((target, i) => (
				<SearchTargetCard
					key={target.id}
					target={target}
					index={i}
					total={settings.searchTargets.length}
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

			<Button
				variant="outline"
				color="gray"
				style={{ width: "100%" }}
				onClick={() => {
					const newTarget: SearchTarget = {
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
			>
				+ Add target
			</Button>
		</Box>
	);
}
