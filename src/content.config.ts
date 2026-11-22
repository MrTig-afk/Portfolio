import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({
  kind: z.enum(["live", "github", "npm", "vscode", "demo", "docs"]),
  url: z.string().url(),
  label: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    kind: z.string(),
    year: z.number().int(),
    summary: z.string().max(140),
    stack: z.array(z.string()),
    key_number: z.object({ value: z.string(), label: z.string() }),
    featured: z.boolean(),
    order: z.number().int(),
    repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).nullable(),
    links: z.array(link),
    card_video: z.string().nullable(),
    poster: z.string(),
    logo: z.string(),
    status: z.enum(["live", "shipped", "archived"]),
    figure: z.object({ src: z.string(), alt: z.string(), caption: z.string() }).nullable(),
    arch: z.array(z.string()),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    external_url: z.string().url().nullable(),
    draft: z.boolean().default(false),
  }),
});

const opensource = defineCollection({
  loader: file("./src/content/opensource.json"),
  schema: z.object({
    repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
    description: z.string(),
    author: z.string(),
  }),
});

export const collections = { projects, notes, opensource };
