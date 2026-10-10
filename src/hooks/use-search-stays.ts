import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

import type { SearchIntent } from "@/lib/search/intent";
import type { SortOption } from "@/lib/search/query";
import type { SearchStay } from "@/lib/stays";

/** A sentence for the server to read, or an intent it already read (chips, sort). */
export type SearchRequest = { q: string } | { intent: SearchIntent };

/** `key` identifies the request and sort these results answer. */
export type SearchResult = { key: string; intent: SearchIntent; total: number; stays: SearchStay[] };

export class SearchError extends Error {
  constructor(public status: number) {
    super(`Search failed (${status})`);
    this.name = "SearchError";
  }
}

// Results already fetched this session, per request and sort.
const cache = new Map<string, SearchResult>();

// Like Home: the results on screen stay until the next ones arrive. `result`
// is undefined before the first load and after a failed one.
export function useSearchStays(request: SearchRequest | undefined, sort: SortOption) {
  const { getToken } = useAuth();
  const key = request ? JSON.stringify([request, sort]) : undefined;
  const cached = key ? cache.get(key) : undefined;
  const [shown, setShown] = useState(cached);
  const [failed, setFailed] = useState<{ key: string; error: Error } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // A cached request shows at once (state adjusted during render, not in an effect).
  if (cached && cached !== shown) setShown(cached);

  useEffect(() => {
    if (!request || !key || cache.has(key)) return;
    const controller = new AbortController();
    (async () => {
      const token = await getToken();
      // Relative URLs go to the dev server in development (Expo Router API routes).
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...request, sort }),
        signal: controller.signal,
      });
      if (!res.ok) throw new SearchError(res.status);
      const body = (await res.json()) as Omit<SearchResult, "key">;
      const next = { key, ...body };
      cache.set(key, next);
      // The screen sends this reading back next ({ intent }); it answers that too.
      if ("q" in request) cache.set(JSON.stringify([{ intent: body.intent }, sort]), next);
      setShown(next);
      setFailed(null);
    })().catch((error: Error) => {
      if (error.name !== "AbortError") setFailed({ key, error });
    });
    return () => controller.abort();
    // `key` captures `request` and `sort`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const error = failed && failed.key === key ? failed.error : null;
  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((n) => n + 1);
  }, []);

  return { result: cached ?? (error ? undefined : shown), error, retry };
}
