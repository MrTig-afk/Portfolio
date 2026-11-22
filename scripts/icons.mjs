// Generates the favicon and app icons (a serif K on paper) into public/. Run: node scripts/icons.mjs
// The K is turned into paths by satori, so the icon never depends on an installed font.
import { readFileSync, writeFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const font = readFileSync(new URL("../node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff", import.meta.url));
// Optical nudge so the K's ink box sits on the tile's centre (measured on the 512 px render, see validation notes).
const NUDGE = { x: -8, y: 35.5 };

async function tile(size, { pad = 0, radius = 0.22 } = {}) {
  const inner = size - pad * 2;
  const tree = {
    type: "div",
    props: {
      style: { width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: pad ? "#efe9df" : "transparent" },
      children: {
        type: "div",
        props: {
          style: { width: inner, height: inner, borderRadius: inner * radius, background: "#efe9df", border: `${Math.max(1, inner / 40)}px solid #a04a2c`, display: "flex", alignItems: "center", justifyContent: "center" },
          children: { type: "div", props: { style: { fontFamily: "Newsreader", fontSize: inner * 0.68, color: "#22201c", lineHeight: 1, transform: `translate(${(NUDGE.x * inner) / 512}px, ${(NUDGE.y * inner) / 512}px)` }, children: "K" } },
        },
      },
    },
  };
  return satori(tree, { width: size, height: size, fonts: [{ name: "Newsreader", data: font, weight: 500 }] });
}

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
const out = (name, data) => writeFileSync(new URL(`../public/${name}`, import.meta.url), data);

const base = await tile(512);
out("favicon.svg", base);
out("favicon-32.png", png(base, 32));
out("apple-touch-icon.png", png(await tile(512, { pad: 0, radius: 0 }), 180));
out("icon-192.png", png(base, 192));
out("icon-512.png", png(base, 512));
out("icon-maskable-512.png", png(await tile(512, { pad: 100, radius: 0.22 }), 512)); // safe-zone padding
console.log("icons written");
