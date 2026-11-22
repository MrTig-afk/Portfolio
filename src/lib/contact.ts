// The one place a message leaves the site (PRD swap point: replace Web3Forms here only).
export const FORM_ENDPOINT = "https://api.web3forms.com/submit";

export async function sendMessage(data: FormData, f: typeof fetch = fetch): Promise<boolean> {
  // Honeypot filled: send nothing and show the generic failure (kept rule: never claim it went through).
  if (data.get("botcheck")) return false;
  try {
    const r = await f(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
      // AbortSignal.timeout is missing before Safari 16 (iOS 15); without it the request simply has no timeout.
      signal: "timeout" in AbortSignal ? AbortSignal.timeout(15000) : undefined,
    });
    const body = await r.json().catch(() => null);
    return r.ok && body?.success === true;
  } catch {
    return false;
  }
}
