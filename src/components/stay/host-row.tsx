import { View } from "react-native";

import { Avatar, Icon, PressableScale, Text } from "@/components/ui";
import { firstName } from "@/lib/stay-details";
import type { StayHost } from "@/lib/stays";

export function SuperhostLine() {
  return (
    <View className="mt-0.5 flex-row items-center gap-1.5">
      <Icon name="rosette" size={16} tone="subtle" />
      <Text variant="label" tone="subtle">
        Superhost
      </Text>
    </View>
  );
}

export function HostRow({ host, onPress }: { host: StayHost; onPress: () => void }) {
  const name = firstName(host.name);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Hosted by ${name}${host.isSuperhost ? ", Superhost" : ""}`}
      accessibilityHint="Shows more about the host"
      onPress={onPress}
      className="flex-row items-center gap-4 py-2"
    >
      <Avatar imageUrl={host.photoUrl} name={host.name} size="md" className="border-2 border-surface shadow-raised" />
      <View className="flex-1">
        <Text variant="subtitle">Hosted by {name}</Text>
        {host.isSuperhost ? <SuperhostLine /> : null}
      </View>
      <Icon name="chevronRight" size={22} />
    </PressableScale>
  );
}
