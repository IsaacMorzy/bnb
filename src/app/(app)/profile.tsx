import { useAuth, useUser } from "@clerk/expo";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Avatar, Button, Text } from "@/components/ui";
import { posthog } from "@/lib/posthog";

// Placeholder until profile is designed. Signing out flips the root layout's
// guard, which drops the tabs and lands the guest on onboarding.
export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [signingOut, setSigningOut] = useState(false);

  const leave = async () => {
    setSigningOut(true);
    try {
      posthog?.capture("signed_out");
      // Clerk reloads the page on web sign-out, dropping in-memory events, so
      // send them first. Capped so PostHog never holds up signing out.
      await Promise.race([
        posthog?.flush().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="gap-8 px-5 pt-6 pb-8"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="items-center gap-3">
        <Avatar imageUrl={user?.hasImage ? user.imageUrl : null} name={user?.firstName} />
        <View className="items-center gap-1">
          <Text variant="heading">{user?.fullName || "Your profile"}</Text>
          <Text tone="muted">{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>
      <Button title="Sign out" variant="secondary" loading={signingOut} onPress={leave} />
    </ScrollView>
  );
}
