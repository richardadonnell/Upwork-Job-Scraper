import { Badge, Box, Card, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import type { Job, Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly jobs: Job[];
}

export function DashboardPage({ settings, jobs }: Props) {
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const isActive = settings.masterEnabled;
  const targetCount = settings.searchTargets.filter(t => t.searchUrl.trim()).length;
  const webhookCount = settings.searchTargets.filter(t => t.webhookEnabled && t.webhookUrl.trim()).length;

  const freqDisplay = `${settings.minuteInterval}m`;
  const activeDayLabels = settings.activeDays.flatMap((isEnabled, dayIndex) => (isEnabled ? [DAY_LABELS[dayIndex]] : []));
  let activeDaysDisplay = activeDayLabels.join(", ");
  if (activeDayLabels.length === 7) {
    activeDaysDisplay = "Every day";
  } else if (activeDayLabels.length === 0) {
    activeDaysDisplay = "No days";
  }
  const scheduleSummary = `${activeDaysDisplay} · ${settings.timeWindow.start}-${settings.timeWindow.end}`;

  return (
    <Box className="page-shell">
      <Heading className="page-title" size="5">Overview</Heading>
      <Text className="page-subtitle" size="2" color="gray" as="p">Extension status and activity at a glance.</Text>

      <Separator className="page-divider" size="4" />

      <Grid columns="2" gap="4" mb="5">
        <Card className="surface-card">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Status</Text>
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? "var(--accent-9)" : "var(--gray-6)",
                  boxShadow: isActive ? "0 0 6px var(--accent-9)" : "none",
                  flexShrink: 0,
                }}
              />
              <Text size="4" weight="bold">{isActive ? "Active" : "Paused"}</Text>
            </Flex>
          </Flex>
        </Card>

        <Card className="surface-card">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Jobs in History</Text>
            <Text size="4" weight="bold">{jobs.length}</Text>
          </Flex>
        </Card>

        <Card className="surface-card">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Search Targets</Text>
            <Text size="4" weight="bold">{targetCount}</Text>
          </Flex>
        </Card>

        <Card className="surface-card">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Check Frequency</Text>
            <Text size="4" weight="bold">{freqDisplay}</Text>
            <Text size="1" color="gray">{scheduleSummary}</Text>
          </Flex>
        </Card>
      </Grid>

      {settings.lastRunAt && (
        <Card className="surface-card">
          <Flex align="center" justify="between" gap="3">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray" weight="medium">Last Run</Text>
              <Text size="2">{new Date(settings.lastRunAt).toLocaleString()}</Text>
            </Flex>
            {(() => {
              const s = settings.lastRunStatus;
              let badgeColor: "green" | "amber" | "red" = "red";
              if (s === "success") badgeColor = "green";
              else if (s === "logged_out" || s === "captcha_required") badgeColor = "amber";
              const statusLabel = s === "captcha_required" ? "captcha required" : s;
              return (
                <Badge color={badgeColor} variant="soft" size="2">
                  {statusLabel}
                </Badge>
              );
            })()}
          </Flex>
        </Card>
      )}

      {webhookCount > 0 && (
        <Box mt="4">
          <Card className="surface-card">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray" weight="medium">Webhook Delivery</Text>
              <Text size="2">{webhookCount} active webhook{webhookCount !== 1 ? "s" : ""} configured</Text>
            </Flex>
          </Card>
        </Box>
      )}
    </Box>
  );
}
