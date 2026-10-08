import type { Amenity, PropertyType } from "@/data/properties";

// Turns one sentence into exact constraints (which filter) and soft terms
// (which rank). A local stand-in for GROQ params + embeddings: values are only
// ever parsed in code.

export type ParsedQuery = {
  maxPrice?: number;
  guests?: number;
  type?: PropertyType;
  amenities: Amenity[];
  pets?: boolean;
  /** Leftover words that rank but don't filter, e.g. "quiet". */
  terms: string[];
};

const typeWords: [RegExp, PropertyType][] = [
  [/\b(cabins?|chalets?|a-?frames?|lodges?|log homes?)\b/, "cabin"],
  [/\b(beach( houses?)?|beachfront|seaside|oceanfront|bungalows?)\b/, "beach"],
  [/\b(villas?|mansions?)\b/, "villa"],
  [/\b(city|apartments?|apts?|lofts?|flats?|studios?|downtown|condos?)\b/, "city"],
];

const amenityWords: [RegExp, Amenity][] = [
  [/\b(hot ?tubs?|jacuzzis?|spa)\b/, "hotTub"],
  [/\b(pools?|swimming)\b/, "pool"],
  [/\b(fireplaces?|wood ?stoves?)\b/, "fireplace"],
  [/\b(fire ?pits?|campfires?)\b/, "firePit"],
  [/\bsaunas?\b/, "sauna"],
  [/\b(wi-?fi|internet)\b/, "wifi"],
  [/\bkitchens?\b/, "kitchen"],
  [/\b(workspace|desk|work from (home|here))\b/, "workspace"],
  [/\b(parking|garage)\b/, "parking"],
  [/\b(washer|laundry)\b/, "washer"],
  [/\b(air ?con(ditioning)?|a\/c|ac)\b/, "ac"],
  [/\b(ocean|sea) ?views?\b/, "oceanView"],
  [/\b(lake ?views?|lakefront|lakeside|on the lake)\b/, "lakeView"],
  [/\bbeach access\b/, "beachAccess"],
];

const petWords = /\b(pet[- ]?friendly|pets?( (allowed|ok|welcome))?|dogs?|cats?|puppy)\b/;

const pricePatterns = [
  /\b(?:under|below|less than|max(?:imum)?|up to|at most|cheaper than)\s*\$?\s*(\d[\d,]*)/,
  /\$\s*(\d[\d,]*)/,
  /\b(\d[\d,]*)\s*(?:dollars|bucks|usd)\b/,
];

const guestPatterns = [
  /\b(\d+)\s*(?:guests?|people|persons|adults|of us)\b/,
  /\b(?:for|sleeps|sleeping|fits)\s+(\d+)\b/,
];

// Map common synonyms onto the vibe words stays are tagged with.
const synonyms: Record<string, string> = {
  calm: "quiet",
  silent: "quiet",
  tranquil: "peaceful",
  serene: "peaceful",
  relaxing: "peaceful",
  cosy: "cozy",
  snug: "cozy",
  remote: "secluded",
  private: "secluded",
  isolated: "secluded",
  hidden: "secluded",
  luxurious: "luxury",
  fancy: "luxury",
  upscale: "luxury",
  view: "views",
  scenic: "views",
  kids: "family",
  families: "family",
  walkable: "walkable",
  central: "walkable",
  busy: "lively",
  nightlife: "lively",
};

const stopwords = new Set(
  "a an the and or with without in near on of to at by from my our me we i want need looking something somewhere place places stay stays home house night nights per weekend week trip that has have is are be it this some any very really nice good great"
    .split(" "),
);

function take(text: string, pattern: RegExp): [RegExpMatchArray | null, string] {
  const match = text.match(pattern);
  return [match, match ? text.replace(match[0], " ") : text];
}

const toNumber = (raw: string) => Number(raw.replace(/,/g, ""));

export function parseQuery(input: string): ParsedQuery {
  let text = ` ${input.toLowerCase().replace(/[’']/g, "")} `
    .replace(/\b(a|per|\/)\s*night\b|\/night|\bnightly\b/g, " ");
  const query: ParsedQuery = { amenities: [], terms: [] };

  for (const pattern of pricePatterns) {
    const [match, rest] = take(text, pattern);
    if (match) {
      query.maxPrice = toNumber(match[1]);
      text = rest;
      break;
    }
  }

  for (const pattern of guestPatterns) {
    const [match, rest] = take(text, pattern);
    if (match) {
      query.guests = toNumber(match[1]);
      text = rest;
      break;
    }
  }

  // Amenities first, so "beach access" isn't read as the beach type.
  for (const [pattern, amenity] of amenityWords) {
    const [match, rest] = take(text, pattern);
    if (match) {
      query.amenities.push(amenity);
      text = rest;
    }
  }

  for (const [pattern, type] of typeWords) {
    const [match, rest] = take(text, pattern);
    if (match) {
      query.type ??= type;
      text = rest;
    }
  }

  const [pets, rest] = take(text, petWords);
  if (pets) {
    query.pets = true;
    text = rest;
  }

  query.terms = [
    ...new Set(
      text
        .split(/[^a-z-]+/)
        .filter((w) => w.length > 2 && !stopwords.has(w))
        .map((w) => synonyms[w] ?? w),
    ),
  ];

  return query;
}

const amenityLabels: Record<Amenity, string> = {
  hotTub: "Hot tub",
  pool: "Pool",
  fireplace: "Fireplace",
  firePit: "Fire pit",
  sauna: "Sauna",
  wifi: "Wi-Fi",
  kitchen: "Kitchen",
  workspace: "Workspace",
  parking: "Parking",
  washer: "Washer",
  ac: "Air conditioning",
  oceanView: "Ocean view",
  lakeView: "Lake view",
  beachAccess: "Beach access",
};

const typeLabels: Record<PropertyType, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};

/** The exact constraints in words, for the empty state. */
export function describeQuery(query: ParsedQuery): string[] {
  return [
    query.type && typeLabels[query.type],
    query.maxPrice !== undefined && `Under $${query.maxPrice}`,
    query.guests !== undefined && `${query.guests}+ guests`,
    query.pets && "Pets allowed",
    ...query.amenities.map((a) => amenityLabels[a]),
  ].filter((label): label is string => !!label);
}
