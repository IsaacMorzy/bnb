import type { PropertyType } from "@/data/properties";

// What a stay card needs. Both local stays (Search) and live Sanity stays
// (Home) satisfy it.
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
