import {
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Heading,
	ScrollArea,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { activityLogsStorage } from "../utils/storage";
import type { ActivityLog, ActivityLogLevel } from "../utils/types";

function formatRelative(timestamp: number): string {
	const diff = Math.floor((Date.now() - timestamp) / 1000);
	if (diff < 10) return "just now";
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

function formatAbsolute(timestamp: number): string {
	return new Date(timestamp).toLocaleString();
}

const LEVEL_COLOR: Record<ActivityLogLevel, "green" | "amber" | "red"> = {
	info: "green",
	warn: "amber",
	error: "red",
};

const LEVEL_LABEL: Record<ActivityLogLevel, string> = {
	info: "info",
	warn: "warn",
	error: "error",
};

function LogRow({ log }: Readonly<{ log: ActivityLog }>) {
	const [relativeTime, setRelativeTime] = useState(() =>
		formatRelative(log.timestamp),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setRelativeTime(formatRelative(log.timestamp));
		}, 15_000);
		return () => clearInterval(interval);
	}, [log.timestamp]);

	return (
		<Flex className="activity-row" align="start" gap="3" py="2" px="3">
			{/* Timestamp */}
			<Text
				size="1"
				color="gray"
				style={{ whiteSpace: "nowrap", minWidth: 60, paddingTop: 2 }}
				title={formatAbsolute(log.timestamp)}
			>
				{relativeTime}
			</Text>

			{/* Level badge */}
			<Badge
				color={LEVEL_COLOR[log.level]}
				variant="soft"
				size="1"
				style={{ flexShrink: 0, marginTop: 1 }}
			>
				{LEVEL_LABEL[log.level]}
			</Badge>

			{/* Event + detail */}
			<Box style={{ minWidth: 0 }}>
				<Text size="2" weight="medium">
					{log.event}
				</Text>
				{log.detail && (
					<Text
						size="1"
						color="gray"
						as="p"
						mt="1"
						style={{ overflowWrap: "anywhere" }}
					>
						{log.detail}
					</Text>
				)}
			</Box>
		</Flex>
	);
}

export function ActivityPage() {
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		activityLogsStorage.getValue().then((l) => {
			setLogs(l);
			setLoading(false);
		});
		const unwatch = activityLogsStorage.watch((l) => setLogs(l));
		return () => unwatch();
	}, []);

	async function handleClear() {
		await activityLogsStorage.setValue([]);
	}

	return (
		<Box className="page-shell">
			<Flex align="center" justify="between" mb="1">
				<Heading className="page-title" size="5">
					Activity Logs
				</Heading>
				<Button
					size="1"
					variant="outline"
					color="gray"
					disabled={logs.length === 0}
					onClick={handleClear}
				>
					Clear logs
				</Button>
			</Flex>

			<Text className="page-subtitle" size="2" color="gray" as="p">
				A live record of scrape runs, webhook calls, and errors. Stores up to
				200 entries locally.
			</Text>

			<Separator className="page-divider" size="4" />

			{!loading && logs.length === 0 && (
				<Card className="surface-card">
					<Flex
						direction="column"
						align="center"
						justify="center"
						py="8"
						gap="2"
					>
						<Text size="3" weight="medium" color="gray">
							No activity yet
						</Text>
						<Text size="2" color="gray">
							Logs will appear here after your first scrape run.
						</Text>
					</Flex>
				</Card>
			)}

			{!loading && logs.length > 0 && (
				<Card
					className="surface-card"
					style={{ padding: 0, overflow: "hidden" }}
				>
					<ScrollArea style={{ maxHeight: 560 }}>
						{logs.map((log) => (
							<LogRow key={log.id} log={log} />
						))}
					</ScrollArea>
				</Card>
			)}
		</Box>
	);
}
