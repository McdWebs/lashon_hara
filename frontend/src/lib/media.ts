export type MediaWorld = "idf" | "ambassadors";
export type MediaItem = { id: string; kind: "photo" | "video"; src: string; caption?: string };

/** What the Activity page shows for a section. Empty when nothing has been uploaded yet. */
export async function fetchMedia(world: MediaWorld): Promise<MediaItem[]> {
  const res = await fetch(`/api/media/${world}`);
  if (!res.ok) throw new Error("media_unavailable");
  return ((await res.json()) as { items: MediaItem[] }).items;
}

const TOKEN_KEY = "lh-admin-token";

export const adminToken = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private mode: the login just lasts until the page reloads */
    }
  },
};

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", ...(init.headers as Record<string, string> | undefined) };
  if (init.body) headers["Content-Type"] = "application/json";
  const token = adminToken.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api/admin${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401 && path !== "/login") adminToken.set(null);
  if (!res.ok) throw new Error(data.error ?? "request_failed");
  return data;
}

export type AdminList = { storage: boolean; items: Array<Required<MediaItem>> };

export const adminApi = {
  login: (password: string) => adminRequest<{ token: string }>("/login", { method: "POST", body: JSON.stringify({ password }) }),
  list: (world: MediaWorld) => adminRequest<AdminList>(`/media/${world}`),
  setCaption: (id: string, caption: string) => adminRequest(`/media/${id}`, { method: "PATCH", body: JSON.stringify({ caption }) }),
  reorder: (world: MediaWorld, ids: string[]) => adminRequest("/media-order", { method: "PUT", body: JSON.stringify({ world, ids }) }),
  remove: (id: string) => adminRequest(`/media/${id}`, { method: "DELETE" }),
};

export const MAX_PHOTO = 10 * 1024 * 1024;
export const MAX_VIDEO = 150 * 1024 * 1024;
export const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

/** Sends one file straight to the storage bucket, then records it. Reports progress from 0 to 1. */
export async function uploadMedia(world: MediaWorld, file: File, onProgress: (fraction: number) => void) {
  const signed = await adminRequest<{ uploadUrl: string; key: string }>("/uploads/sign", {
    method: "POST",
    body: JSON.stringify({ world, contentType: file.type, size: file.size }),
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("upload_failed")));
    xhr.onerror = () => reject(new Error("upload_failed"));
    xhr.send(file);
  });

  await adminRequest("/media", { method: "POST", body: JSON.stringify({ world, key: signed.key, contentType: file.type }) });
}
