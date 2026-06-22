const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "";
const region = process.env.NEXT_PUBLIC_NHOST_REGION ?? "";

export function getFunctionsUrl(): string {
  if (process.env.NEXT_PUBLIC_FUNCTIONS_URL) {
    return process.env.NEXT_PUBLIC_FUNCTIONS_URL.replace(/\/$/, "");
  }
  if (subdomain && region) {
    return `https://${subdomain}.functions.${region}.nhost.run/v1`;
  }
  throw new Error("Missing NEXT_PUBLIC_FUNCTIONS_URL or Nhost subdomain/region");
}

export function getGraphqlUrl(): string {
  if (process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_GRAPHQL_URL;
  }
  if (subdomain && region) {
    return `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;
  }
  throw new Error("Missing GraphQL URL configuration");
}

export function getAuthUrl(): string {
  if (process.env.NEXT_PUBLIC_AUTH_URL) {
    return process.env.NEXT_PUBLIC_AUTH_URL.replace(/\/$/, "");
  }
  if (subdomain && region) {
    return `https://${subdomain}.auth.${region}.nhost.run/v1`;
  }
  throw new Error("Missing Auth URL configuration");
}

export function getStorageUrl(): string {
  if (process.env.NEXT_PUBLIC_STORAGE_URL) {
    return process.env.NEXT_PUBLIC_STORAGE_URL.replace(/\/$/, "");
  }
  if (subdomain && region) {
    return `https://${subdomain}.storage.${region}.nhost.run/v1`;
  }
  throw new Error("Missing Storage URL configuration");
}

export function getStorageBucket(): string {
  return process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "cam-bucket";
}

export function isNhostConfigured(): boolean {
  return Boolean(subdomain && region);
}
