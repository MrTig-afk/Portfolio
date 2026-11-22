import { describe, expect, it, vi } from "vitest";
import { FORM_ENDPOINT, sendMessage } from "./contact";

const form = (extra: Record<string, string> = {}) => {
  const d = new FormData();
  d.set("name", "Priya");
  d.set("email", "priya@example.com");
  d.set("message", "Hello");
  for (const [k, v] of Object.entries(extra)) d.set(k, v);
  return d;
};

describe("sendMessage", () => {
  it("posts to Web3Forms and reports success only when the service says so", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    expect(await sendMessage(form(), f as unknown as typeof fetch)).toBe(true);
    expect(f).toHaveBeenCalledWith(FORM_ENDPOINT, expect.objectContaining({ method: "POST" }));
    const no = async () => new Response(JSON.stringify({ success: false }), { status: 200 });
    expect(await sendMessage(form(), no as unknown as typeof fetch)).toBe(false);
  });

  it("reports failure on a network error or a non-JSON reply", async () => {
    expect(await sendMessage(form(), (async () => { throw new Error("offline"); }) as unknown as typeof fetch)).toBe(false);
    expect(await sendMessage(form(), (async () => new Response("oops", { status: 500 })) as unknown as typeof fetch)).toBe(false);
  });

  it("sends nothing and reports failure when the honeypot is filled", async () => {
    const f = vi.fn();
    expect(await sendMessage(form({ botcheck: "on" }), f as unknown as typeof fetch)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
});
