import {
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Heading,
	Link,
	Separator,
	Spinner,
	Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { jobHistoryStorage, seenJobIdsStorage } from "../utils/storage";

import type { Job } from "../utils/types";

export function JobHistoryTab() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

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
				<Flex direction="column" gap="3">
					{jobs.map((job) => (
						<Card key={job.uid}>
							<Flex justify="between" align="start" gap="3" mb="2">
								<Link
									href={job.url}
									target="_blank"
									rel="noreferrer"
									size="2"
									weight="bold"
								>
									{job.title}
								</Link>
								<Text
									size="1"
									color="gray"
									style={{ whiteSpace: "nowrap", flexShrink: 0 }}
								>
									{job.datePosted}
								</Text>
							</Flex>

							{(job.jobType || job.budget || job.experienceLevel) && (
								<Flex gap="2" mb="2" wrap="wrap">
									{[job.jobType, job.budget, job.experienceLevel]
										.filter(Boolean)
										.map((val) => (
											<Badge key={val} variant="surface" color="gray" size="1">
												{val}
											</Badge>
										))}
								</Flex>
							)}

							{job.description && (
								<Text
									as="p"
									size="1"
									color="gray"
									mb="2"
									style={{ lineHeight: "1.6" }}
								>
									{job.description.length > 200
										? `${job.description.slice(0, 200)}...`
										: job.description}
								</Text>
							)}

							{job.skills.length > 0 && (
								<Flex gap="1" mb="2" wrap="wrap">
									{job.skills.map((skill) => (
										<Badge key={skill} variant="soft" color="green" size="1">
											{skill}
										</Badge>
									))}
								</Flex>
							)}

							<Flex gap="3">
								{job.paymentVerified && (
									<Text size="1" color="green">
										verified
									</Text>
								)}
								{job.clientRating && (
									<Text size="1" color="gray">
										* {job.clientRating}
									</Text>
								)}
								{job.clientTotalSpent && (
									<Text size="1" color="gray">
										{job.clientTotalSpent} spent
									</Text>
								)}
								{job.proposals && (
									<Text size="1" color="gray">
										{job.proposals} proposals
									</Text>
								)}
							</Flex>
						</Card>
					))}
				</Flex>
			)}
		</Box>
	);
}
