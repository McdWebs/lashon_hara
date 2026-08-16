export async function submitForm(
  kind: string,
  sourcePath: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; saved: boolean }> {
  try {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sourcePath, payload }),
    });
    return { ok: res.ok, saved: res.ok };
  } catch {
    return { ok: false, saved: false };
  }
}
