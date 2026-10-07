import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";
import type { IconName } from "./icons";
import { Text } from "./text";

const sizes = {
  md: { container: "h-12 px-6", text: "label", icon: 20 },
  sm: { container: "h-11 px-4", text: "footnote", icon: 18 },
} as const;

const selectedTones = {
  lavender: "border-lavender bg-lavender",
  primary: "border-primary bg-primary",
} as const;

export type ChipProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  selected?: boolean;
  /** Fill when selected: lavender for filters, primary for categories. */
  tone?: keyof typeof selectedTones;
  size?: keyof typeof sizes;
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected,
  tone = "lavender",
  size = "md",
  icon,
  className,
  style,
  ...props
}: ChipProps) {
  const s = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className={cn(
        "flex-row items-center gap-2 rounded-full border active:opacity-70",
        s.container,
        selected ? selectedTones[tone] : "border-border bg-surface",
        className,
      )}
      style={style}
      {...props}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      <Text variant={s.text}>{label}</Text>
    </Pressable>
  );
}
