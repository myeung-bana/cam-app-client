/** Client-side join code validation — mirrors cam-app-nhost/functions/_lib/join-code.ts */
export function isValidJoinCode(code: string): boolean {
  return /^[A-Za-z0-9]{8,12}$/.test(code);
}
