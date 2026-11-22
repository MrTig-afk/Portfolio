import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const notes = (await getCollection("notes", (n) => !n.data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: "Notes by Kaushik Narumanchi",
    description: "What I learned building my projects, including what broke.",
    site: context.site!,
    items: notes.map((n) => ({
      title: n.data.title,
      pubDate: n.data.date,
      description: n.data.summary,
      link: n.data.external_url ?? `/notes/${n.id}`,
    })),
  });
}
