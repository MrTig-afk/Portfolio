// Small client behaviours. Every page works without them (PRD section 5, branch "JS off").
import { sendMessage } from "./contact";
// Booted once per page load (native cross-document view transitions; no client router, so the CSP holds).

declare global { interface Window { va?: (...a: unknown[]) => void } }

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function theme() {
  const root = document.documentElement;
  const isDark = () => root.dataset.theme === "dark" || (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((b) => {
    b.hidden = false; // shown only when JS can make it work
    b.dataset.mode = isDark() ? "dark" : "light"; // CSS shows the sun in dark mode, the moon in light
    b.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
    b.onclick = () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch { /* private mode: choice lasts this page only */ }
      theme();
    };
  });
}

function footerScene() {
  const scene = document.querySelector<HTMLElement>("[data-scene]");
  if (!scene || reduceMotion()) return;
  const sheets = Array.from(scene.querySelectorAll<HTMLElement>(".sheet"));
  const rot = (s: HTMLElement) => parseFloat(getComputedStyle(s).getPropertyValue("--r")) || 0;
  const pull = (e: PointerEvent) => {
    const b = scene.getBoundingClientRect();
    const px = e.clientX - b.left, py = e.clientY - b.top;
    for (const s of sheets) {
      const dx = (px - (s.offsetLeft + s.offsetWidth / 2)) * 0.45;
      const dy = (py - (s.offsetTop + s.offsetHeight / 2)) * 0.45;
      s.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(rot(s) * 0.3).toFixed(1)}deg)`;
    }
  };
  const settle = () => sheets.forEach((s) => (s.style.transform = "")); // back to the CSS rotation
  scene.addEventListener("pointermove", pull);
  scene.addEventListener("pointerdown", pull);
  scene.addEventListener("pointerleave", settle);
  scene.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") setTimeout(settle, 700); });
}

function video() {
  const box = document.querySelector<HTMLElement>("[data-intro]");
  const v = box?.querySelector("video");
  const btn = box?.querySelector<HTMLButtonElement>(".play");
  if (!box || !v || !btn) return;
  btn.onclick = () => { v.muted = false; v.controls = true; v.play().catch(() => {}); btn.hidden = true; };
  v.addEventListener("error", () => v.remove(), { once: true }); // the poster image underneath stays
}

// Card videos play only while on screen, and never under reduced motion (the poster stays).
function cardVideos() {
  const vids = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-card]"));
  if (!vids.length || reduceMotion() || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
    }
  }, { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
}

function contactForm() {
  const form = document.querySelector<HTMLFormElement>("[data-contact]");
  if (!form) return;
  const state = form.querySelector<HTMLElement>("[data-state]")!;
  const show = (cls: string, text: string) => { state.hidden = false; state.className = `state ${cls}`; state.textContent = text; };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
    const data = new FormData(form);
    data.delete("redirect"); // the no-JS path's redirect; the JS path wants Web3Forms' JSON reply
    btn.disabled = true;
    show("", "Sending…");
    const ok = await sendMessage(data);
    btn.disabled = false;
    if (!ok) { show("bad", `That did not send. Email me at ${form.dataset.email} instead.`); return; }
    show("ok", `Message sent. I will reply to ${String(data.get("email"))}.`);
    window.va?.("event", { name: "form_sent" });
    form.reset();
    savePrompt();
  });
}

function savePrompt() {
  const tpl = document.querySelector<HTMLTemplateElement>("#save-prompt");
  if (!tpl || document.querySelector(".prompt")) return;
  try { if (sessionStorage.getItem("savePromptClosed")) return; } catch { /* fine */ }
  const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
  node.querySelector("[data-close]")?.addEventListener("click", () => {
    node.remove();
    try { sessionStorage.setItem("savePromptClosed", "1"); } catch { /* fine */ }
  });
  node.querySelector("a")?.addEventListener("click", () => setTimeout(() => node.remove(), 300));
  document.body.append(node);
}

function analytics() {
  document.addEventListener("click", (e) => {
    const el = (e.target as Element).closest<HTMLElement>("[data-event]");
    if (el) window.va?.("event", { name: el.dataset.event });
  });
}

export function boot() {
  theme();
  footerScene();
  video();
  cardVideos();
  contactForm();
  analytics();
  if (location.hash === "#sent") savePrompt(); // back from the no-JS form post
}
