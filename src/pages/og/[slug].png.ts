import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Link-preview cards (PRD FR-META-2), drawn at build time in the paper look.
const font = (p: string) => readFileSync(new URL(`../../../node_modules/${p}`, import.meta.url));
const fonts = [
  { name: "Newsreader", data: font("@fontsource/newsreader/files/newsreader-latin-400-normal.woff"), weight: 400 as const },
  { name: "Geist Mono", data: font("@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff"), weight: 400 as const },
];

interface Card { kicker: string; title: string; foot: string }

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  const notes = await getCollection("notes", (n) => !n.data.draft && !n.data.external_url);
  const cards: { slug: string; card: Card }[] = [
    { slug: "home", card: { kicker: "mrtig.dev", title: "Kaushik Narumanchi", foot: "AI & Backend Engineer · Melbourne" } },
    { slug: "work", card: { kicker: "mrtig.dev / work", title: "Things I built and run", foot: `${projects.length} case studies` } },
    { slug: "notes", card: { kicker: "mrtig.dev / notes", title: "Notes", foot: "What I learned building these" } },
    { slug: "about", card: { kicker: "mrtig.dev / about", title: "About Kaushik", foot: "Experience, skills and resume" } },
    ...projects.map((p) => ({ slug: `work-${p.id}`, card: { kicker: "mrtig.dev / work", title: p.data.name, foot: `${p.data.kind} · ${p.data.key_number.value} ${p.data.key_number.label}` } })),
    ...notes.map((n) => ({ slug: `notes-${n.id}`, card: { kicker: "mrtig.dev / notes", title: n.data.title, foot: n.data.summary } })),
  ];
  return cards.map(({ slug, card }) => ({ params: { slug }, props: card }));
}

const el = (type: string, style: Record<string, unknown>, children: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { kicker, title, foot } = props as Card;
  const mono = { fontFamily: "Geist Mono", fontSize: 26, color: "#8a8278", letterSpacing: 1 };
  const tree = el("div", { width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#efe9df", borderBottom: "14px solid #a04a2c" }, [
    el("div", { ...mono, textTransform: "uppercase" }, kicker),
    el("div", { fontFamily: "Newsreader", fontSize: title.length > 40 ? 72 : 104, lineHeight: 1.05, color: "#22201c", letterSpacing: -1 }, title),
    el("div", { display: "flex", justifyContent: "space-between", ...mono }, [el("div", {}, foot.slice(0, 60)), el("div", {}, "Kaushik Narumanchi")]),
  ]);
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
