import { View } from "react-native";

// Holds the details layout while the stay loads, so nothing jumps when it lands.
export function StaySkeleton() {
  return (
    <View accessible accessibilityLabel="Loading stay">
      <View className="h-87 bg-surface-muted" />
      <View className="-mt-2 gap-4 rounded-t-sm bg-surface px-5 pt-5">
        <View className="h-8 w-4/5 rounded-full bg-surface-muted" />
        <View className="h-8 w-3/5 rounded-full bg-surface-muted" />
        <View className="h-5 w-2/5 rounded-full bg-surface-muted" />
        <View className="mt-4 h-16 rounded-lg bg-surface-muted" />
      </View>
    </View>
  );
}
