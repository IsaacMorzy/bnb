// Home's stays: every published property, or one type when a category chip is
// selected ($type == "all" means no type filter).
export const HOME_STAYS_QUERY = /* groq */ `
  *[_type == "property" && defined(slug.current) && ($type == "all" || type == $type)]
    | order(rating desc, reviewCount desc)[0...30]{
      "id": _id,
      "slug": slug.current,
      title,
      type,
      city,
      region,
      country,
      rating,
      pricePerNight,
      "imageUrl": photos[0].asset->url,
      "imageAlt": photos[0].alt
    }
`;
