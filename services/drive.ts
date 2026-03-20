import type { ConnectedAccount, FileMetadata, AccountQuota } from "@/types";

const CLOUDNEST_FOLDER = "_CloudNest_";

let gapiLoaded = false;
let gapiInitialized = false;

// ── gapi Loading ───────────────────────────────────────────
export function loadGapi(): Promise<void> {
  if (gapiLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cannot load gapi in non-browser environment"));
      return;
    }

    const existing = document.querySelector(
      'script[src*="apis.google.com/js/api.js"]',
    );
    if (existing) {
      gapiLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gapiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google API client"));
    document.head.appendChild(script);
  });
}

export async function initGapi(): Promise<void> {
  if (gapiInitialized) return;
  await loadGapi();

  return new Promise<void>((resolve, reject) => {
    gapi.load("client", {
      callback: async () => {
        try {
          await gapi.client.init({});
          gapiInitialized = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      onerror: () => reject(new Error("Failed to initialize gapi client")),
    });
  });
}

// ── Retry Logic ────────────────────────────────────────────
async function retryOnRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status =
        err instanceof Error && "status" in err
          ? (err as { status: number }).status
          : (err as { result?: { error?: { code?: number } } })?.result?.error
              ?.code;
      if (status === 429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delays[attempt] ?? 4000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

// ── File Operations ────────────────────────────────────────
export async function listFiles(
  token: string,
  query: string = "'me' in owners and trashed = false",
  pageSize: number = 1000,
): Promise<FileMetadata[]> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const items: FileMetadata[] = [];
  let pageToken: string | undefined;

  do {
    const response = await retryOnRateLimit(() =>
      gapi.client.request({
        path: "https://www.googleapis.com/drive/v3/files",
        params: {
          q: query,
          pageSize,
          pageToken,
          fields:
            "nextPageToken, files(id, name, size, mimeType, thumbnailLink, createdTime, parents)",
        },
      }),
    );

    const data = response.result as {
      nextPageToken?: string;
      files?: Array<{
        id: string;
        name: string;
        size?: string;
        mimeType?: string;
        thumbnailLink?: string;
        createdTime?: string;
        parents?: string[];
      }>;
    };

    for (const f of data.files ?? []) {
      items.push({
        driveFileId: f.id,
        fileName: f.name ?? "",
        accountEmail: "",
        size: parseInt(f.size ?? "0", 10),
        mimeType: f.mimeType ?? null,
        hasThumbnail: !!f.thumbnailLink,
        thumbnailLink: f.thumbnailLink ?? null,
        parentDriveFileId: f.parents?.[0] ?? null,
        createdAt: f.createdTime ?? "",
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

export async function getStorageQuota(
  token: string,
): Promise<{ used: number; limit: number; free: number }> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const response = await retryOnRateLimit(() =>
    gapi.client.request({
      path: "https://www.googleapis.com/drive/v3/about",
      params: { fields: "storageQuota" },
    }),
  );

  const quota = (response.result as { storageQuota: { usage?: string; limit?: string } })
    .storageQuota;
  const used = parseInt(quota.usage ?? "0", 10);
  const limit = parseInt(quota.limit ?? String(15 * 1024 ** 3), 10);

  return { used, limit, free: Math.max(0, limit - used) };
}

export async function renameFile(
  token: string,
  fileId: string,
  newName: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
      headers: { "Content-Type": "application/json" },
    }),
  );
}

export async function moveFile(
  token: string,
  fileId: string,
  newParentId: string,
  oldParentId?: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const params: Record<string, string> = { addParents: newParentId };
  if (oldParentId) {
    params.removeParents = oldParentId;
  }

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      method: "PATCH",
      params,
    }),
  );
}

export async function trashFile(
  token: string,
  fileId: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      method: "PATCH",
      body: JSON.stringify({ trashed: true }),
      headers: { "Content-Type": "application/json" },
    }),
  );
}

export async function restoreFile(
  token: string,
  fileId: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      method: "PATCH",
      body: JSON.stringify({ trashed: false }),
      headers: { "Content-Type": "application/json" },
    }),
  );
}

export async function deleteFile(
  token: string,
  fileId: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      method: "DELETE",
    }),
  );
}

export async function shareFile(
  token: string,
  fileId: string,
): Promise<string> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      method: "POST",
      body: JSON.stringify({ type: "anyone", role: "reader" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  const meta = await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      params: { fields: "webViewLink" },
    }),
  );

  const result = meta.result as { webViewLink?: string };
  return (
    result.webViewLink ??
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
  );
}

export async function unshareFile(
  token: string,
  fileId: string,
): Promise<void> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const perms = await retryOnRateLimit(() =>
    gapi.client.request({
      path: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      params: { fields: "permissions(id,type)" },
    }),
  );

  const result = perms.result as {
    permissions?: Array<{ id: string; type: string }>;
  };
  const anyoneId = result.permissions?.find((p) => p.type === "anyone")?.id;

  if (anyoneId) {
    await retryOnRateLimit(() =>
      gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${anyoneId}`,
        method: "DELETE",
      }),
    );
  }
}

export async function listTrash(
  token: string,
  accountEmail: string,
): Promise<FileMetadata[]> {
  return listFiles(
    token,
    "'me' in owners and trashed = true",
  ).then((files) => files.map((f) => ({ ...f, accountEmail })));
}

export async function listSharedFiles(
  token: string,
  accountEmail: string,
): Promise<
  (FileMetadata & { sharedBy: string | null })[]
> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const items: (FileMetadata & { sharedBy: string | null })[] = [];
  let pageToken: string | undefined;

  do {
    const response = await retryOnRateLimit(() =>
      gapi.client.request({
        path: "https://www.googleapis.com/drive/v3/files",
        params: {
          q: "not 'me' in owners and trashed = false",
          pageSize: 1000,
          pageToken,
          fields:
            "nextPageToken, files(id, name, size, mimeType, createdTime, owners)",
        },
      }),
    );

    const data = response.result as {
      nextPageToken?: string;
      files?: Array<{
        id: string;
        name: string;
        size?: string;
        mimeType?: string;
        createdTime?: string;
        owners?: Array<{ emailAddress?: string }>;
      }>;
    };

    for (const f of data.files ?? []) {
      items.push({
        driveFileId: f.id,
        fileName: f.name ?? "",
        accountEmail,
        size: parseInt(f.size ?? "0", 10),
        mimeType: f.mimeType ?? null,
        hasThumbnail: false,
        thumbnailLink: null,
        parentDriveFileId: null,
        createdAt: f.createdTime ?? "",
        sharedBy: f.owners?.[0]?.emailAddress ?? null,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

// ── Upload (REST API, not gapi.client) ─────────────────────
export function uploadFile(
  token: string,
  file: File,
  parentId?: string,
  onProgress?: (percent: number) => void,
): Promise<{ driveFileId: string; size: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const metadata: Record<string, unknown> = { name: file.name };
    if (parentId) metadata.parents = [parentId];

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,size,mimeType",
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText) as {
          id: string;
          size?: string;
          mimeType?: string;
        };
        resolve({
          driveFileId: result.id,
          size: parseInt(result.size ?? "0", 10),
          mimeType: result.mimeType ?? file.type,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(form);
  });
}

// ── Download (returns URL, never in-memory) ────────────────
export function getDownloadUrl(token: string, fileId: string): string {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${encodeURIComponent(token)}`;
}

// ── Sync All Files ─────────────────────────────────────────
export async function syncAllFiles(
  token: string,
  accountEmail: string,
): Promise<FileMetadata[]> {
  const files = await listFiles(token);
  return files.map((f) => ({ ...f, accountEmail }));
}

// ── Smart Account Routing ──────────────────────────────────
export function pickBestAccount(
  accounts: ConnectedAccount[],
): ConnectedAccount | null {
  const connected = accounts.filter(
    (a) => a.storageQuota.free > 0 && a.accessToken,
  );
  if (connected.length === 0) return null;
  return connected.reduce((best, current) =>
    current.storageQuota.free > best.storageQuota.free ? current : best,
  );
}

// ── Get or Create CloudNest Folder ─────────────────────────
export async function getOrCreateCloudNestFolder(
  token: string,
): Promise<string> {
  await initGapi();
  gapi.client.setToken({ access_token: token });

  const search = await retryOnRateLimit(() =>
    gapi.client.request({
      path: "https://www.googleapis.com/drive/v3/files",
      params: {
        q: `name='${CLOUDNEST_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id)",
      },
    }),
  );

  const searchResult = search.result as { files?: Array<{ id: string }> };
  const existingId = searchResult.files?.[0]?.id;
  if (existingId) {
    return existingId;
  }

  const create = await retryOnRateLimit(() =>
    gapi.client.request({
      path: "https://www.googleapis.com/drive/v3/files",
      method: "POST",
      body: JSON.stringify({
        name: CLOUDNEST_FOLDER,
        mimeType: "application/vnd.google-apps.folder",
      }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  return (create.result as { id: string }).id;
}

// ── Quota for all accounts ─────────────────────────────────
export async function getAllQuotas(
  accounts: ConnectedAccount[],
): Promise<AccountQuota[]> {
  const results = await Promise.allSettled(
    accounts.map(async (account) => {
      try {
        const quota = await getStorageQuota(account.accessToken);
        return {
          email: account.email,
          used: quota.used,
          limit: quota.limit,
          free: quota.free,
          isConnected: true,
        };
      } catch {
        return {
          email: account.email,
          used: 0,
          limit: 0,
          free: 0,
          isConnected: false,
        };
      }
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<AccountQuota> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
}
