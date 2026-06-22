import { NextRequest, NextResponse } from "next/server";

function getFunctionsBase(): string {
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

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const target = new URL(`${getFunctionsBase()}/${path.join("/")}`);
  target.search = req.nextUrl.search;

  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  const authorization = req.headers.get("authorization");
  if (authorization) {
    headers.Authorization = authorization;
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    init.body = await req.text();
  }

  const upstream = await fetch(target.toString(), init);
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) {
    responseHeaders.set("Content-Type", upstreamType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const OPTIONS = proxy;
