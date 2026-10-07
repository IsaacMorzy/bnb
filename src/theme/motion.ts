// Motion tokens for Reanimated and other JS-driven animation.
// Visual tokens (color, type, spacing, radius, shadow) live in src/global.css.
export const motion = {
  fast: 150, // state feedback: press, toggle
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;
