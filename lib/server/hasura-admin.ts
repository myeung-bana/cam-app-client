import "server-only";
import { print, type DocumentNode } from "graphql";
import { getGraphqlUrl } from "@/lib/config/nhost";
import { getNhostAdminSecret } from "@/lib/server/nhost-storage-server";

export async function executeHasuraAdmin<T>(
  document: DocumentNode | string,
  variables?: Record<string, unknown>
): Promise<T> {
  const query = typeof document === "string" ? document : print(document);
  const response = await fetch(getGraphqlUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": getNhostAdminSecret(),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? "Hasura admin request failed");
  }

  if (!body.data) {
    throw new Error("Hasura admin request returned no data");
  }

  return body.data;
}
