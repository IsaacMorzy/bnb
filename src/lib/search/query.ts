import type { IconName } from "@/components/ui";
import type { Amenity, SearchStay } from "@/lib/stays";

import { amenityLabels, typeLabels, type ParsedQuery } from "./parse";

// Builds the GROQ for Search from a parsed query. Exact constraints filter,
// soft terms rank through score(). Only param names are written into the
// query text; every value the guest typed goes in as a param.

export type SortOption = "best" | "priceAsc" | "priceDesc" | "rating";

export const sortLabels: Record<SortOption, string> = {
  best: "Best match",
  priceAsc: "Price: low to high",
  priceDesc: "Price: high to low",
  rating: "Top rated",
};

const MAX_RESULTS = 50;

const byRating = "rating desc, reviewCount desc";
const orders: Record<Exclude<SortOption, "best">, string> = {
  priceAsc: `pricePerNight asc, ${byRating}`,
  priceDesc: `pricePerNight desc, ${byRating}`,
  rating: byRating,
};

const projection = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  type,
  city,
  region,
  country,
  rating,
  reviewCount,
  pricePerNight,
  amenities,
  "petsAllowed": houseRules.petsAllowed == true,
  "imageUrl": photos[0].asset->url,
  "imageAlt": photos[0].alt
}`;

export function buildSearchQuery(parsed: ParsedQuery, sort: SortOption) {
  const params: Record<string, unknown> = {};
  const filters = ['_type == "property"', "defined(slug.current)"];

  if (parsed.type) {
    params.type = parsed.type;
    filters.push("type == $type");
  }
  if (parsed.maxPrice !== undefined) {
    params.maxPrice = parsed.maxPrice;
    filters.push("pricePerNight <= $maxPrice");
  }
  if (parsed.guests !== undefined) {
    params.guests = parsed.guests;
    filters.push("maxGuests >= $guests");
  }
  if (parsed.pets) filters.push("houseRules.petsAllowed == true");
  if (parsed.amenities.length) {
    params.amenities = parsed.amenities;
    filters.push("count(amenities[@ in $amenities]) == count($amenities)");
  }
  if (parsed.place) {
    params.places = parsed.place.values;
    filters.push("count([lower(city), lower(region), lower(country), lower(neighborhood)][@ in $places]) > 0");
  }

  // One pair of boosts per soft word: a vibe tag counts three times as much as
  // the word appearing in the copy.
  const boosts = parsed.terms.flatMap((term, i) => {
    params[`t${i}`] = term;
    return [`boost(vibes match $t${i}, 3)`, `boost([title, summary, description, highlights, neighborhood] match $t${i}, 1)`];
  });

  const filter = filters.join(" && ");
  const ranked =
    sort === "best"
      ? boosts.length
        ? `| score(${boosts.join(", ")}) | order(_score desc, ${byRating})`
        : `| order(${byRating})`
      : `| order(${orders[sort]})`;

  const query = /* groq */ `{
    "total": count(*[${filter}]),
    "stays": *[${filter}] ${ranked} [0...${MAX_RESULTS}]${projection}
  }`;
  return { query, params };
}

// ---- Chips -----------------------------------------------------------------

export type SearchChip =
  | { kind: "type"; value: NonNullable<ParsedQuery["type"]> }
  | { kind: "price"; value: number }
  | { kind: "guests"; value: number }
  | { kind: "pets" }
  | { kind: "amenity"; value: Amenity }
  | { kind: "vibe"; value: string };

// Vibe words stays are tagged with. Only these show as chips; other soft words
// still rank but stay invisible.
const knownVibes = new Set([
  "quiet", "cozy", "secluded", "romantic", "peaceful", "luxury", "family", "lively",
  "walkable", "rustic", "modern", "views", "nature", "minimal", "design", "laid-back",
]);

const suggestions: SearchChip[] = [
  { kind: "price", value: 300 },
  { kind: "pets" },
  { kind: "vibe", value: "quiet" },
  { kind: "amenity", value: "hotTub" },
  { kind: "amenity", value: "pool" },
  { kind: "amenity", value: "fireplace" },
];
const MAX_SUGGESTIONS = 4;

export const chipKey = (chip: SearchChip) => ("value" in chip ? `${chip.kind}:${chip.value}` : chip.kind);

export function chipLabel(chip: SearchChip) {
  switch (chip.kind) {
    case "type":
      return typeLabels[chip.value];
    case "price":
      return `Under $${chip.value}`;
    case "guests":
      return `${chip.value}+ guests`;
    case "pets":
      return "Pet Friendly";
    case "amenity":
      return amenityLabels[chip.value];
    case "vibe":
      return chip.value[0].toUpperCase() + chip.value.slice(1);
  }
}

/**
 * The chip row for a submitted query: its constraints, then suggestions that
 * don't conflict. Toggling doesn't reorder it; `hasChip` says what's selected.
 */
export function chipsFor(parsed: ParsedQuery): SearchChip[] {
  const active: SearchChip[] = [
    ...(parsed.type ? [{ kind: "type", value: parsed.type } as const] : []),
    ...(parsed.maxPrice !== undefined ? [{ kind: "price", value: parsed.maxPrice } as const] : []),
    ...(parsed.guests !== undefined ? [{ kind: "guests", value: parsed.guests } as const] : []),
    ...(parsed.pets ? [{ kind: "pets" } as const] : []),
    ...parsed.amenities.map((value) => ({ kind: "amenity", value }) as const),
    ...parsed.terms.filter((t) => knownVibes.has(t)).map((value) => ({ kind: "vibe", value }) as const),
  ];
  const activeKeys = new Set(active.map(chipKey));
  const extra = suggestions
    .filter((s) => !activeKeys.has(chipKey(s)) && !(s.kind === "price" && parsed.maxPrice !== undefined))
    .slice(0, MAX_SUGGESTIONS);
  return [...active, ...extra];
}

export function hasChip(parsed: ParsedQuery, chip: SearchChip) {
  switch (chip.kind) {
    case "type":
      return parsed.type === chip.value;
    case "price":
      return parsed.maxPrice === chip.value;
    case "guests":
      return parsed.guests === chip.value;
    case "pets":
      return !!parsed.pets;
    case "amenity":
      return parsed.amenities.includes(chip.value);
    case "vibe":
      return parsed.terms.includes(chip.value);
  }
}

/** Adds the chip's constraint to the query, or removes it when it's already there. */
export function toggleChip(parsed: ParsedQuery, chip: SearchChip, on: boolean): ParsedQuery {
  const next: ParsedQuery = { ...parsed, amenities: [...parsed.amenities], terms: [...parsed.terms] };
  switch (chip.kind) {
    case "type":
      next.type = on ? chip.value : undefined;
      break;
    case "price":
      next.maxPrice = on ? chip.value : undefined;
      break;
    case "guests":
      next.guests = on ? chip.value : undefined;
      break;
    case "pets":
      next.pets = on || undefined;
      break;
    case "amenity":
      next.amenities = parsed.amenities.filter((a) => a !== chip.value).concat(on ? [chip.value] : []);
      break;
    case "vibe":
      next.terms = parsed.terms.filter((t) => t !== chip.value).concat(on ? [chip.value] : []);
      break;
  }
  return next;
}

// ---- Card tags ("why it matched") -------------------------------------------

export type StayTag = { key: string; label: string; icon: IconName };

const amenityIcons: Partial<Record<Amenity, IconName>> = {
  hotTub: "hotTub",
  pool: "pool",
  sauna: "sauna",
  fireplace: "fireplace",
  oceanView: "water",
  lakeView: "water",
  mountainView: "mountain",
  beachAccess: "beachAccess",
  firePit: "firePit",
};
// Standout amenities, best first.
const tagOrder = Object.keys(amenityIcons) as Amenity[];
// Everyday amenities only fill a card that has nothing standout.
const everydayIcons: Partial<Record<Amenity, IconName>> = {
  workspace: "workspace",
  wifi: "wifi",
  kitchen: "kitchen",
  ac: "ac",
};

const amenityTag = (a: Amenity): StayTag => ({
  key: a,
  label: amenityLabels[a],
  icon: amenityIcons[a] ?? everydayIcons[a] ?? "success",
});
const petsTag: StayTag = { key: "pets", label: "Pet Friendly", icon: "pets" };

/**
 * Two tags per card: what the guest asked for first, then the stay's best
 * amenity, Pet Friendly when pets are allowed, then its next amenity, then an
 * everyday one.
 */
export function stayTags(stay: Pick<SearchStay, "amenities" | "petsAllowed">, parsed: ParsedQuery, max = 2): StayTag[] {
  const tags: StayTag[] = [
    ...parsed.amenities.filter((a) => stay.amenities?.includes(a)).map(amenityTag),
    ...(parsed.pets && stay.petsAllowed ? [petsTag] : []),
  ];
  const standout = tagOrder.filter((a) => stay.amenities?.includes(a));
  const fill = [
    ...standout.slice(0, 1).map(amenityTag),
    ...(stay.petsAllowed ? [petsTag] : []),
    ...standout.slice(1).map(amenityTag),
    ...(Object.keys(everydayIcons) as Amenity[]).filter((a) => stay.amenities?.includes(a)).map(amenityTag),
  ];
  for (const tag of fill) {
    if (tags.length >= max) break;
    if (!tags.some((t) => t.key === tag.key || t.label === tag.label)) tags.push(tag);
  }
  return tags.slice(0, max);
}
