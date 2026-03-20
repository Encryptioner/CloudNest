import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { FileMetadata } from "@/types";

interface CloudNestDB extends DBSchema {
  files: {
    key: string;
    value: FileMetadata;
    indexes: { "by-account": string };
  };
  meta: {
    key: string;
    value: { key: string; timestamp: number };
  };
}

const DB_NAME = "cloudnest";
const DB_VERSION = 1;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let dbPromise: Promise<IDBPDatabase<CloudNestDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CloudNestDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CloudNestDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const fileStore = db.createObjectStore("files", {
          keyPath: "driveFileId",
        });
        fileStore.createIndex("by-account", "accountEmail");
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function cacheFiles(
  accountEmail: string,
  files: FileMetadata[],
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["files", "meta"], "readwrite");
  const fileStore = tx.objectStore("files");
  const metaStore = tx.objectStore("meta");

  // Remove old files for this account
  const index = fileStore.index("by-account");
  let cursor = await index.openCursor(accountEmail);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Insert new files
  for (const file of files) {
    await fileStore.put(file);
  }

  // Update sync timestamp
  await metaStore.put({ key: "lastSync", timestamp: Date.now() });
  await tx.done;
}

export async function getCachedFiles(
  accountEmail?: string,
): Promise<FileMetadata[]> {
  const db = await getDB();
  if (accountEmail) {
    return db.getAllFromIndex("files", "by-account", accountEmail);
  }
  return db.getAll("files");
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["files", "meta"], "readwrite");
  await tx.objectStore("files").clear();
  await tx.objectStore("meta").clear();
  await tx.done;
}

export async function isCacheStale(): Promise<boolean> {
  const db = await getDB();
  const meta = await db.get("meta", "lastSync");
  if (!meta) return true;
  return Date.now() - meta.timestamp > CACHE_TTL_MS;
}

export async function getLastSyncTime(): Promise<number | null> {
  const db = await getDB();
  const meta = await db.get("meta", "lastSync");
  return meta?.timestamp ?? null;
}
