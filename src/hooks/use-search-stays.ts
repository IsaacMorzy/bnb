import { useCallback, useEffect, useState } from "react";

import { imageUrl, sanityQuery } from "@/lib/sanity/fetch";
import { PLACES_QUERY } from "@/lib/sanity/queries";
import type { ParsedQuery } from "@/lib/search/parse";
import { buildSearchQuery, type SortOption } from "@/lib/search/query";
import type { SearchStay } from "@/lib/stays";

/** `key` identifies the query and sort these results answer. */
export type SearchResult = { key: string; total: number; stays: SearchStay[] };

// Results already fetched this session, per query and sort.
const cache = new Map<string, SearchResult>();
let places: Promise<string[]> | undefined;

// Every stay's place names, lowercased, fetched once. If it fails, search still
// works: US states and "USA" are known without it.
export function useKnownPlaces() {
  const [known, setKnown] = useState<string[]>();
  useEffect(() => {
    let active = true;
    places ??= sanityQuery<string[]>(PLACES_QUERY)
      .then((names) => names.map((n) => n.toLowerCase()))
      .catch(() => {
        places = undefined;
        return [];
      });
    places.then((names) => active && setKnown(names));
    return () => {
      active = false;
    };
  }, []);
  return known;
}

// Like Home: the results on screen stay until the next ones arrive. `result`
// is undefined before the first load and after a failed one.
export function useSearchStays(parsed: ParsedQuery | undefined, sort: SortOption) {
  const key = parsed ? JSON.stringify([parsed, sort]) : undefined;
  const cached = key ? cache.get(key) : undefined;
  const [shown, setShown] = useState(cached);
  const [failed, setFailed] = useState<{ key: string; error: Error } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // A cached query shows at once (state adjusted during render, not in an effect).
  if (cached && cached !== shown) setShown(cached);

  useEffect(() => {
    if (!parsed || !key || cache.has(key)) return;
    const controller = new AbortController();
    const { query, params } = buildSearchQuery(parsed, sort);
    sanityQuery<Omit<SearchResult, "key">>(query, params, controller.signal)
      .then((result) => {
        const next = {
          key,
          total: result.total,
          stays: result.stays.map((s) => ({ ...s, imageUrl: s.imageUrl ? imageUrl(s.imageUrl, 600) : "" })),
        };
        cache.set(key, next);
        setShown(next);
        setFailed(null);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setFailed({ key, error });
      });
    return () => controller.abort();
    // `key` captures `parsed` and `sort`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const error = failed && failed.key === key ? failed.error : null;
  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((n) => n + 1);
  }, []);

  return { result: cached ?? (error ? undefined : shown), error, retry };
}
