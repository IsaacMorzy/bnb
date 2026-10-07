import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";

// Stand-in landing screen until home is designed and Clerk holds the session.
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 gap-6 bg-surface px-6" style={{ paddingTop: insets.top + 24 }}>
      <View className="gap-2">
        <Text variant="heading">You&apos;re signed in</Text>
        <Text tone="muted">Auth is mocked until Clerk is set up.</Text>
      </View>
      <Button title="Sign out" variant="secondary" onPress={() => router.replace("/sign-in")} />
    </View>
  );
}
