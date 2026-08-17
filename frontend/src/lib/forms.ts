export type SubmitFormResult = {
  ok: boolean;
  saved: boolean;
  error?: "already_signed" | "database_unavailable" | "invalid_payload";
  firstName?: string;
};

export async function submitForm(
  kind: string,
  sourcePath: string,
  payload: Record<string, unknown>,
): Promise<SubmitFormResult> {
  try {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sourcePath, payload }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      firstName?: string;
    };

    if (res.status === 409 && data.error === "already_signed") {
      return {
        ok: false,
        saved: false,
        error: "already_signed",
        firstName: data.firstName,
      };
    }

    return { ok: res.ok, saved: res.ok };
  } catch {
    return { ok: false, saved: false };
  }
}
