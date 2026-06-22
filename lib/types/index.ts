export type EntryState =
  | "not_found"
  | "disabled"
  | "countdown"
  | "live"
  | "ended"
  | "cap_full";

export interface PublicEvent {
  id: string;
  name: string;
  eventType: string;
  startTime: string;
  endTime: string;
  venueName: string | null;
  accentColor: string | null;
  coverImageUrl: string | null;
  status: string;
}

export interface ResolveJoinResult {
  entryState: EntryState;
  event: PublicEvent | null;
  activeAttendees: number;
  maxAttendees: number;
}

export interface EnterJoinResult {
  entryState: EntryState;
  guestSessionId: string;
  user: {
    id: string;
    displayName?: string;
    defaultRole?: string;
  };
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
}

export interface GuestSessionRecord {
  accessToken: string;
  refreshToken: string;
  guestSessionId: string;
  eventId: string;
  joinCode: string;
  userId: string;
  displayName?: string;
  expiresAt: number;
}

export interface Challenge {
  id: string;
  event_id: string;
  title: string;
  description: string;
  icon: string;
  is_required: boolean;
  sort_order: number;
}

export interface GuestMedia {
  id: string;
  event_id: string;
  file_url: string;
  storage_file_id?: string | null;
  file_type: "photo" | "video";
  filter_applied: string | null;
  challenge_id: string | null;
  uploaded_at: string;
  is_hidden: boolean;
  is_starred: boolean;
}

export interface CaptureFilter {
  id: string;
  label: string;
  css: string;
}
