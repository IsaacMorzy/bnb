import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { PropertyCard } from "@/components/stays/property-card";
import { SearchPrompt } from "@/components/stays/search-prompt";
import { Badge, Button, Text } from "@/components/ui";
import type { Property } from "@/data/properties";
import { describeQuery } from "@/lib/search/parse";
import { posthog } from "@/lib/posthog";
import { searchProperties } from "@/lib/search/search";
import { motion } from "@/theme";

const MAX_STAGGERED = 6;

export default function Search() {
  const router = useRouter();
  const { q = "" } = useLocalSearchParams<{ q?: string }>();
  const [text, setText] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  const input = useRef<TextInput>(null);

  // A new query from Home replaces whatever was typed here.
  if (q !== shownQ) {
    setShownQ(q);
    setText(q);
  }

  // Opened without a query (search button or tab), the prompt is ready to type.
  useFocusEffect(
    useCallback(() => {
      if (!q) input.current?.focus();
    }, [q]),
  );

  const { query, results } = useMemo(() => searchProperties(q), [q]);
  const constraints = describeQuery(query);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-5 pt-2 pb-8"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <StatusBar style="dark" />
      <SearchPrompt
        ref={input}
        value={text}
        onChangeText={setText}
        onSubmit={(next) => {
          posthog?.capture("search_submitted", { source: "search" });
          router.setParams({ q: next });
        }}
      />

      {results.length > 0 ? (
        <>
          <Text variant="caption" tone="muted" className="mt-4" accessibilityLiveRegion="polite">
            {results.length === 1 ? "1 stay" : `${results.length} stays`}
            {q ? " ranked for you" : " by rating"}
          </Text>
          {/* Keyed by query, so every new search replays the entrance. */}
          <View key={q} className="mt-4 gap-5">
            {results.map((property, index) => (
              <ResultCard key={property.id} property={property} index={index} />
            ))}
          </View>
        </>
      ) : (
        <View className="mt-10 items-center gap-4 px-4">
          <Text variant="title" className="text-center">
            No stays match that yet
          </Text>
          {constraints.length > 0 && (
            <>
              <Text tone="muted" className="text-center">
                Every stay has to meet these:
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {constraints.map((label) => (
                  <Badge key={label} label={label} tone="info" />
                ))}
              </View>
            </>
          )}
          <Button title="Clear search" variant="secondary" size="sm" onPress={() => router.setParams({ q: "" })} />
        </View>
      )}
    </ScrollView>
  );
}

// Results the guest asked for and is waiting on rise in, 40 ms apart. Rows past
// the sixth come in together so a long list never feels slow.
function ResultCard({ property, index }: { property: Property; index: number }) {
  const entering = useMemo(
    () =>
      FadeInDown.duration(motion.base)
        .delay(Math.min(index, MAX_STAGGERED) * motion.stagger)
        .easing(motion.easeOut)
        .reduceMotion(ReduceMotion.System),
    [index],
  );
  return (
    <Animated.View entering={entering}>
      <PropertyCard property={property} />
    </Animated.View>
  );
}
