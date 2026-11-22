import { describe, expect, it } from "vitest";
import { getMergedPRs, getRepoFacts } from "./github";

const res = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const fake = (map: Record<string, Response | Error>) =>
  (async (url: string) => {
    const hit = Object.keys(map).find((k) => url.includes(k));
    const v = hit ? map[hit] : res(404, {});
    if (v instanceof Error) throw v;
    return v.clone();
  }) as unknown as typeof fetch;

describe("getRepoFacts", () => {
  it("returns push date and release tag", async () => {
    const f = fake({ "/releases/latest": res(200, { tag_name: "v1.0.0" }), "/repos/a/b": res(200, { pushed_at: "2026-11-19T01:00:00Z" }) });
    const facts = await getRepoFacts("a/b", f);
    expect(facts?.pushedAt.toISOString()).toBe("2026-11-19T01:00:00.000Z");
    expect(facts?.release).toBe("v1.0.0");
  });

  it("returns null on a failed or garbled response, never a fake value", async () => {
    expect(await getRepoFacts("a/b", fake({ "/repos/a/b": res(403, { message: "rate limit" }) }))).toBeNull();
    expect(await getRepoFacts("a/b", fake({ "/repos/a/b": new Error("offline") }))).toBeNull();
    expect(await getRepoFacts("a/b", fake({ "/repos/a/b": res(200, { pushed_at: "not a date" }) }))).toBeNull();
  });

  it("keeps the push date when there is no release", async () => {
    const facts = await getRepoFacts("a/b", fake({ "/repos/a/b": res(200, { pushed_at: "2026-10-26T00:00:00Z" }) }));
    expect(facts?.release).toBeNull();
  });
});

describe("getMergedPRs", () => {
  it("returns the count and only github.com PR links", async () => {
    const f = fake({ "/search/issues": res(200, { total_count: 11, items: [{ title: "Sync", html_url: "https://github.com/o/r/pull/1" }, { title: "Bad", html_url: "javascript:alert(1)" }] }) });
    expect(await getMergedPRs("o/r", "me", f)).toEqual({ count: 11, prs: [{ title: "Sync", url: "https://github.com/o/r/pull/1" }] });
  });

  it("returns null when the search fails", async () => {
    expect(await getMergedPRs("o/r", "me", fake({ "/search/issues": res(422, {}) }))).toBeNull();
  });
});
