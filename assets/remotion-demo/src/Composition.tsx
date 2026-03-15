import { Audio } from "@remotion/media";
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
	AbsoluteFill,
	interpolate,
	staticFile,
	useVideoConfig,
} from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { type PerspectiveStyle, ScreenScene } from "./scenes/ScreenScene";

const T = 18; // transition frames

const screens: {
	image: string;
	title: string;
	subtitle: string;
	perspectiveStyle: PerspectiveStyle;
}[] = [
	{
		image: "1-dashboard.png",
		title: "Dashboard Overview",
		subtitle: "Your command center for job scraping",
		perspectiveStyle: "swingRight",
	},
	{
		image: "2-search-webhook-urls.png",
		title: "Search & Webhook URLs",
		subtitle: "Configure endpoints for real-time delivery",
		perspectiveStyle: "orbitLeft",
	},
	{
		image: "3-scrape-schedule.png",
		title: "Scrape Schedule",
		subtitle: "Set it and forget it — runs on autopilot",
		perspectiveStyle: "tiltUp",
	},
	{
		image: "4-browser-notifications.png",
		title: "Browser Notifications",
		subtitle: "Never miss a new matching job",
		perspectiveStyle: "zoomDepth",
	},
	{
		image: "5-scraped-jobs.png",
		title: "Scraped Jobs",
		subtitle: "All your matches in one place",
		perspectiveStyle: "flipReveal",
	},
	{
		image: "6-activity-logs.png",
		title: "Activity Logs",
		subtitle: "Full transparency into every action",
		perspectiveStyle: "riseRotate",
	},
];

export const MyComposition: React.FC = () => {
	const { durationInFrames, fps } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-[#0a0e17]">
			<Audio
				src={staticFile("bg-music.mp3")}
				trimBefore={13 * fps} // beat at track 17s lands at video 4s (17-4=13)
				volume={(f) =>
					0.5 *
					interpolate(f, [0, 3 * fps], [0, 1], {
						extrapolateLeft: "clamp",
						extrapolateRight: "clamp",
					}) *
					interpolate(f, [30 * fps, durationInFrames], [1, 0], {
						extrapolateLeft: "clamp",
						extrapolateRight: "clamp",
					})
				}
			/>
			<TransitionSeries>
				{/* Intro */}
				<TransitionSeries.Sequence durationInFrames={120}>
					<IntroScene />
				</TransitionSeries.Sequence>

				{/* Screen 1 — fade in */}
				<TransitionSeries.Transition
					presentation={fade()}
					timing={springTiming({
						config: { damping: 200 },
						durationInFrames: T,
					})}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[0]} />
				</TransitionSeries.Sequence>

				{/* Screen 2 — slide from left */}
				<TransitionSeries.Transition
					presentation={slide({ direction: "from-left" })}
					timing={linearTiming({ durationInFrames: T })}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[1]} />
				</TransitionSeries.Sequence>

				{/* Screen 3 — wipe */}
				<TransitionSeries.Transition
					presentation={wipe({ direction: "from-left" })}
					timing={springTiming({
						config: { damping: 200 },
						durationInFrames: T,
					})}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[2]} />
				</TransitionSeries.Sequence>

				{/* Screen 4 — fade */}
				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({ durationInFrames: T })}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[3]} />
				</TransitionSeries.Sequence>

				{/* Screen 5 — flip */}
				<TransitionSeries.Transition
					presentation={flip({ direction: "from-left" })}
					timing={springTiming({
						config: { damping: 200 },
						durationInFrames: T,
					})}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[4]} />
				</TransitionSeries.Sequence>

				{/* Screen 6 — slide from bottom */}
				<TransitionSeries.Transition
					presentation={slide({ direction: "from-bottom" })}
					timing={linearTiming({ durationInFrames: T })}
				/>
				<TransitionSeries.Sequence durationInFrames={150}>
					<ScreenScene {...screens[5]} />
				</TransitionSeries.Sequence>

				{/* Outro — fade */}
				<TransitionSeries.Transition
					presentation={fade()}
					timing={springTiming({
						config: { damping: 200 },
						durationInFrames: T,
					})}
				/>
				<TransitionSeries.Sequence durationInFrames={120}>
					<OutroScene />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
