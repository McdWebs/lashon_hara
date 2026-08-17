export async function fetchCommitmentCount(): Promise<number | undefined> {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return undefined;
    const data = (await res.json()) as { live?: { commitments?: number } | null };
    return data.live?.commitments;
  } catch {
    return undefined;
  }
}
