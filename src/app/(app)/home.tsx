import { useUser } from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition, ReduceMotion } from "react-native-reanimated";

import { Wordmark } from "@/components/brand/wordmark";
import { CategoryChips, type Category } from "@/components/home/category-chips";
import { PropertyCard } from "@/components/stays/property-card";
import { SearchPrompt } from "@/components/stays/search-prompt";
import { Avatar, Icon, PressableScale, Text } from "@/components/ui";
import { properties } from "@/data/properties";
import { motion } from "@/theme";

// Changing the category fades cards in and out and eases the rest into place.
// Fades survive Reduce Motion, the movement doesn't.
const cardEnter = FadeIn.duration(200).easing(motion.easeOut).reduceMotion(ReduceMotion.Never);
const cardExit = FadeOut.duration(150).easing(motion.easeOut).reduceMotion(ReduceMotion.Never);
const cardLayout = LinearTransition.duration(motion.base).easing(motion.easeInOut).reduceMotion(ReduceMotion.System);

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [category, setCategory] = useState<Category>("all");
  const [prompt, setPrompt] = useState("");

  const stays = useMemo(
    () => (category === "all" ? properties : properties.filter((p) => p.type === category)),
    [category],
  );

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-5 pt-2 pb-8"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <StatusBar style="dark" />

      <View className="flex-row items-start justify-between">
        <View className="pt-4">
          <Wordmark />
        </View>
        <Avatar imageUrl={user?.hasImage ? user.imageUrl : null} name={user?.firstName} />
      </View>

      <Text variant="title" tone="muted" className="mt-3">
        {user?.firstName ? `Hey, ${user.firstName} 👋` : "Hey there 👋"}
      </Text>
      <View className="mt-1 flex-row items-center gap-4">
        <Text variant="jumbo" accessibilityRole="header" className="flex-1">
          {"Find your\nnext stay"}
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={() => router.navigate("/search")}
          className="h-22 w-16 items-center justify-center rounded-xl bg-surface-muted"
        >
          <Icon name="search" size={26} />
        </PressableScale>
      </View>

      <SearchPrompt
        value={prompt}
        onChangeText={setPrompt}
        onSubmit={(q) => router.navigate({ pathname: "/search", params: { q } })}
        className="mt-5"
      />

      <View className="mt-5">
        <CategoryChips value={category} onChange={setCategory} />
      </View>

      {/* Cards are already there on first render; only category changes animate. */}
      <LayoutAnimationConfig skipEntering>
        <View className="mt-7 gap-5">
          {stays.map((property) => (
            <Animated.View key={property.id} entering={cardEnter} exiting={cardExit} layout={cardLayout}>
              <PropertyCard property={property} />
            </Animated.View>
          ))}
        </View>
      </LayoutAnimationConfig>
    </ScrollView>
  );
}
