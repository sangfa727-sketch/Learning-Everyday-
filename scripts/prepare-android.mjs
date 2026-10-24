import { cp, mkdir, readdir, rm } from "node:fs/promises";
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
for (const required of ["index.html", "styles.css", "app.js", "manifest.webmanifest", "icon.svg", "study-path.html", "writing-lab.html"]) {
  const { access } = await import("node:fs/promises");
  await access(path.join(output, required));
}
console.log(`Prepared ${copied} root-level web assets in www/ for the Android wrapper.`);
