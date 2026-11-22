export interface Contact {
  name: string;
  title: string;
  email: string;
  linkedin: string;
  url: string;
  phone?: string;
}

// RFC 2426 text escaping: backslash, comma, semicolon and newlines.
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");

/** vCard 3.0 with CRLF line endings. TEL is left out when no phone is configured (fail closed). */
export function buildVCard(c: Contact): string {
  const [first, ...rest] = c.name.split(" ");
  const last = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(c.name)}`,
    `TITLE:${esc(c.title)}`,
    `EMAIL;TYPE=INTERNET:${esc(c.email)}`,
    ...(c.phone?.trim() ? [`TEL;TYPE=CELL:${esc(c.phone.trim())}`] : []),
    `URL:${c.url}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${c.linkedin}`,
    "END:VCARD",
  ];
  return lines.join("\r\n") + "\r\n";
}
