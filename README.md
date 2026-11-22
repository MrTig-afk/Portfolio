# mrtig.dev

The personal site of Kaushik Narumanchi, AI and backend engineer in Melbourne: case studies of the systems he builds and runs, notes, and a one-tap way to get in touch.

Live: https://mrtig.dev

## Stack

- [Astro](https://astro.build) 7, static output, with MDX content collections
- Self-hosted fonts (Newsreader, Geist, Geist Mono), no third-party scripts
- Link-preview images drawn at build time with satori and resvg
- Hosted on Vercel; contact form through Web3Forms

## Run it locally

```bash
npm ci
npm run dev        # http://localhost:4321
```

| Command | Does |
|---|---|
| `npm run build` | builds the static site into `dist/` |
| `npm run lint` | type-checks the project with `astro check` |
| `npm test` | runs the unit tests (Vitest) |
| `node scripts/icons.mjs` | regenerates the favicon and app icons |

## Content

- Projects: `src/content/projects/<slug>.mdx` (one file per case study; the frontmatter schema is in `src/content.config.ts`)
- Notes: `src/content/notes/<slug>.md` (set `external_url` to link a post published elsewhere)
- Open source: `src/content/opensource.json`

The project pages show live facts (last push, latest release, merged PR count) read from the GitHub API at build time. If GitHub cannot be reached, the build still succeeds and those facts are left out. Set `GITHUB_TOKEN` in the build environment to raise the API rate limit.

The phone number in the downloadable contact card comes from the `CONTACT_PHONE` build environment variable and is never stored in this repository.
