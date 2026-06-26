import { createNhostClient } from "@nhost/nhost-js";
import {
  getAuthUrl,
  getFunctionsUrl,
  getGraphqlUrl,
  getStorageUrl,
  isNhostConfigured,
} from "@/lib/config/nhost";

let client: ReturnType<typeof createNhostClient> | null = null;

/** Browser singleton — guest app manages tokens in sessionStorage separately. */
export function getNhostBrowserClient() {
  if (!isNhostConfigured()) {
    throw new Error("Nhost is not configured");
  }

  if (!client) {
    client = createNhostClient({
      subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!,
      region: process.env.NEXT_PUBLIC_NHOST_REGION!,
      authUrl: getAuthUrl(),
      storageUrl: getStorageUrl(),
      graphqlUrl: getGraphqlUrl(),
      functionsUrl: getFunctionsUrl(),
      configure: [],
    });
  }

  return client;
}
