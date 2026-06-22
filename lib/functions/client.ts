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
  const base = getFunctionsUrl();

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
    throw new Error(
      envelope.error ??
        (response.status === 400
          ? "Invalid join code — check the code and try again"
          : "Request failed")
    );
  }

  return envelope.data;
}

function getFunctionsUrl(): string {
  // Browser calls use same-origin proxy to avoid Nhost Functions CORS preflight.
  if (typeof window !== "undefined") {
    return "/api/functions";
  }

  if (process.env.NEXT_PUBLIC_FUNCTIONS_URL) {
    return process.env.NEXT_PUBLIC_FUNCTIONS_URL.replace(/\/$/, "");
  }

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;

  if (subdomain && region) {
    return `https://${subdomain}.functions.${region}.nhost.run/v1`;
  }

  throw new Error(
    "Missing NEXT_PUBLIC_FUNCTIONS_URL or NEXT_PUBLIC_NHOST_SUBDOMAIN + NEXT_PUBLIC_NHOST_REGION"
  );
}
