import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { ResultCard, ResultCardSkeleton } from "@/components/search/result-card";
import { SearchBar } from "@/components/search/search-bar";
import { SearchChips } from "@/components/search/search-chips";
import { SortMenu } from "@/components/search/sort-menu";
import { Badge, Button, IconButton, Text } from "@/components/ui";
import { useSearchStays } from "@/hooks/use-search-stays";
import { posthog } from "@/lib/posthog";
import type { SearchIntent } from "@/lib/search/intent";
import {
  askedFor,
  chipsFor,
  describeIntent,
  hasChip,
  stayTags,
  toggleChip,
  type SortOption,
  type StayTag,
} from "@/lib/search/query";
import type { SearchStay } from "@/lib/stays";
import { motion } from "@/theme";

const MAX_STAGGERED = 6;

export default function Search() {
  const router = useRouter();
  const { q = "" } = useLocalSearchParams<{ q?: string }>();
  const [text, setText] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  // How the server read the submitted sentence. Chip toggles refine it until
  // the next sentence; sort and toggles send it back, so Jev reads it once.
  const [interpreted, setInterpreted] = useState<SearchIntent | null>(null);
  const [edited, setEdited] = useState<SearchIntent | null>(null);
  const [sort, setSort] = useState<SortOption>("best");
  const input = useRef<TextInput>(null);

  // A new query from Home replaces whatever was typed and toggled here.
  if (q !== shownQ) {
    setShownQ(q);
    setText(q);
    setInterpreted(null);
    setEdited(null);
  }

  // Opened without a query (search button or tab), the bar is ready to type.
  useFocusEffect(
    useCallback(() => {
      if (!q) input.current?.focus();
    }, [q]),
  );

  const base = edited ?? interpreted;
  const { result, error, retry } = useSearchStays(base ? { intent: base } : { q }, sort);
  if (!interpreted && result?.key === JSON.stringify([{ q }, sort])) setInterpreted(result.intent);
  // Until the new sentence is read, the results on screen keep their own reading.
  const query = base ?? result?.intent;
  const chips = useMemo(() => (interpreted ? chipsFor(interpreted) : []), [interpreted]);
  const described = query ? describeIntent(query) : [];

  const clear = () => {
    setEdited(null);
    setText("");
    router.setParams({ q: "" });
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-4 pt-2 pb-8"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <StatusBar style="dark" />
      <View className="flex-row items-center gap-3">
        <IconButton icon="chevronLeft" size="bar" accessibilityLabel="Back to Home" onPress={() => router.navigate("/home")} />
        <SearchBar
          ref={input}
          value={text}
          onChangeText={setText}
          onSubmit={(next) => {
            posthog?.capture("search_submitted", { source: "search" });
            setEdited(null);
            router.setParams({ q: next });
          }}
          className="flex-1"
        />
      </View>

      {query && chips.length > 0 && (
        <View className="mt-3">
          <SearchChips
            chips={chips}
            isSelected={(chip) => hasChip(query, chip)}
            onToggle={(chip, on) => {
              posthog?.capture("search_chip_toggled", { chip: chip.kind, on });
              setEdited(toggleChip(query, chip, on));
            }}
          />
        </View>
      )}

      {result && query ? (
        result.total > 0 ? (
          <>
            <View className="mt-5 flex-row items-center justify-between">
              <Text variant="lead" accessibilityLiveRegion="polite">
                {result.total === 1 ? "1 stay" : `${result.total} stays`}
              </Text>
              <SortMenu
                value={sort}
                onChange={(next) => {
                  posthog?.capture("search_sorted", { sort: next });
                  setSort(next);
                }}
              />
            </View>
            {/* Keyed by request, so every new search, toggle or sort replays the entrance. */}
            <View key={result.key} className="mt-4 gap-4">
              {result.stays.map((stay, index) => (
                <StaggeredResult key={stay.id} stay={stay} tags={stayTags(stay, askedFor(query))} index={index} />
              ))}
            </View>
          </>
        ) : (
          <View className="mt-10 items-center gap-4 px-4" accessibilityLiveRegion="polite">
            <Text variant="title" className="text-center">
              No stays match that yet
            </Text>
            {described.length > 0 && (
              <>
                <Text tone="muted" className="text-center">
                  Every stay has to meet these:
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                  {described.map((label) => (
                    <Badge key={label} label={label} tone="info" />
                  ))}
                </View>
              </>
            )}
            <Button title="Clear search" variant="secondary" size="sm" onPress={clear} />
          </View>
        )
      ) : error ? (
        <View className="mt-10 items-center gap-4 px-4" accessibilityLiveRegion="polite">
          <Text tone="muted" className="text-center">
            We couldn’t load stays. Check your connection and try again.
          </Text>
          <Button title="Try again" variant="secondary" size="sm" onPress={retry} />
        </View>
      ) : (
        <View className="mt-14 gap-4" accessibilityLabel="Loading stays" accessible>
          {[0, 1, 2].map((i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Results the guest asked for and is waiting on rise in, 40 ms apart. Rows past
// the sixth come in together so a long list never feels slow.
function StaggeredResult({ stay, tags, index }: { stay: SearchStay; tags: StayTag[]; index: number }) {
  const router = useRouter();
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
      <ResultCard stay={stay} tags={tags} onPress={() => router.push(`/stay/${stay.slug}`)} />
    </Animated.View>
  );
}
