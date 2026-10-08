import { View } from "react-native";

import { Icon, Text } from "@/components/ui";

// Placeholder until trips are designed and booking exists.
export default function Trips() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-surface px-8">
      <View className="size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon name="calendar" size={28} />
      </View>
      <Text variant="title">No trips yet</Text>
      <Text tone="muted" className="text-center">
        Stays you book will show up here.
      </Text>
    </View>
  );
}
