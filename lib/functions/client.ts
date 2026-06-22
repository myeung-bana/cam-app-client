interface FunctionEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface CallFunctionOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  query?: Record<string, string>;
}

export async function callFunction<T>(
  path: string,
  options: CallFunctionOptions = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_FUNCTIONS_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_FUNCTIONS_URL is not configured");
  }

  const url = new URL(`${base.replace(/\/$/, "")}${path}`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const envelope = (await response.json().catch(() => ({}))) as FunctionEnvelope<T>;
  if (!response.ok || !envelope.ok || envelope.data === undefined) {
    throw new Error(envelope.error ?? "Request failed");
  }

  return envelope.data;
}
