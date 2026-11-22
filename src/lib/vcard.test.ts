import { describe, expect, it } from "vitest";
import { buildVCard } from "./vcard";

const base = {
  name: "Kaushik Narumanchi",
  title: "AI & Backend Engineer",
  email: "kaushiknaru2002@gmail.com",
  linkedin: "https://www.linkedin.com/in/kaushikn2002",
  url: "https://mrtig.dev",
};

describe("buildVCard", () => {
  it("writes a vCard 3.0 with CRLF line endings and split name", () => {
    const v = buildVCard(base);
    expect(v.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(v.endsWith("END:VCARD\r\n")).toBe(true);
    expect(v).toContain("N:Narumanchi;Kaushik;;;\r\n");
    expect(v).not.toMatch(/[^\r]\n/);
  });

  it("leaves TEL out when no phone is configured", () => {
    expect(buildVCard(base)).not.toContain("TEL");
    expect(buildVCard({ ...base, phone: "  " })).not.toContain("TEL");
    expect(buildVCard({ ...base, phone: "+61 400 000 000" })).toContain("TEL;TYPE=CELL:+61 400 000 000\r\n");
  });

  it("escapes commas, semicolons and backslashes in text fields", () => {
    expect(buildVCard({ ...base, title: "AI, Backend; Data\\Ops" })).toContain("TITLE:AI\\, Backend\\; Data\\\\Ops\r\n");
  });
});
