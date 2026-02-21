import { Badge, Box, Card, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import type { Job, Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly jobs: Job[];
}

export function DashboardPage({ settings, jobs }: Props) {
  const isActive = settings.masterEnabled;
  const targetCount = settings.searchTargets.filter(t => t.searchUrl.trim()).length;
  const webhookCount = settings.searchTargets.filter(t => t.webhookEnabled && t.webhookUrl.trim()).length;

  const { days, hours, minutes } = settings.checkFrequency;
  const freqParts: string[] = [];
  if (days > 0) freqParts.push(`${days}d`);
  if (hours > 0) freqParts.push(`${hours}h`);
  if (minutes > 0) freqParts.push(`${minutes}m`);
  const freqDisplay = freqParts.length > 0 ? freqParts.join(" ") : "not set";

  return (
    <Box p="6">
      <Heading size="5" mb="1">Overview</Heading>
      <Text size="2" color="gray" mb="5" as="p">Extension status and activity at a glance.</Text>

      <Separator size="4" mb="5" />

      <Grid columns="2" gap="4" mb="5">
        <Card>
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

        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Jobs in History</Text>
            <Text size="4" weight="bold">{jobs.length}</Text>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Search Targets</Text>
            <Text size="4" weight="bold">{targetCount}</Text>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Check Frequency</Text>
            <Text size="4" weight="bold">{freqDisplay}</Text>
          </Flex>
        </Card>
      </Grid>

      {settings.lastRunAt && (
        <Card>
          <Flex align="center" justify="between" gap="3">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray" weight="medium">Last Run</Text>
              <Text size="2">{new Date(settings.lastRunAt).toLocaleString()}</Text>
            </Flex>
            {(() => {
              const s = settings.lastRunStatus;
              let badgeColor: "green" | "amber" | "red" = "red";
              if (s === "success") badgeColor = "green";
              else if (s === "logged_out") badgeColor = "amber";
              return (
                <Badge color={badgeColor} variant="soft" size="2">
                  {settings.lastRunStatus}
                </Badge>
              );
            })()}
          </Flex>
        </Card>
      )}

      {webhookCount > 0 && (
        <Box mt="4">
          <Card>
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
