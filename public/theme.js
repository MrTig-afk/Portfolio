// Theme before first paint: a saved choice wins, else the device setting (CSS) decides.
// A file, not an inline script, so the hash-based CSP allows it through 'self'.
try { var t = localStorage.getItem("theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch (e) {}
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
