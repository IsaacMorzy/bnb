import type { SymbolViewProps } from "expo-symbols";

// One registry so every screen uses the same glyph for the same idea.
// SF Symbols on iOS, Material Symbols on Android and web.
export const icons = {
  home: { ios: "house", android: "home", web: "home" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  heart: { ios: "heart", android: "favorite", web: "favorite" },
  calendar: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  person: { ios: "person", android: "person", web: "person" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
  pin: { ios: "mappin.and.ellipse", android: "location_on", web: "location_on" },
  filters: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
  arrowRight: { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" },
  chevronRight: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  close: { ios: "xmark", android: "close", web: "close" },
  share: { ios: "square.and.arrow.up", android: "ios_share", web: "ios_share" },
  bookmark: { ios: "bookmark", android: "bookmark", web: "bookmark" },
  lock: { ios: "lock", android: "lock", web: "lock" },
  eye: { ios: "eye", android: "visibility", web: "visibility" },
  eyeOff: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  star: { ios: "star.fill", android: "star", web: "star" },
  cabin: { ios: "tree", android: "forest", web: "forest" },
  beach: { ios: "water.waves", android: "waves", web: "waves" },
  city: { ios: "building.2", android: "apartment", web: "apartment" },
  villa: { ios: "beach.umbrella", android: "villa", web: "villa" }, // SF Symbols has no palm tree
  pets: { ios: "pawprint.fill", android: "pets", web: "pets" },
  hotTub: { ios: "bathtub", android: "hot_tub", web: "hot_tub" },
  minus: { ios: "minus", android: "remove", web: "remove" },
  plus: { ios: "plus", android: "add", web: "add" },
  map: { ios: "map", android: "map", web: "map" },
  list: { ios: "list.bullet", android: "list", web: "list" },
  success: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" },
  error: { ios: "exclamationmark.circle.fill", android: "error", web: "error" },
} as const satisfies Record<string, Exclude<SymbolViewProps["name"], string>>;

export type IconName = keyof typeof icons;
