import { useCallback, useEffect, useState } from "react";

import type { Category } from "@/components/home/category-chips";
import { imageUrl, sanityQuery } from "@/lib/sanity/fetch";
import { HOME_STAYS_QUERY } from "@/lib/sanity/queries";
import type { HomeStay } from "@/lib/stays";

// Lists already fetched this session, per category, so switching back to a
// chip is instant.
const cache = new Map<Category, HomeStay[]>();

// While a new category loads, the list on screen stays until the new one
// arrives. `stays` is undefined before the first load and after a failed one.
export function useHomeStays(category: Category) {
  const cached = cache.get(category);
  const [shown, setShown] = useState(cached);
  const [failed, setFailed] = useState<{ category: Category; error: Error } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // A cached category shows at once (state adjusted during render, not in an effect).
  if (cached && cached !== shown) setShown(cached);

  useEffect(() => {
    if (cache.has(category)) return;
    const controller = new AbortController();
    sanityQuery<HomeStay[]>(HOME_STAYS_QUERY, { type: category }, controller.signal)
      .then((rows) => {
        const stays = rows.map((s) => ({ ...s, imageUrl: s.imageUrl ? imageUrl(s.imageUrl) : "" }));
        cache.set(category, stays);
        setShown(stays);
        setFailed(null);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setFailed({ category, error });
      });
    return () => controller.abort();
  }, [category, attempt]);

  const error = failed?.category === category ? failed.error : null;
  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((n) => n + 1);
  }, []);

  return { stays: cached ?? (error ? undefined : shown), error, retry };
}
