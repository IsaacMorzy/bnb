import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnswerCard } from "@/components/ask/answer-card";
import { AskInput } from "@/components/ask/ask-input";
import { MessageBubble } from "@/components/ask/message-bubble";
import { TopicChips } from "@/components/ask/topic-chips";
import { Button, IconButton, Text } from "@/components/ui";
import { useStay } from "@/hooks/use-stay";
import { answerFor, matchTopics, NO_ANSWER, TOPICS, type AnswerCard as AnswerCardData, type TopicKey } from "@/lib/ask";
import { posthog } from "@/lib/posthog";
import { motion } from "@/theme";

type Message =
  | { id: number; from: "roam" | "guest"; text: string }
  | { id: number; from: "answer"; cards: AnswerCardData[] };

const WELCOME: Message = {
  id: 0,
  from: "roam",
  text: "Ask about check-in, pets, cancellation and more. Answers come word for word from this stay’s details and Roam’s policies.",
};

const messageEnter = FadeInDown.duration(motion.base).easing(motion.easeOut).reduceMotion(ReduceMotion.System);

// "Ask about this stay": questions in, answer cards out. Every card is the
// stay's own text or Roam's policy text as written, never generated. Topics
// come from keyword matching in code (src/lib/ask.ts) until Jev routes them.
export default function AskScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stay, error, retry } = useStay(slug);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const nextId = useRef(1);
  const list = useRef<ScrollView>(null);

  useEffect(() => {
    posthog?.capture("stay_ask_opened", { slug });
  }, [slug]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/stay/[slug]", params: { slug } }));

  const ask = (question: string, topics: TopicKey[], from: "chip" | "typed") => {
    if (!stay) return;
    Haptics.selectionAsync().catch(() => {});
    const cards = answerFor(stay, topics);
    const id = nextId.current;
    nextId.current += 2;
    setMessages((m) => [...m, { id, from: "guest", text: question }, { id: id + 1, from: "answer", cards }]);
    // Topic keys only: what guests type never leaves the device.
    posthog?.capture("stay_ask_sent", { slug, from, topics, answered: cards[0] !== NO_ANSWER });
  };

  const openPolicies = (section?: string) => {
    posthog?.capture("stay_policies_opened", { slug, from: "ask_answer" });
    router.push({ pathname: "/stay/[slug]/policies", params: section ? { slug, section } : { slug } });
  };

  let body;
  if (!stay) {
    body = (
      <View className="flex-1 items-center justify-center gap-4 px-8" accessibilityLiveRegion="polite">
        <Text tone="muted" className="text-center">
          {stay === null
            ? "This stay isn’t available anymore."
            : error
              ? "We couldn’t load this stay."
              : "Loading this stay…"}
        </Text>
        {stay === null ? (
          <Button title="Back" variant="secondary" size="sm" onPress={back} />
        ) : error ? (
          <Button title="Try again" variant="secondary" size="sm" onPress={retry} />
        ) : null}
      </View>
    );
  } else {
    body = (
      <>
        <ScrollView
          ref={list}
          className="flex-1"
          contentContainerClassName="gap-4 px-5 py-5"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <Animated.View
              key={message.id}
              entering={message.id === 0 ? undefined : messageEnter}
              className={message.from === "answer" ? "gap-2.5" : undefined}
              accessibilityLiveRegion={message.from === "answer" ? "polite" : undefined}
            >
              {message.from === "answer" ? (
                message.cards.map((card) => <AnswerCard key={card.key} card={card} onOpenPolicies={openPolicies} />)
              ) : (
                <MessageBubble from={message.from} text={message.text} />
              )}
            </Animated.View>
          ))}
        </ScrollView>

        <View
          className="gap-3 border-t border-border bg-surface pt-3"
          style={{ paddingBottom: keyboardOpen ? 8 : insets.bottom + 8 }}
        >
          <TopicChips
            onAsk={(key) => {
              const topic = TOPICS.find((t) => t.key === key);
              if (topic) ask(topic.question, [key], "chip");
            }}
          />
          <AskInput onSend={(text) => ask(text, matchTopics(text), "typed")} />
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="flex-row items-center gap-3 border-b border-border px-5 py-2">
        <IconButton icon="chevronLeft" size="nav" accessibilityLabel="Back" onPress={back} />
        <View className="flex-1">
          <Text variant="title" accessibilityRole="header">
            Ask about this stay
          </Text>
          {stay ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {stay.title}
            </Text>
          ) : null}
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {body}
      </KeyboardAvoidingView>
    </View>
  );
}
