// Live facts from the GitHub REST API at build time (PRD FR-LIVE). Every failure returns null:
// the page then leaves the fact out, never shows a stale or invented number.

type Fetch = typeof fetch;
const API = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mrtig-site-build" };
  const token = import.meta.env?.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function getJson(url: string, f: Fetch): Promise<any | null> {
  try {
    const r = await f(url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export interface RepoFacts { pushedAt: Date; release: string | null }

export async function getRepoFacts(repo: string, f: Fetch = fetch): Promise<RepoFacts | null> {
  const r = await getJson(`${API}/repos/${repo}`, f);
  const pushed = r?.pushed_at ? new Date(r.pushed_at) : null;
  if (!pushed || Number.isNaN(pushed.getTime())) return null;
  const rel = await getJson(`${API}/repos/${repo}/releases/latest`, f);
  return { pushedAt: pushed, release: typeof rel?.tag_name === "string" ? rel.tag_name : null };
}

export interface MergedPRs { count: number; prs: { title: string; url: string }[] }

export async function getMergedPRs(repo: string, author: string, f: Fetch = fetch): Promise<MergedPRs | null> {
  const q = encodeURIComponent(`repo:${repo} author:${author} is:pr is:merged`);
  const r = await getJson(`${API}/search/issues?q=${q}&sort=updated&order=desc&per_page=5`, f);
  if (typeof r?.total_count !== "number" || !Array.isArray(r.items)) return null;
  return {
    count: r.total_count,
    prs: r.items
      .filter((i: any) => typeof i?.title === "string" && typeof i?.html_url === "string" && i.html_url.startsWith("https://github.com/"))
      .map((i: any) => ({ title: i.title, url: i.html_url })),
  };
}

// One request per repo per build, however many pages show the same facts.
const memo = new Map<string, Promise<unknown>>();
const once = <T>(key: string, run: () => Promise<T>) => {
  if (!memo.has(key)) memo.set(key, run());
  return memo.get(key) as Promise<T>;
};
export const getProjectFacts = (repo: string | null) => (repo ? once(`r:${repo}`, () => getRepoFacts(repo)) : Promise.resolve(null));
export const getOpenSource = (repo: string, author: string) => once(`p:${repo}:${author}`, () => getMergedPRs(repo, author));

export const fmtDate = (d: Date) => d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Melbourne" });
