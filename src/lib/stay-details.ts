import type { HouseRules, ResponseTime, StayDetails, StayHost } from "@/lib/stays";

// "15:00" → "3:00 PM". Times are stored as 24-hour HH:MM in the stay's local time.
export function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// The stay's own rules, one line each, built only from its typed fields.
// `additionalRules` are the host's words and show as written.
export function houseRuleLines(rules: HouseRules): string[] {
  const lines = [`Check-in after ${formatTime(rules.checkInTime)}`, `Checkout before ${formatTime(rules.checkOutTime)}`];
  if (rules.quietHoursFrom && rules.quietHoursTo) {
    lines.push(`Quiet hours ${formatTime(rules.quietHoursFrom)} to ${formatTime(rules.quietHoursTo)}`);
  }
  if (rules.petsAllowed) {
    const parts = ["Pets allowed"];
    if (rules.maxPets) parts.push(`up to ${rules.maxPets}`);
    if (rules.petFee) parts.push(`$${rules.petFee} pet fee per stay`);
    lines.push(parts.join(", "));
  } else {
    lines.push("No pets");
  }
  lines.push(rules.smokingAllowed ? "Smoking allowed" : "No smoking");
  lines.push(rules.partiesAllowed ? "Parties allowed" : "No parties or events");
  return [...lines, ...(rules.additionalRules ?? []).filter(Boolean)];
}

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
