import type { Challenge, GuestMedia } from "@/lib/types";

export interface ChallengeRow {
  id: string;
  event_id: string;
  title: string;
  description: string;
  icon: string;
  is_required: boolean;
  sort_order: number;
}

export interface GuestMediaRow {
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

export function mapChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    isRequired: row.is_required,
    sortOrder: row.sort_order,
  };
}

export function mapGuestMedia(row: GuestMediaRow): GuestMedia {
  return {
    id: row.id,
    eventId: row.event_id,
    fileUrl: row.file_url,
    storageFileId: row.storage_file_id ?? null,
    fileType: row.file_type,
    filterApplied: row.filter_applied,
    challengeId: row.challenge_id,
    uploadedAt: row.uploaded_at,
    isHidden: row.is_hidden,
    isStarred: row.is_starred,
  };
}
