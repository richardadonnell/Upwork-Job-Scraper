import { Box, Button, Card, Flex, Grid, Heading, Separator, Switch, Text, TextField } from "@radix-ui/themes";

import type { Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly onChange: (s: Settings) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function SchedulePage({ settings, onChange }: Props) {

  const setMinuteInterval = (value: number) => {
    const nextValue = Math.max(5, Number.isFinite(value) ? Math.floor(value) : 5);
    onChange({
      ...settings,
      minuteInterval: nextValue,
    });
  };

  const setDay = (index: number, enabled: boolean) => {
    const nextDays = [...settings.activeDays] as Settings["activeDays"];
    nextDays[index] = enabled;
    onChange({
      ...settings,
      activeDays: nextDays,
    });
  };

  const setAllDays = (enabled: boolean) => {
    onChange({
      ...settings,
      activeDays: [enabled, enabled, enabled, enabled, enabled, enabled, enabled],
    });
  };

  const setWeekdays = () => {
    onChange({
      ...settings,
      activeDays: [false, true, true, true, true, true, false],
    });
  };

  const setTimeWindow = (key: "start" | "end", value: string) => {
    onChange({
      ...settings,
      timeWindow: {
        ...settings.timeWindow,
        [key]: value,
      },
    });
  };

  return (
    <Box p="6">
      <Heading size="5" mb="1">Schedule</Heading>
      <Text size="2" color="gray" mb="5" as="p">
        Configure how frequently the extension checks for new jobs.
      </Text>

      <Separator size="4" mb="5" />

      <Card mb="4">
        <Text size="2" weight="medium" mb="3" as="p">Check every</Text>
        <Box style={{ maxWidth: 180 }}>
          <Text as="label" size="1" weight="medium" color="gray" mb="1" style={{ display: "block" }}>
            Minutes
          </Text>
          <TextField.Root
            size="2"
            type="number"
            min={5}
            value={String(settings.minuteInterval)}
            onChange={(e) => setMinuteInterval(Number(e.target.value))}
          />
        </Box>
        <Text size="1" color="gray" mt="3" as="p">
          Minimum interval is 5 minutes.
        </Text>
      </Card>

      <Card mb="4">
        <Text size="2" weight="medium" mb="3" as="p">Days of the week</Text>
        <Grid columns="2" gap="3">
          {DAY_LABELS.map((label, index) => (
            <Flex key={label} align="center" justify="between" gap="2">
              <Text size="2">{label}</Text>
              <Switch
                size="2"
                checked={settings.activeDays[index]}
                onCheckedChange={(checked) => setDay(index, checked)}
              />
            </Flex>
          ))}
        </Grid>
        <Flex gap="2" mt="4" wrap="wrap">
          <Button size="1" variant="outline" color="gray" onClick={() => setAllDays(false)}>
            Clear all days
          </Button>
          <Button size="1" variant="outline" color="gray" onClick={() => setAllDays(true)}>
            Enable all days
          </Button>
          <Button size="1" variant="outline" color="gray" onClick={setWeekdays}>
            Weekdays only
          </Button>
        </Flex>
      </Card>

      <Card>
        <Text size="2" weight="medium" mb="3" as="p">Time range</Text>
        <Flex gap="3" align="end" wrap="wrap">
          <Box style={{ minWidth: 180 }}>
            <Text as="label" size="1" weight="medium" color="gray" mb="1" style={{ display: "block" }}>
              Start time
            </Text>
            <TextField.Root
              size="2"
              type="time"
              value={settings.timeWindow.start}
              onChange={(e) => setTimeWindow("start", e.target.value)}
            />
          </Box>
          <Box style={{ minWidth: 180 }}>
            <Text as="label" size="1" weight="medium" color="gray" mb="1" style={{ display: "block" }}>
              End time
            </Text>
            <TextField.Root
              size="2"
              type="time"
              value={settings.timeWindow.end}
              onChange={(e) => setTimeWindow("end", e.target.value)}
            />
          </Box>
        </Flex>
        <Text size="1" color="gray" mt="3" as="p">
          Uses local time. Start time must be earlier than end time.
        </Text>
      </Card>
    </Box>
  );
}
