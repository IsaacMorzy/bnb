import type { HouseRules, ResponseTime, StayDetails, StayHost } from "@/lib/stays";

// "15:00" → "3:00 PM". Times are stored as 24-hour HH:MM in the stay's local time.
export function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export type HouseRuleKey = "checkIn" | "checkOut" | "quietHours" | "pets" | "smoking" | "parties" | "additional";

// The stay's own rules, one line each, built only from its typed fields.
// `additionalRules` are the host's words and show as written. Keyed so Ask can
// answer with just the lines a topic needs.
export function houseRuleParts(rules: HouseRules): { key: HouseRuleKey; text: string }[] {
  const parts: { key: HouseRuleKey; text: string }[] = [
    { key: "checkIn", text: `Check-in after ${formatTime(rules.checkInTime)}` },
    { key: "checkOut", text: `Checkout before ${formatTime(rules.checkOutTime)}` },
  ];
  if (rules.quietHoursFrom && rules.quietHoursTo) {
    parts.push({ key: "quietHours", text: `Quiet hours ${formatTime(rules.quietHoursFrom)} to ${formatTime(rules.quietHoursTo)}` });
  }
  if (rules.petsAllowed) {
    const pets = ["Pets allowed"];
    if (rules.maxPets) pets.push(`up to ${rules.maxPets}`);
    if (rules.petFee) pets.push(`$${rules.petFee} pet fee per stay`);
    parts.push({ key: "pets", text: pets.join(", ") });
  } else {
    parts.push({ key: "pets", text: "No pets" });
  }
  parts.push({ key: "smoking", text: rules.smokingAllowed ? "Smoking allowed" : "No smoking" });
  parts.push({ key: "parties", text: rules.partiesAllowed ? "Parties allowed" : "No parties or events" });
  for (const rule of rules.additionalRules ?? []) if (rule) parts.push({ key: "additional", text: rule });
  return parts;
}

export const houseRuleLines = (rules: HouseRules) => houseRuleParts(rules).map((part) => part.text);

// Until guests pick dates, the total is the shortest stay allowed plus cleaning.
export function stayTotal(stay: Pick<StayDetails, "pricePerNight" | "minNights" | "cleaningFee">) {
  const nights = Math.max(1, stay.minNights ?? 1);
  return { nights, total: stay.pricePerNight * nights + (stay.cleaningFee ?? 0) };
}

const responseLabels: Record<ResponseTime, string> = {
  withinHour: "within an hour",
  withinFewHours: "within a few hours",
  withinDay: "within a day",
};

// "English", "English and Spanish", "English, Spanish and Greek".
const joinList = (items: string[]) =>
  items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// The Host sheet's facts. Missing fields are left out.
export function hostFacts(host: StayHost): string[] {
  const facts: string[] = [];
  if (host.hostingSince) {
    const since = new Date(`${host.hostingSince}T00:00:00`);
    if (!Number.isNaN(since.getTime())) {
      facts.push(`Hosting since ${since.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`);
    }
  }
  if (host.responseTime) facts.push(`Responds ${responseLabels[host.responseTime]}`);
  if (host.languages?.length) facts.push(`Speaks ${joinList(host.languages)}`);
  return facts;
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
