// Local sample stays until Sanity is seeded. The shape mirrors a future
// `property` document so screens don't change when the data moves.
// Photos are Unsplash placeholders (free Unsplash License).

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
  | "beachAccess";

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  city: string;
  region: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  petsAllowed: boolean;
  amenities: Amenity[];
  /** Soft qualities a guest might ask for: quiet, cozy, secluded… */
  vibes: string[];
  description: string;
  imageUrl: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

export const properties: Property[] = [
  {
    id: "lake-arrowhead-modern-cabin",
    title: "Modern Cabin with Hot Tub",
    type: "cabin",
    city: "Lake Arrowhead",
    region: "CA",
    rating: 4.9,
    reviewCount: 214,
    pricePerNight: 289,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: true,
    amenities: ["hotTub", "fireplace", "firePit", "wifi", "kitchen", "parking"],
    vibes: ["quiet", "cozy", "modern", "views", "peaceful"],
    description:
      "Glass-walled cabin under tall pines with a cedar hot tub on the deck, a wood fireplace, and a fire pit for clear mountain nights. Five minutes to the village, but you'll only hear the wind.",
    imageUrl: unsplash("1542718610-a1d656d1884c"),
  },
  {
    id: "big-bear-hammock-a-frame",
    title: "Pine Forest A-Frame",
    type: "cabin",
    city: "Big Bear Lake",
    region: "CA",
    rating: 4.8,
    reviewCount: 167,
    pricePerNight: 189,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: true,
    amenities: ["hotTub", "firePit", "wifi", "kitchen", "parking"],
    vibes: ["cozy", "secluded", "rustic", "romantic", "quiet"],
    description:
      "A tiny A-frame tucked into the forest with a hammock strung between the pines, a two-person hot tub, and a loft bed under the skylight. Dogs welcome, trailheads out the back door.",
    imageUrl: unsplash("1499696010180-025ef6e1a8f9"),
  },
  {
    id: "lago-di-braies-boathouse",
    title: "Dolomites Lake Boathouse",
    type: "cabin",
    city: "Lago di Braies",
    region: "Italy",
    rating: 4.9,
    reviewCount: 98,
    pricePerNight: 410,
    maxGuests: 2,
    bedrooms: 1,
    petsAllowed: false,
    amenities: ["lakeView", "wifi", "kitchen", "fireplace"],
    vibes: ["romantic", "views", "peaceful", "quiet", "rustic"],
    description:
      "A restored timber boathouse on stilts over an emerald alpine lake, with a rowboat at the dock and peaks reflected in the water every morning.",
    imageUrl: unsplash("1470770841072-f978cf4d019e"),
  },
  {
    id: "fernie-snowy-chalet",
    title: "Snowy Lakeside Chalet",
    type: "cabin",
    city: "Fernie",
    region: "BC",
    rating: 4.7,
    reviewCount: 132,
    pricePerNight: 340,
    maxGuests: 8,
    bedrooms: 4,
    petsAllowed: true,
    amenities: ["hotTub", "sauna", "fireplace", "lakeView", "wifi", "kitchen", "washer", "parking"],
    vibes: ["cozy", "family", "views", "rustic"],
    description:
      "A log chalet on a frozen lake with a wood-fired sauna, an outdoor hot tub, and room for the whole family. Ski hill 15 minutes away.",
    imageUrl: unsplash("1510798831971-661eb04b3739"),
  },
  {
    id: "skykomish-misty-cabin",
    title: "Misty Forest Cabin",
    type: "cabin",
    city: "Skykomish",
    region: "WA",
    rating: 4.6,
    reviewCount: 88,
    pricePerNight: 145,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: true,
    amenities: ["fireplace", "wifi", "kitchen", "workspace", "parking"],
    vibes: ["secluded", "quiet", "rustic", "cozy"],
    description:
      "A cedar cabin deep in the Cascade fog with a woodstove, a reading nook, and a desk by the window. No neighbors in sight, river trail at the end of the drive.",
    imageUrl: unsplash("1587061949409-02df41d5e562"),
  },
  {
    id: "guerneville-redwood-cabin",
    title: "Redwood Log Cabin",
    type: "cabin",
    city: "Guerneville",
    region: "CA",
    rating: 4.8,
    reviewCount: 241,
    pricePerNight: 175,
    maxGuests: 3,
    bedrooms: 1,
    petsAllowed: false,
    amenities: ["hotTub", "fireplace", "wifi", "kitchen"],
    vibes: ["secluded", "romantic", "quiet", "rustic", "peaceful"],
    description:
      "A one-room log cabin in an old redwood grove with a hot tub on the porch. Wine country and the Russian River are a short drive away.",
    imageUrl: unsplash("1449158743715-0a90ebb6d2d8"),
  },
  {
    id: "bocas-beach-bungalow",
    title: "Overwater Beach Bungalow",
    type: "beach",
    city: "Bocas del Toro",
    region: "Panama",
    rating: 4.8,
    reviewCount: 156,
    pricePerNight: 265,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: false,
    amenities: ["beachAccess", "oceanView", "wifi", "ac", "kitchen"],
    vibes: ["peaceful", "romantic", "views", "secluded"],
    description:
      "A thatched bungalow on stilts above turquoise water, with steps from the deck straight into the sea and hammocks for afternoon naps.",
    imageUrl: unsplash("1499793983690-e29da59ef1c2"),
  },
  {
    id: "key-west-beach-house",
    title: "Palm-Lined Beach House",
    type: "beach",
    city: "Key West",
    region: "FL",
    rating: 4.7,
    reviewCount: 203,
    pricePerNight: 520,
    maxGuests: 10,
    bedrooms: 5,
    petsAllowed: true,
    amenities: ["pool", "beachAccess", "wifi", "ac", "kitchen", "washer", "parking"],
    vibes: ["family", "lively", "walkable"],
    description:
      "A two-story conch house with wraparound porches, a private pool under the palms, and a two-block walk to the beach and Duval Street.",
    imageUrl: unsplash("1564013799919-ab600027ffc6"),
  },
  {
    id: "tulum-beachfront-casita",
    title: "Beachfront Casita with Pool",
    type: "beach",
    city: "Tulum",
    region: "Mexico",
    rating: 4.6,
    reviewCount: 119,
    pricePerNight: 230,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: true,
    amenities: ["pool", "beachAccess", "oceanView", "wifi", "ac"],
    vibes: ["lively", "family", "views"],
    description:
      "A casita in a palm garden that opens onto a shared pool and white-sand beach. Bike to cenotes and the town's taquerias.",
    imageUrl: unsplash("1610641818989-c2051b5e2cfd"),
  },
  {
    id: "marbella-hillside-villa",
    title: "Hillside Villa with Pool",
    type: "villa",
    city: "Marbella",
    region: "Spain",
    rating: 4.9,
    reviewCount: 74,
    pricePerNight: 780,
    maxGuests: 10,
    bedrooms: 5,
    petsAllowed: false,
    amenities: ["pool", "oceanView", "wifi", "ac", "kitchen", "washer", "parking", "workspace"],
    vibes: ["luxury", "modern", "views", "family"],
    description:
      "Floor-to-ceiling glass, a lawn that runs into a heated pool, and Mediterranean views from every bedroom. A chef can be arranged.",
    imageUrl: unsplash("1580587771525-78b9dba3b914"),
  },
  {
    id: "seminyak-garden-villa",
    title: "Tropical Garden Villa",
    type: "villa",
    city: "Seminyak",
    region: "Bali",
    rating: 4.8,
    reviewCount: 189,
    pricePerNight: 260,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: false,
    amenities: ["pool", "wifi", "ac", "kitchen"],
    vibes: ["peaceful", "romantic", "luxury", "quiet"],
    description:
      "Pavilions around a long reflecting pool, frangipani in the garden, and daily breakfast served on your terrace. Ten minutes to the beach clubs.",
    imageUrl: unsplash("1596178065887-1198b6148b2b"),
  },
  {
    id: "mykonos-infinity-villa",
    title: "Infinity Pool Villa",
    type: "villa",
    city: "Mykonos",
    region: "Greece",
    rating: 4.9,
    reviewCount: 61,
    pricePerNight: 850,
    maxGuests: 8,
    bedrooms: 4,
    petsAllowed: false,
    amenities: ["pool", "oceanView", "wifi", "ac", "kitchen", "parking"],
    vibes: ["luxury", "modern", "views", "lively"],
    description:
      "A cubist villa above the Aegean with a striped infinity pool, sunset terrace, and a five-minute drive to Little Venice.",
    imageUrl: unsplash("1613490493576-7fde63acd811"),
  },
  {
    id: "palm-springs-desert-villa",
    title: "Desert Modern Villa",
    type: "villa",
    city: "Palm Springs",
    region: "CA",
    rating: 4.7,
    reviewCount: 142,
    pricePerNight: 395,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: true,
    amenities: ["pool", "hotTub", "wifi", "ac", "kitchen", "parking"],
    vibes: ["modern", "quiet", "luxury"],
    description:
      "Mid-century lines, a saltwater pool with a spa, and mountain views from the lounge chairs. Dogs welcome in the walled yard.",
    imageUrl: unsplash("1512917774080-9991f1c4c750"),
  },
  {
    id: "brooklyn-bright-loft",
    title: "Bright Brooklyn Loft",
    type: "city",
    city: "Brooklyn",
    region: "NY",
    rating: 4.7,
    reviewCount: 318,
    pricePerNight: 199,
    maxGuests: 3,
    bedrooms: 1,
    petsAllowed: false,
    amenities: ["wifi", "workspace", "kitchen", "washer", "ac"],
    vibes: ["walkable", "lively", "modern"],
    description:
      "A sunny loft with tall windows, herringbone floors, and a proper desk, two blocks from the L train and Bedford Avenue's cafés.",
    imageUrl: unsplash("1493809842364-78817add7ffb"),
  },
  {
    id: "lisbon-old-town-apartment",
    title: "Sunny Alfama Apartment",
    type: "city",
    city: "Lisbon",
    region: "Portugal",
    rating: 4.8,
    reviewCount: 276,
    pricePerNight: 120,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: true,
    amenities: ["wifi", "kitchen", "washer", "workspace"],
    vibes: ["walkable", "cozy", "lively"],
    description:
      "A bright two-bedroom flat with Juliet balconies over a tiled street in Alfama. Trams, viewpoints, and fado bars around the corner.",
    imageUrl: unsplash("1522708323590-d24dbb6b0267"),
  },
  {
    id: "mexico-city-plant-studio",
    title: "Plant-Filled Studio",
    type: "city",
    city: "Mexico City",
    region: "Mexico",
    rating: 4.9,
    reviewCount: 402,
    pricePerNight: 95,
    maxGuests: 2,
    bedrooms: 1,
    petsAllowed: false,
    amenities: ["wifi", "workspace", "kitchen"],
    vibes: ["cozy", "walkable", "quiet"],
    description:
      "A calm studio full of plants and books on a tree-lined street, with a desk by the window and the city's best coffee within a block.",
    imageUrl: unsplash("1502672260266-1c1ef2d93688"),
  },
];
