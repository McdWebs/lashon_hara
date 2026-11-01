export type SubmitFormResult = {
  ok: boolean;
  saved: boolean;
  error?: "already_signed" | "database_unavailable" | "invalid_payload" | "captcha_failed";
  firstName?: string;
};

export async function submitForm(
  kind: string,
  sourcePath: string,
  payload: Record<string, unknown>,
  captchaToken?: string,
): Promise<SubmitFormResult> {
  try {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sourcePath, payload, captchaToken }),
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

    if (data.error === "captcha_failed") return { ok: false, saved: false, error: "captcha_failed" };

    return { ok: res.ok, saved: res.ok };
  } catch {
    return { ok: false, saved: false };
  }
}
