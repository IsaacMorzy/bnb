import { useCallback, useEffect, useState } from "react";

import { imageUrl, sanityQuery } from "@/lib/sanity/fetch";
import { STAY_QUERY } from "@/lib/sanity/queries";
import type { StayDetails } from "@/lib/stays";

// Stays already fetched this session, so the Policies and Host sheets (and
// reopening a stay) show at once. `null` means the slug matched no stay.
const cache = new Map<string, StayDetails | null>();

// Roam's policies read in this order; anything new goes last.
const policyOrder = ["checkIn", "pets", "payment", "damage", "guestRefund"];
const rank = (kind: string) => {
  const i = policyOrder.indexOf(kind);
  return i === -1 ? policyOrder.length : i;
};

/** `stay` is undefined while loading and after a failed load, `null` when not found. */
export function useStay(slug: string) {
  // The loaded stay lives in state, not only in the module cache: the React
  // Compiler memoizes `cache.get(slug)` by slug and would never see it change.
  const [loaded, setLoaded] = useState<{ slug: string; stay: StayDetails | null }>();
  const [failed, setFailed] = useState<{ slug: string; error: Error } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(slug)) return;
    const controller = new AbortController();
    sanityQuery<StayDetails | null>(STAY_QUERY, { slug }, controller.signal)
      .then((stay) => {
        const next = stay && {
          ...stay,
          photos: (stay.photos ?? []).filter((p) => p.url).map((p) => ({ ...p, url: imageUrl(p.url, 1200) })),
          host: stay.host && { ...stay.host, photoUrl: stay.host.photoUrl ? imageUrl(stay.host.photoUrl, 200) : null },
          policies: [...(stay.policies ?? [])].sort((a, b) => rank(a.kind) - rank(b.kind)),
        };
        cache.set(slug, next);
        setLoaded({ slug, stay: next });
        setFailed(null);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setFailed({ slug, error });
      });
    return () => controller.abort();
  }, [slug, attempt]);

  const error = failed?.slug === slug ? failed.error : null;
  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((n) => n + 1);
  }, []);

  return { stay: loaded?.slug === slug ? loaded.stay : cache.get(slug), error, retry };
}
