import { Box, Card, Flex, Heading, Separator, Text, TextField } from "@radix-ui/themes";

import type { Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly onChange: (s: Settings) => void;
}

export function SchedulePage({ settings, onChange }: Props) {
  return (
    <Box p="6">
      <Heading size="5" mb="1">Schedule</Heading>
      <Text size="2" color="gray" mb="5" as="p">
        Configure how frequently the extension checks for new jobs.
      </Text>

      <Separator size="4" mb="5" />

      <Card>
        <Text size="2" weight="medium" mb="3" as="p">Check every</Text>
        <Flex gap="3">
          {(["days", "hours", "minutes"] as const).map((unit) => (
            <Box key={unit} flexGrow="1">
              <Text as="label" size="1" weight="medium" color="gray" mb="1" style={{ display: "block", textTransform: "capitalize" }}>
                {unit}
              </Text>
              <TextField.Root
                size="2"
                type="number"
                min={0}
                max={unit === "days" ? 30 : 59}
                value={String(settings.checkFrequency[unit])}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    checkFrequency: {
                      ...settings.checkFrequency,
                      [unit]: Number(e.target.value),
                    },
                  })
                }
              />
            </Box>
          ))}
        </Flex>
        <Text size="1" color="gray" mt="3" as="p">
          Note: Chrome alarms have a minimum interval of 1 minute.
        </Text>
      </Card>
    </Box>
  );
}
