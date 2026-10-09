// Mirrors the Sanity `property` schema (studio/schemaTypes/property.ts).
export type PropertyType = "cabin" | "beach" | "city" | "villa";

export type Amenity =
  | "hotTub"
  | "pool"
  | "fireplace"
  | "firePit"
  | "sauna"
  | "wifi"
  | "kitchen"
  | "workspace"
  | "parking"
  | "washer"
  | "ac"
  | "oceanView"
  | "lakeView"
  | "beachAccess"
  | "mountainView"
  | "bbq"
  | "evCharger";

// What Home's photo card needs.
export type StayCardData = {
  id: string;
  title: string;
  city: string;
  region?: string | null;
  country?: string | null;
  rating: number;
  pricePerNight: number;
  imageUrl: string;
  imageAlt?: string | null;
};

export type HomeStay = StayCardData & { slug: string; type: PropertyType };

// "Lake Arrowhead, CA" when a region is set, otherwise "Lisbon, Portugal".
export const placeLabel = (stay: Pick<StayCardData, "city" | "region" | "country">) =>
  [stay.city, stay.region || stay.country].filter(Boolean).join(", ");

// A Search result row (src/lib/search/query.ts projects exactly this).
export type SearchStay = StayCardData & {
  slug: string;
  type: PropertyType;
  reviewCount: number;
  amenities: Amenity[] | null;
  petsAllowed: boolean;
};
