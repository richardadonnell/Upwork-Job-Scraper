import { Box, Button, Card, Flex, Heading, Separator, Slider, Text, TextField } from "@radix-ui/themes";

import type { Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly onChange: (s: Settings) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function SchedulePage({ settings, onChange }: Props) {

  const timeStringToMinutes = (value: string): number => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) return 0;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 0;
    }

    const total = (hours * 60) + minutes;
    return Math.min(1439, Math.max(0, total));
  };

  const minutesToTimeString = (totalMinutes: number): string => {
    const clamped = Math.min(1439, Math.max(0, Math.floor(Number.isFinite(totalMinutes) ? totalMinutes : 0)));
    const hours = Math.floor(clamped / 60);
    const minutes = clamped % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const formatTimeLabel = (totalMinutes: number): string => {
    const clamped = Math.min(1439, Math.max(0, Math.floor(Number.isFinite(totalMinutes) ? totalMinutes : 0)));
    const hours24 = Math.floor(clamped / 60);
    const minutes = clamped % 60;
    const suffix = hours24 >= 12 ? "PM" : "AM";
    const hours12 = (hours24 % 12) || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

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

  let startMinutes = timeStringToMinutes(settings.timeWindow.start);
  let endMinutes = timeStringToMinutes(settings.timeWindow.end);
  if (endMinutes <= startMinutes) {
    if (startMinutes >= 1439) {
      startMinutes = 1438;
      endMinutes = 1439;
    } else {
      endMinutes = startMinutes + 1;
    }
  }

  return (
    <Box className="page-shell">
      <Heading className="page-title" size="5">Schedule</Heading>
      <Text className="page-subtitle" size="2" color="gray" as="p">
        Configure how frequently the extension checks for new jobs.
      </Text>

      <Separator className="page-divider" size="4" />

      <Card className="surface-card" mb="4">
        <Text size="2" weight="medium" mb="3" as="p">Run the scraper every ...</Text>
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

      <Card className="surface-card" mb="4">
        <Text size="2" weight="medium" mb="3" as="p">... on these days ...</Text>
        <Flex gap="2" wrap="wrap">
          {DAY_LABELS.map((label, index) => (
            <Button
              key={label}
              size="1"
              variant={settings.activeDays[index] ? "solid" : "outline"}
              color="gray"
              aria-pressed={settings.activeDays[index]}
              onClick={() => setDay(index, !settings.activeDays[index])}
            >
              {label}
            </Button>
          ))}
        </Flex>
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

      <Card className="surface-card">
        <Text size="2" weight="medium" mb="3" as="p">... between these times ...</Text>
        <Flex gap="4" mb="3" wrap="wrap">
          <Text size="1" color="gray" as="p">Start time: {formatTimeLabel(startMinutes)}</Text>
          <Text size="1" color="gray" as="p">End time: {formatTimeLabel(endMinutes)}</Text>
        </Flex>
        <Slider
          min={0}
          max={1439}
          step={1}
          minStepsBetweenThumbs={1}
          value={[startMinutes, endMinutes]}
          onValueChange={(value) => {
            if (value.length !== 2) return;
            const nextStart = Math.min(1438, Math.max(0, Math.floor(value[0])));
            const nextEnd = Math.min(1439, Math.max(nextStart + 1, Math.floor(value[1])));
            onChange({
              ...settings,
              timeWindow: {
                start: minutesToTimeString(nextStart),
                end: minutesToTimeString(nextEnd),
              },
            });
          }}
        />
        <Text size="1" color="gray" mt="3" as="p">
          Uses local time. Drag both handles to set start and end time.
        </Text>
      </Card>
    </Box>
  );
}
