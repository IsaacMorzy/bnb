import { HttpError } from "./http";

// Server only. Runs GROQ through the `roam-record-search` Sanity Context
// endpoint (GROQ mode, project 0z83ssmn), which is where Dataset Embeddings
// (`text::semanticSimilarity()`) are available to us. It's an MCP server, but
// one stateless JSON-RPC `tools/call` is all we need. `groq_query` takes no
// params, so queries must be built with `lit()` (search-groq.ts).

type RpcResponse = {
  result?: { content?: { type: string; text: string }[]; isError?: boolean };
  error?: { code: number; message: string };
};

// The endpoint may answer as JSON or as one server-sent event.
async function readRpc(res: Response): Promise<RpcResponse> {
  const body = await res.text();
  if (!res.headers.get("content-type")?.includes("event-stream")) return JSON.parse(body);
  const data = body.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5)).join("");
  return JSON.parse(data);
}

export async function contextQuery<T>(query: string, signal?: AbortSignal): Promise<T> {
  const url = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_ORGANIZATION_TOKEN;
  if (!url || !token) throw new HttpError(500, "context_not_configured");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "groq_query", arguments: { query } },
      }),
      signal,
    });
  } catch {
    throw new HttpError(502, "context_unreachable");
  }
  if (!res.ok) {
    console.warn("context http", res.status);
    throw new HttpError(502, "context_failed");
  }

  const rpc = await readRpc(res).catch(() => ({}) as RpcResponse);
  const text = rpc.result?.content?.[0]?.text;
  // Error text can quote the query, which holds the guest's sentence: log codes only.
  if (rpc.error || rpc.result?.isError || !text) {
    console.warn("context query failed", rpc.error?.code ?? (rpc.result?.isError ? "groq_error" : "empty"));
    throw new HttpError(502, "context_failed");
  }
  return (JSON.parse(text) as { result: T }).result;
}
