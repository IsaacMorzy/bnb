import { Link, useRouter, type Href } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Text } from "@/components/ui";

// Stand-in for the auth screens until Clerk is set up.
export function AuthStub({ title, switchLabel, switchHref }: { title: string; switchLabel: string; switchHref: Href }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 gap-6 bg-surface px-6" style={{ paddingTop: insets.top + 8 }}>
      {router.canGoBack() && (
        <IconButton icon="arrowLeft" size="sm" accessibilityLabel="Back" onPress={() => router.back()} />
      )}
      <View className="gap-2">
        <Text variant="heading">{title}</Text>
        <Text tone="muted">Sign-in with Clerk is coming next.</Text>
      </View>
      <Link href={switchHref} replace>
        <Text variant="label" tone="accent">
          {switchLabel}
        </Text>
      </Link>
    </View>
  );
}
