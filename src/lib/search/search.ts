import { properties as allProperties, type Property } from "@/data/properties";

import { parseQuery, type ParsedQuery } from "./parse";

// Exact constraints filter; soft terms only rank. Ties go to the better-rated,
// then the more-reviewed stay.
export function searchProperties(
  text: string,
  properties: Property[] = allProperties,
): { query: ParsedQuery; results: Property[] } {
  const query = parseQuery(text);

  const matches = properties.filter(
    (p) =>
      (query.maxPrice === undefined || p.pricePerNight <= query.maxPrice) &&
      (query.guests === undefined || p.maxGuests >= query.guests) &&
      (query.type === undefined || p.type === query.type) &&
      (!query.pets || p.petsAllowed) &&
      query.amenities.every((a) => p.amenities.includes(a)),
  );

  const score = (p: Property) => {
    const text = `${p.title} ${p.description} ${p.city} ${p.region}`.toLowerCase();
    return query.terms.reduce(
      (sum, term) =>
        sum + (p.vibes.includes(term) ? 2 : 0) + (new RegExp(`\\b${term}`).test(text) ? 1 : 0),
      0,
    );
  };

  const results = matches
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || b.p.rating - a.p.rating || b.p.reviewCount - a.p.reviewCount)
    .map(({ p }) => p);

  return { query, results };
}
