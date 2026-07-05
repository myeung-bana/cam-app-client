/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkFirst, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/guest/upload"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/functions"),
    handler: new NetworkFirst({
      cacheName: "api-network-first",
      networkTimeoutSeconds: 10,
    }),
  },
  {
    matcher: ({ url }) =>
      url.hostname.includes("hasura") ||
      url.hostname.includes("nhost.run") ||
      url.pathname.includes("/graphql"),
    handler: new NetworkFirst({
      cacheName: "graphql-network-first",
      networkTimeoutSeconds: 10,
    }),
  },
  {
    matcher: ({ request }) =>
      request.destination === "image" ||
      request.destination === "font" ||
      request.destination === "style",
    handler: new CacheFirst({
      cacheName: "static-assets",
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();
