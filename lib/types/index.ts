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
  eventId: string;
  title: string;
  description: string;
  icon: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface GuestMedia {
  id: string;
  eventId: string;
  fileUrl: string;
  storageFileId?: string | null;
  fileType: "photo" | "video";
  filterApplied: string | null;
  challengeId: string | null;
  uploadedAt: string;
  isHidden: boolean;
  isStarred: boolean;
}

export interface CaptureFilter {
  id: string;
  label: string;
  css: string;
}
