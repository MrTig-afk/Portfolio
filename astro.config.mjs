// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://mrtig.dev",
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/og/") })],
  // Hash-based CSP in a <meta> per page (PRD section 10). frame-ancestors and the other
  // header-only directives are set in vercel.json.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
});
