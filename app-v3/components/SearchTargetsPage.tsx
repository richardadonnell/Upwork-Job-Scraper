import {
	DownloadIcon,
	ExternalLinkIcon,
	InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
	Box,
	Button,
	Callout,
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
import {
	EXAMPLE_LEGACY_WEBHOOK_PAYLOAD,
	EXAMPLE_WEBHOOK_PAYLOAD,
} from "../utils/types";

interface Props {
	readonly settings: Settings;
	readonly onChange: (s: Settings) => void;
}

type TestStatus = "idle" | "sending" | "ok" | "error";

const UPWORK_SEARCH_PREFIX = "https://www.upwork.com/nx/search/jobs/";
const BASE_UPWORK_SEARCH_URL =
	"https://www.upwork.com/nx/search/jobs/?sort=recency&page=1&per_page=50";

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
		const targetName = target.name.trim() || `Target ${index + 1}`;
		const payload =
			target.payloadMode === "legacy-v1"
				? EXAMPLE_LEGACY_WEBHOOK_PAYLOAD.map((job) => ({
						...job,
						scrapedAt: Date.now(),
						scrapedAtHuman: new Date().toLocaleString(),
						sourceUrl: target.searchUrl || job.sourceUrl,
						source: {
							name: targetName,
							searchUrl: target.searchUrl || job.source.searchUrl,
							webhookUrl: target.webhookUrl,
						},
					}))
				: {
						...EXAMPLE_WEBHOOK_PAYLOAD,
						targetName,
						timestamp: new Date().toISOString(),
						jobs: EXAMPLE_WEBHOOK_PAYLOAD.jobs.map((job) => ({
							...job,
							scrapedAt: new Date().toISOString(),
							postedAtIso: new Date(job.postedAtMs).toISOString(),
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
					{target.name.trim() || `Target ${index + 1}`}
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
					Name
				</Text>
				<TextField.Root
					size="2"
					placeholder={`Target ${index + 1}`}
					value={target.name}
					onChange={(e) => onChange({ ...target, name: e.target.value })}
				/>
			</Box>

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
				<Flex gap="2" align="start" wrap="wrap">
					<Box style={{ flex: "1 1 320px", minWidth: 0 }}>
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
						variant="soft"
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
					<Flex gap="2" align="start" wrap="wrap">
						<Box style={{ flex: "1 1 320px", minWidth: 0 }}>
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
							color="gray"
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

					<Flex justify="between" align="start" gap="3" mt="3">
						<Box>
							<Text size="2" weight="medium">
								Legacy payload compatibility
							</Text>
							<Text size="1" color="gray" as="p" mt="0">
								Send v1-style webhook JSON array for existing automations.
							</Text>
						</Box>
						<Switch
							size="2"
							checked={target.payloadMode === "legacy-v1"}
							onCheckedChange={(enabled) =>
								onChange({
									...target,
									payloadMode: enabled ? "legacy-v1" : "v3",
								})
							}
						/>
					</Flex>
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

			<Callout.Root mb="4" size="2" variant="soft" color="blue">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<strong>How to use this extension:</strong> open the base Upwork
					search URL (pre-configured to Most Recent and 50 jobs per page), then
					customize the search settings however you like. When you are happy
					with the results, copy the full URL from Upwork and paste it into the{" "}
					<strong>Search URL</strong> field below. The extension will scrape
					jobs using those exact settings, and advanced users can optionally add
					a webhook URL for automation platforms like n8n or Make.com.
					<Box mt="2">
						<Button asChild size="1" variant="soft" color="blue">
							<a
								href={BASE_UPWORK_SEARCH_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								Open Upwork Base Search URL
								<ExternalLinkIcon />
							</a>
						</Button>
					</Box>
				</Callout.Text>
			</Callout.Root>

			<Callout.Root mb="4" size="2" variant="soft" color="gray">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<strong>Starter workflow for n8n:</strong> download this starter
					workflow, create a new workflow in n8n, then open the three-dot menu
					in the upper-right and select "Import from file…" to get started.
					<Box mt="2">
						<Button asChild size="1" variant="soft" color="gray">
							<a
								href="/example-n8n-workflow.json"
								download="example-n8n-workflow.json"
							>
								<DownloadIcon />
								Download n8n Example Workflow JSON File
							</a>
						</Button>
					</Box>
				</Callout.Text>
			</Callout.Root>

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
				variant="soft"
				color="grass"
				style={{ width: "100%" }}
				onClick={() => {
					const newTarget: SearchTarget = {
						id: crypto.randomUUID(),
						name: `Target ${settings.searchTargets.length + 1}`,
						searchUrl: "",
						webhookEnabled: false,
						webhookUrl: "",
						payloadMode: "v3",
					};
					onChange({
						...settings,
						searchTargets: [...settings.searchTargets, newTarget],
					});
				}}
			>
				+ Add
			</Button>
		</Box>
	);
}
