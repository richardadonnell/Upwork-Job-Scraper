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
			<div
				style={{
					display: "flex",
					gap: 8,
					alignItems: "center",
					padding: "40px 0",
				}}
			>
				<div
					style={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: "var(--accent)",
						animation: "pulse 1s ease-in-out infinite",
					}}
				/>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 12,
						color: "var(--text-mid)",
					}}
				>
					loading history...
				</span>
			</div>
		);
	}

	const jobWord = jobs.length === 1 ? "job" : "jobs";
	const historyLabel =
		jobs.length === 0
			? "> no jobs scraped yet"
			: `> ${jobs.length} ${jobWord} in history`;

	return (
		<div>
			{/* Header bar */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 20,
				}}
			>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 12,
						color: "var(--text-mid)",
					}}
				>
					{historyLabel}
				</span>
				{jobs.length > 0 && (
					<button
						type="button"
						onClick={handleClear}
						style={{
							padding: "5px 12px",
							background: "transparent",
							color: "var(--danger)",
							border: "1px solid var(--danger)",
							borderRadius: 5,
							cursor: "pointer",
							fontSize: 11,
							fontFamily: "var(--mono)",
							letterSpacing: "0.04em",
							transition: "background 0.2s, color 0.2s",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLButtonElement).style.background =
								"var(--danger-dim)";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.background =
								"transparent";
						}}
					>
						clear history
					</button>
				)}
			</div>

			{jobs.length === 0 && (
				<div
					style={{
						textAlign: "center",
						padding: "60px 0",
						color: "var(--text-muted)",
						fontFamily: "var(--mono)",
					}}
				>
					<div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>
						[ ]
					</div>
					<p style={{ margin: 0, fontSize: 12, letterSpacing: "0.05em" }}>
						run a scrape to populate job history
					</p>
				</div>
			)}

			{jobs.map((job) => (
				<div
					key={job.uid}
					style={{
						border: "1px solid var(--border)",
						borderRadius: 8,
						padding: "18px 20px",
						marginBottom: 10,
						background: "var(--surface)",
					}}
				>
					{/* Title row */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							gap: 12,
						}}
					>
						<a
							href={job.url}
							target="_blank"
							rel="noreferrer"
							style={{
								color: "var(--accent)",
								fontWeight: 600,
								fontSize: 14,
								textDecoration: "none",
								lineHeight: 1.4,
								fontFamily: "var(--mono)",
							}}
						>
							{job.title}
						</a>
						<span
							style={{
								fontSize: 11,
								color: "var(--text-muted)",
								whiteSpace: "nowrap",
								fontFamily: "var(--mono)",
								letterSpacing: "0.03em",
							}}
						>
							{job.datePosted}
						</span>
					</div>

					{/* Meta chips */}
					{(job.jobType || job.budget || job.experienceLevel) && (
						<div
							style={{
								marginTop: 8,
								display: "flex",
								gap: 6,
								flexWrap: "wrap",
							}}
						>
							{[job.jobType, job.budget, job.experienceLevel]
								.filter(Boolean)
								.map((val) => (
									<span
										key={val}
										style={{
											padding: "2px 8px",
											background: "var(--surface-raised)",
											border: "1px solid var(--border)",
											borderRadius: 4,
											fontSize: 11,
											color: "var(--text-mid)",
											fontFamily: "var(--mono)",
										}}
									>
										{val}
									</span>
								))}
						</div>
					)}

					{/* Description */}
					{job.description && (
						<p
							style={{
								margin: "10px 0 0",
								fontSize: 12,
								color: "var(--text-mid)",
								lineHeight: 1.6,
								letterSpacing: "0.01em",
							}}
						>
							{job.description.length > 200
								? `${job.description.slice(0, 200)}…`
								: job.description}
						</p>
					)}

					{/* Skills */}
					{job.skills.length > 0 && (
						<div
							style={{
								marginTop: 10,
								display: "flex",
								flexWrap: "wrap",
								gap: 5,
							}}
						>
							{job.skills.map((skill) => (
								<span
									key={skill}
									style={{
										padding: "2px 8px",
										background: "rgba(20,168,0,0.06)",
										border: "1px solid var(--accent-dim)",
										borderRadius: 4,
										fontSize: 11,
										color: "var(--accent)",
										fontFamily: "var(--mono)",
									}}
								>
									{skill}
								</span>
							))}
						</div>
					)}

					{/* Client metadata */}
					<div
						style={{
							marginTop: 10,
							fontSize: 11,
							color: "var(--text-muted)",
							display: "flex",
							gap: 14,
							fontFamily: "var(--mono)",
						}}
					>
						{job.paymentVerified && (
							<span style={{ color: "var(--accent)" }}>✓ verified</span>
						)}
						{job.clientRating && <span>★ {job.clientRating}</span>}
						{job.clientTotalSpent && <span>{job.clientTotalSpent} spent</span>}
						{job.proposals && <span>{job.proposals} proposals</span>}
					</div>
				</div>
			))}
		</div>
	);
}
