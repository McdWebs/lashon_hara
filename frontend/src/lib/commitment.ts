const STORAGE_KEY = "lh_commitment_signed";

export type StoredCommitment = {
  email: string;
  firstName: string;
  signedAt: string;
};

export function normalizeCommitmentEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStoredCommitment(): StoredCommitment | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCommitment;
    if (!parsed.email || !parsed.firstName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeCommitment(data: { email: string; firstName: string }) {
  const entry: StoredCommitment = {
    email: normalizeCommitmentEmail(data.email),
    firstName: data.firstName.trim(),
    signedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export async function fetchCommitmentStatus(
  email: string,
): Promise<{ signed: boolean; firstName?: string }> {
  const normalized = normalizeCommitmentEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return { signed: false };
  }

  try {
    const res = await fetch(`/api/stats/commitment-status?email=${encodeURIComponent(normalized)}`);
    if (!res.ok) return { signed: false };
    return (await res.json()) as { signed: boolean; firstName?: string };
  } catch {
    return { signed: false };
  }
}
