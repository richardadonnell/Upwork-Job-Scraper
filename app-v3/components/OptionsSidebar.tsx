import {
	ActivityLogIcon,
	ArchiveIcon,
	BellIcon,
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DashboardIcon,
	MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import {
	Badge,
	Box,
	Button,
	Flex,
	IconButton,
	Separator,
	Spinner,
	Text,
} from "@radix-ui/themes";

import type { ComponentType } from "react";

export type Page =
	| "dashboard"
	| "search-targets"
	| "schedule"
	| "delivery"
	| "history"
	| "activity";

type SaveState = "idle" | "saved" | "error";

type OptionsSidebarProps = {
	activePage: Page;
	onActivePageChange: (page: Page) => void;
	isCollapsed: boolean;
	onToggleCollapsed: () => void;
	nextRunDisplay: { primary: string; primaryColor: "green" | "gray"; secondary?: string };
	masterEnabled: boolean;
	onToggleMasterEnabled: () => void;
	scraping: boolean;
	canRunScrape: boolean;
	onRunScrape: () => void;
	extensionVersion: string;
	isSettingsPage: boolean;
	saveState: SaveState;
	saving: boolean;
	autoSaveColor: "red" | "gray" | "green" | "grass";
	autoSaveLabel: string;
};

type NavItem = {
	id: Page;
	label: string;
	icon: ComponentType<{ width?: string | number; height?: string | number }>;
};

type SidebarNavItemProps = {
	item: NavItem;
	isCollapsed: boolean;
	isActive: boolean;
	onSelect: (page: Page) => void;
};

type SidebarHeaderProps = {
	isCollapsed: boolean;
	onToggleCollapsed: () => void;
};

type SidebarControlsProps = {
	nextRunDisplay: { primary: string; primaryColor: "green" | "gray"; secondary?: string };
	masterEnabled: boolean;
	onToggleMasterEnabled: () => void;
	scraping: boolean;
	canRunScrape: boolean;
	onRunScrape: () => void;
};

const NAV_ITEMS: NavItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: DashboardIcon },
	{ id: "search-targets", label: "Search + Webhook URLs", icon: MagnifyingGlassIcon },
	{ id: "schedule", label: "Scrape Schedule", icon: CalendarIcon },
	{ id: "delivery", label: "Browser Notifications", icon: BellIcon },
	{ id: "history", label: "Scraped Jobs", icon: ArchiveIcon },
	{ id: "activity", label: "Activity Logs", icon: ActivityLogIcon },
];

function SidebarNavItem(props: Readonly<SidebarNavItemProps>) {
	const { item, isCollapsed, isActive, onSelect } = props;
	const ItemIcon = item.icon;

	return (
		<Box
			className={`app-nav-item ${isActive ? "app-nav-item--active" : ""} ${
				isCollapsed ? "app-nav-item--collapsed" : ""
			}`}
			onClick={() => onSelect(item.id)}
			title={isCollapsed ? item.label : undefined}
			aria-current={isActive ? "page" : undefined}
		>
			<Flex
				className="app-nav-item-content"
				align="center"
				justify={isCollapsed ? "center" : "start"}
				gap={isCollapsed ? "0" : "2"}
			>
				<Box className="app-nav-item-icon" aria-hidden="true">
					<ItemIcon width={16} height={16} />
				</Box>
				{!isCollapsed && (
					<Text
						className="app-nav-item-label"
						size="1"
						weight={isActive ? "medium" : "regular"}
						color={isActive ? "green" : undefined}
					>
						{item.label}
					</Text>
				)}
			</Flex>
		</Box>
	);
}

function SidebarHeader(props: Readonly<SidebarHeaderProps>) {
	const { isCollapsed, onToggleCollapsed } = props;
	const ToggleIcon = isCollapsed ? ChevronRightIcon : ChevronLeftIcon;

	return (
		<Box
			className={`app-sidebar-header ${
				isCollapsed ? "app-sidebar-header--collapsed" : ""
			}`}
			px={isCollapsed ? "2" : "4"}
			pt="4"
			pb={isCollapsed ? "3" : "4"}
		>
			<Flex
				justify={isCollapsed ? "center" : "between"}
				align={isCollapsed ? "center" : "start"}
				direction={isCollapsed ? "column" : "row"}
				gap={isCollapsed ? "1" : "2"}
			>
				<img
					className="app-sidebar-brand"
					src="/logo.svg"
					alt="Upwork Job Scraper logo"
					width={isCollapsed ? 28 : 48}
					height={isCollapsed ? 28 : 48}
				/>
				<IconButton
					className="app-sidebar-toggle"
					size={isCollapsed ? "1" : "2"}
					variant="soft"
					color="gray"
					onClick={onToggleCollapsed}
					highContrast
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<ToggleIcon width="14" height="14" />
				</IconButton>
			</Flex>
			{!isCollapsed && (
				<Text
					className="app-sidebar-title"
					size="3"
					weight="bold"
					as="p"
					mt="2"
					mb="0"
				>
					Upwork Job Scraper + Webhook Extension
				</Text>
			)}
		</Box>
	);
}

function SidebarControls(props: Readonly<SidebarControlsProps>) {
	const {
		nextRunDisplay,
		masterEnabled,
		onToggleMasterEnabled,
		scraping,
		canRunScrape,
		onRunScrape,
	} = props;

	return (
		<>
			<Box className="app-sidebar-controls" px="4" py="3">
				<Flex direction="column" gap="2" className="app-sidebar-controls-stack">
					<Box
						className="app-sidebar-next-run-card"
						style={{
							padding: "8px 10px",
							border: "1px solid var(--gray-4)",
							borderRadius: "var(--radius-2)",
							background:
								"color-mix(in srgb, var(--gray-2) 70%, transparent)",
						}}
					>
						<Text size="1" color="gray" as="p" m="0">
							Next scraper run
						</Text>
						<Text
							size="2"
							weight="medium"
							color={nextRunDisplay.primaryColor}
							as="p"
							m="0"
							mt="1"
						>
							{nextRunDisplay.primary}
						</Text>
						{nextRunDisplay.secondary && (
							<Text size="1" color="gray" as="p" m="0" mt="1">
								{nextRunDisplay.secondary}
							</Text>
						)}
					</Box>

					<Button
						size="2"
						variant="soft"
						color={masterEnabled ? "green" : "gray"}
						onClick={onToggleMasterEnabled}
						style={{ width: "100%" }}
					>
						{masterEnabled ? "Scraper Enabled" : "Scraper Disabled"}
					</Button>
					<Button
						size="2"
						variant="soft"
						color="gray"
						disabled={scraping || !canRunScrape}
						onClick={onRunScrape}
						style={{ width: "100%" }}
					>
						{scraping ? (
							<Flex align="center" gap="1">
								<Spinner size="1" />
								<Text>Scraping...</Text>
							</Flex>
						) : (
							"Run scrape now"
						)}
					</Button>
				</Flex>
			</Box>
			<Separator size="4" />
		</>
	);
}

export function OptionsSidebar(props: Readonly<OptionsSidebarProps>) {
	const {
		activePage,
		onActivePageChange,
		isCollapsed,
		onToggleCollapsed,
		nextRunDisplay,
		masterEnabled,
		onToggleMasterEnabled,
		scraping,
		canRunScrape,
		onRunScrape,
		extensionVersion,
		isSettingsPage,
		saveState,
		saving,
		autoSaveColor,
		autoSaveLabel,
	} = props;

	return (
		<Box className="app-sidebar">
			<SidebarHeader
				isCollapsed={isCollapsed}
				onToggleCollapsed={onToggleCollapsed}
			/>

			<Separator size="4" />

			{!isCollapsed && (
				<SidebarControls
					nextRunDisplay={nextRunDisplay}
					masterEnabled={masterEnabled}
					onToggleMasterEnabled={onToggleMasterEnabled}
					scraping={scraping}
					canRunScrape={canRunScrape}
					onRunScrape={onRunScrape}
				/>
			)}

			<Box className="app-nav">
				{NAV_ITEMS.map((item) => (
					<SidebarNavItem
						key={item.id}
						item={item}
						isCollapsed={isCollapsed}
						isActive={activePage === item.id}
						onSelect={onActivePageChange}
					/>
				))}
			</Box>

			{!isCollapsed && (
				<Box className="app-sidebar-footer" px="4" py="4">
					<Flex justify="center" mb="3">
						<Badge variant="soft" color="grass">
							{extensionVersion}
						</Badge>
					</Flex>

					{isSettingsPage && (
						<Flex direction="column" gap="2">
							<Button
								size="2"
								variant={saveState === "saved" ? "solid" : "soft"}
								color={autoSaveColor}
								disabled
								style={{ width: "100%" }}
							>
								{saving ? (
									<Flex align="center" gap="1">
										<Spinner size="1" />
										<Text>{autoSaveLabel}</Text>
									</Flex>
								) : (
									autoSaveLabel
								)}
							</Button>
						</Flex>
					)}
				</Box>
			)}
		</Box>
	);
}
