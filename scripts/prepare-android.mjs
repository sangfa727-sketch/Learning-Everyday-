import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "www");
const allowed = /\.(?:html|css|js|svg|webmanifest|png|webp|jpe?g|ico|woff2?)$/i;
const excluded = new Set(["node_modules", ".git", "android", "www", "scripts", "tests", "coverage"]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
let copied = 0;
for (const entry of entries) {
  if (!entry.isFile() || excluded.has(entry.name) || !allowed.test(entry.name)) continue;
  await cp(path.join(root, entry.name), path.join(output, entry.name));
  copied += 1;
}
if (!copied) throw new Error("No web app assets were copied to www/.");

// Keep the existing launcher icon, but use one uppercase E for in-app identity marks.
for (const file of ["index.html", "study-path.html"]) {
  const target = path.join(output, file);
  let html = await readFile(target, "utf8");
  html = html
    .replace(/(<span class="brand-mark"[^>]*><span>)le(<\/span>)/g, "$1E$2")
    .replace(/(<div class="about-mark"[^>]*>)le(<\/div>)/g, "$1E$2")
    .replace(/(<span class="footer-mark"[^>]*>)le(<\/span>)/g, "$1E$2");
  await writeFile(target, html, "utf8");
}

for (const required of ["index.html", "styles.css", "app.js", "manifest.webmanifest", "icon.svg", "study-path.html", "writing-lab.html"]) {
  await access(path.join(output, required));
}
const entryHtml = await readFile(path.join(output, "index.html"), "utf8");
if (!entryHtml.includes('class="about-mark" aria-hidden="true">E</div>')) {
  throw new Error("Android package must show uppercase E in the in-app profile mark.");
}
console.log(`Prepared ${copied} root-level web assets in www/ for the Android wrapper; profile marks use E.`);
