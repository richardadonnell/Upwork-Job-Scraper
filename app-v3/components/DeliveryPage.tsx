import { Box, Card, Flex, Heading, Separator, Switch, Text } from "@radix-ui/themes";

import type { Settings } from "../utils/types";

interface Props {
  readonly settings: Settings;
  readonly onChange: (s: Settings) => void;
}

export function DeliveryPage({ settings, onChange }: Props) {
  return (
    <Box className="page-shell">
      <Heading className="page-title" size="5">Delivery</Heading>
      <Text className="page-subtitle" size="2" color="gray" as="p">
        Configure how you are notified when new jobs are found.
      </Text>

      <Separator className="page-divider" size="4" />

      <Card className="surface-card">
        <Flex justify="between" align="start" gap="3" wrap="wrap">
          <Box style={{ flex: "1 1 280px", minWidth: 0 }}>
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
