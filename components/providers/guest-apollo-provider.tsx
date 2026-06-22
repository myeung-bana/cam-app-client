"use client";

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useMemo } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "";
const region = process.env.NEXT_PUBLIC_NHOST_REGION ?? "";
const graphqlUrl =
  subdomain && region
    ? `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`
    : "https://localhost.hasura.local/v1/graphql";
const wsUrl = graphqlUrl.replace("https://", "wss://");

export function GuestApolloProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useGuestSession();

  const client = useMemo(() => {
    const headers: Record<string, string> = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const httpLink = new HttpLink({ uri: graphqlUrl, headers });

    if (!accessToken) {
      return new ApolloClient({ link: httpLink, cache: new InMemoryCache() });
    }

    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsUrl,
        connectionParams: { headers },
      })
    );

    const link = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === "OperationDefinition" && def.operation === "subscription";
      },
      wsLink,
      httpLink
    );

    return new ApolloClient({ link, cache: new InMemoryCache() });
  }, [accessToken]);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
