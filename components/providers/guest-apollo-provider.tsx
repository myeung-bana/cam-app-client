"use client";

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useEffect, useMemo, useRef } from "react";
import { useGuestSession } from "@/contexts/guest-session-context";
import { getGraphqlUrl, isNhostConfigured } from "@/lib/config/nhost";

function resolveGraphqlUrl(): string {
  if (isNhostConfigured()) {
    return getGraphqlUrl();
  }
  return "https://localhost.hasura.local/v1/graphql";
}

const graphqlUrl = resolveGraphqlUrl();
const wsUrl = graphqlUrl.replace("https://", "wss://");

function createStableClient(tokenRef: React.RefObject<string | null>) {
  const authLink = setContext((_, { headers }) => {
    const token = tokenRef.current;
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const httpLink = new HttpLink({ uri: graphqlUrl });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      connectionParams: () => {
        const token = tokenRef.current;
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      },
    })
  );

  const link = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === "OperationDefinition" && def.operation === "subscription";
    },
    wsLink,
    authLink.concat(httpLink)
  );

  return new ApolloClient({ link, cache: new InMemoryCache() });
}

export function GuestApolloProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useGuestSession();
  const tokenRef = useRef<string | null>(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  const client = useMemo(() => createStableClient(tokenRef), []);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
