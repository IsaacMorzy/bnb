import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { SuperhostLine } from "@/components/stay/host-row";
import { Avatar, Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { hostFacts } from "@/lib/stay-details";

// The host behind a stay, from their Sanity profile.
export default function HostSheet() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stay } = useStay(slug);
  const host = stay?.host;

  if (!host) {
    return (
      <View className="flex-1 bg-surface px-8 py-12">
        <Text tone="muted" className="text-center">
          {stay === undefined ? "Loading host…" : "No host details for this stay."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 px-5 pt-8 pb-10">
      <View className="flex-row items-center gap-4">
        <Avatar imageUrl={host.photoUrl} name={host.name} size="lg" />
        <View className="flex-1">
          <Text variant="title" accessibilityRole="header">
            {host.name}
          </Text>
          {host.isSuperhost ? <SuperhostLine /> : null}
        </View>
      </View>
      {host.bio ? <Text>{host.bio}</Text> : null}
      <View className="gap-1.5">
        {hostFacts(host).map((fact) => (
          <Text key={fact} variant="label" tone="muted">
            {fact}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}
