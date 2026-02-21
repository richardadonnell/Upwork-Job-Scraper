import {
	CaretDownIcon,
	CaretSortIcon,
	CaretUpIcon,
} from "@radix-ui/react-icons";
import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Separator,
	Spinner,
	Table,
	Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { jobHistoryStorage, seenJobIdsStorage } from "../utils/storage";

import type { Job } from "../utils/types";

type SortCol =
	| "title"
	| "jobType"
	| "budget"
	| "experienceLevel"
	| "proposals"
	| "datePosted";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortCol; label: string }[] = [
	{ key: "title", label: "Title" },
	{ key: "jobType", label: "Type" },
	{ key: "budget", label: "Budget" },
	{ key: "experienceLevel", label: "Experience" },
	{ key: "proposals", label: "Proposals" },
	{ key: "datePosted", label: "Posted" },
];

function SortIcon({
	col,
	sortCol,
	sortDir,
}: {
	col: SortCol;
	sortCol: SortCol;
	sortDir: SortDir;
}) {
	if (col !== sortCol) return <CaretSortIcon style={{ opacity: 0.4 }} />;
	return sortDir === "asc" ? <CaretUpIcon /> : <CaretDownIcon />;
}

function sortJobs(jobs: Job[], col: SortCol, dir: SortDir): Job[] {
	return [...jobs].sort((a, b) => {
		const av = a[col] ?? "";
		const bv = b[col] ?? "";
		const cmp = av.localeCompare(bv, undefined, { numeric: true });
		return dir === "asc" ? cmp : -cmp;
	});
}

export function JobHistoryTab() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortCol, setSortCol] = useState<SortCol>("datePosted");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	useEffect(() => {
		jobHistoryStorage.getValue().then((j) => {
			setJobs(j);
			setLoading(false);
		});
		const unwatch = jobHistoryStorage.watch((j) => setJobs(j));
		return () => unwatch();
	}, []);

	async function handleClear() {
		await Promise.all([
			jobHistoryStorage.setValue([]),
			seenJobIdsStorage.setValue([]),
		]);
		setJobs([]);
	}

	function handleSort(col: SortCol) {
		if (col === sortCol) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortCol(col);
			setSortDir("asc");
		}
	}

	if (loading) {
		return (
			<Box p="6">
				<Flex align="center" gap="2">
					<Spinner size="2" />
					<Text size="2" color="gray">
						Loading history...
					</Text>
				</Flex>
			</Box>
		);
	}

	const plural = jobs.length === 1 ? "" : "s";
	const historyLabel =
		jobs.length === 0
			? "No jobs scraped yet."
			: `${jobs.length} job${plural} in history`;

	const sorted = sortJobs(jobs, sortCol, sortDir);

	return (
		<Box p="6">
			<Flex justify="between" align="start" mb="1">
				<Heading size="5">Job History</Heading>
				{jobs.length > 0 && (
					<Button size="2" variant="ghost" color="red" onClick={handleClear}>
						Clear history
					</Button>
				)}
			</Flex>
			<Text size="2" color="gray" mb="5" as="p">
				{historyLabel}
			</Text>

			<Separator size="4" mb="5" />

			{jobs.length === 0 ? (
				<Box py="9" style={{ textAlign: "center" }}>
					<Text size="2" color="gray">
						Run a scrape to populate job history.
					</Text>
				</Box>
			) : (
				<Table.Root variant="surface" size="2">
					<Table.Header>
						<Table.Row>
							{COLUMNS.map(({ key, label }) => (
								<Table.ColumnHeaderCell key={key}>
									<Flex
										align="center"
										gap="1"
										onClick={() => handleSort(key)}
										style={{
											cursor: "pointer",
											userSelect: "none",
											whiteSpace: "nowrap",
										}}
									>
										{label}
										<SortIcon col={key} sortCol={sortCol} sortDir={sortDir} />
									</Flex>
								</Table.ColumnHeaderCell>
							))}
							<Table.ColumnHeaderCell>Skills</Table.ColumnHeaderCell>
							<Table.ColumnHeaderCell>Client</Table.ColumnHeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{sorted.map((job) => (
							<Table.Row key={job.uid} align="start">
								<Table.Cell style={{ maxWidth: 260 }}>
									<Link
										href={job.url}
										target="_blank"
										rel="noreferrer"
										size="2"
										weight="medium"
									>
										{job.title}
									</Link>
								</Table.Cell>

								<Table.Cell>
									<Text size="1" color="gray">
										{job.jobType || "—"}
									</Text>
								</Table.Cell>

								<Table.Cell>
									<Text size="1" color="gray">
										{job.budget || "—"}
									</Text>
								</Table.Cell>

								<Table.Cell>
									<Text size="1" color="gray">
										{job.experienceLevel || "—"}
									</Text>
								</Table.Cell>

								<Table.Cell>
									<Text size="1" color="gray">
										{job.proposals || "—"}
									</Text>
								</Table.Cell>

								<Table.Cell>
									<Text size="1" color="gray" style={{ whiteSpace: "nowrap" }}>
										{job.datePosted}
									</Text>
								</Table.Cell>

								<Table.Cell style={{ maxWidth: 200 }}>
									{job.skills.length > 0 ? (
										<Flex gap="1" wrap="wrap">
											{job.skills.slice(0, 4).map((skill) => (
												<Badge
													key={skill}
													variant="soft"
													color="green"
													size="1"
												>
													{skill}
												</Badge>
											))}
											{job.skills.length > 4 && (
												<Badge variant="surface" color="gray" size="1">
													+{job.skills.length - 4}
												</Badge>
											)}
										</Flex>
									) : (
										<Text size="1" color="gray">
											—
										</Text>
									)}
								</Table.Cell>

								<Table.Cell>
									<Flex direction="column" gap="1">
										{job.paymentVerified && (
											<Badge variant="soft" color="green" size="1">
												verified
											</Badge>
										)}
										{job.clientRating && (
											<Text size="1" color="gray">
												★ {job.clientRating}
											</Text>
										)}
										{job.clientTotalSpent && (
											<Text size="1" color="gray">
												{job.clientTotalSpent} spent
											</Text>
										)}
									</Flex>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			)}
		</Box>
	);
}
