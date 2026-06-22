import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface PendingUpload {
  id: string;
  blob: Blob;
  eventId: string;
  sessionId: string;
  filterId: string;
  challengeId: string | null;
  createdAt: number;
}

interface UploadQueueDB extends DBSchema {
  pending: {
    key: string;
    value: PendingUpload;
  };
}

let dbPromise: Promise<IDBPDatabase<UploadQueueDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<UploadQueueDB>("memo-upload-queue", 1, {
      upgrade(db) {
        db.createObjectStore("pending", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function enqueueUpload(item: Omit<PendingUpload, "id" | "createdAt">) {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.put("pending", { ...item, id, createdAt: Date.now() });
  return id;
}

export async function listPendingUploads(): Promise<PendingUpload[]> {
  const db = await getDb();
  return db.getAll("pending");
}

export async function removePendingUpload(id: string) {
  const db = await getDb();
  await db.delete("pending", id);
}

export type { PendingUpload };
