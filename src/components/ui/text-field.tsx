import { useState, type ReactNode } from "react";
import { Pressable, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";
import type { IconName } from "./icons";

export type TextFieldProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  icon?: IconName;
  /** Trailing control, e.g. a filter button on the search field. */
  accessory?: ReactNode;
  /** Masks the value and adds a show/hide toggle. */
  secure?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function TextField({
  icon,
  accessory,
  secure,
  className,
  style,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View
      className={cn(
        "h-14 flex-row items-center gap-3 rounded-lg corner-squircle border-2 px-4",
        focused ? "border-lavender bg-lavender-soft" : "border-border/50 bg-surface-muted",
        className,
      )}
      style={style}
    >
      {icon && <Icon name={icon} />}
      <TextInput
        className="h-full flex-1 font-jakarta text-body text-ink placeholder:text-ink-subtle selection:text-lavender"
        secureTextEntry={secure && !revealed}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={revealed ? "Hide password" : "Show password"}
          hitSlop={12}
          onPress={() => setRevealed((r) => !r)}
          className="active:opacity-70"
        >
          <Icon name={revealed ? "eye" : "eyeOff"} />
        </Pressable>
      ) : (
        accessory
      )}
    </View>
  );
}
