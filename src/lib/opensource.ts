import { getCollection } from "astro:content";
import { getOpenSource } from "./github";

// The open-source entries with their live merged-PR facts (null facts when GitHub is unreachable).
export async function openSource() {
  const repos = await getCollection("opensource");
  const list = await Promise.all(repos.map(async (r) => ({ ...r.data, merged: await getOpenSource(r.data.repo, r.data.author) })));
  return list.sort((a, b) => (b.merged?.count ?? 0) - (a.merged?.count ?? 0)); // biggest contribution first
}
