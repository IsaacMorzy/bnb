import { useAuth, useUser } from "@clerk/expo";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";

// Stand-in landing screen until home is designed. Signing out flips the root
// layout's guard, which drops this screen and lands the guest on onboarding.
export default function Home() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);

  const leave = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 gap-6 bg-surface px-6" style={{ paddingTop: insets.top + 24 }}>
      <View className="gap-2">
        <Text variant="heading">You&apos;re signed in</Text>
        <Text tone="muted">{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>
      <Button title="Sign out" variant="secondary" loading={signingOut} onPress={leave} />
    </View>
  );
}
