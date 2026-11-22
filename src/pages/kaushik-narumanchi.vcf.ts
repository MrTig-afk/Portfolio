import type { APIRoute } from "astro";
import { buildVCard } from "../lib/vcard";
import { SITE } from "../lib/site";

// The phone number lives only in Vercel's env (CONTACT_PHONE), never in the repo.
export const GET: APIRoute = () =>
  new Response(buildVCard({ ...SITE.contact, phone: process.env.CONTACT_PHONE ?? import.meta.env.CONTACT_PHONE }), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kaushik-narumanchi.vcf"',
    },
  });
