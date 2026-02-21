import { Box, Card, Flex, Heading, Separator, Switch, Text } from "@radix-ui/themes";

import type { Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly onChange: (s: Settings) => void;
}

export function DeliveryPage({ settings, onChange }: Props) {
  return (
    <Box p="6">
      <Heading size="5" mb="1">Delivery</Heading>
      <Text size="2" color="gray" mb="5" as="p">
        Configure how you are notified when new jobs are found.
      </Text>

      <Separator size="4" mb="5" />

      <Card>
        <Flex justify="between" align="start" gap="3">
          <Box>
            <Text size="2" weight="medium">Browser notifications</Text>
            <Text size="1" color="gray" as="p" mt="0">
              Show a desktop notification when new jobs are found
            </Text>
          </Box>
          <Switch
            size="2"
            checked={settings.notificationsEnabled}
            onCheckedChange={(v) => onChange({ ...settings, notificationsEnabled: v })}
          />
        </Flex>
      </Card>
    </Box>
  );
}
