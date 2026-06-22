import { print, type DocumentNode } from "graphql";
import { getGraphqlUrl } from "@/lib/config/nhost";

export async function executeGraphQL<T>(
  document: DocumentNode | string,
  variables: Record<string, unknown>,
  accessToken: string
): Promise<T> {
  const query = typeof document === "string" ? document : print(document);
  const response = await fetch(getGraphqlUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? "GraphQL request failed");
  }

  if (!body.data) {
    throw new Error("GraphQL returned no data");
  }

  return body.data;
}
