import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidRes = path.join(root, "android", "app", "src", "main", "res");
const svg = await readFile(path.join(root, "icon.svg"));
const densities = [
  { name: "mdpi", size: 48, foreground: 108 },
  { name: "hdpi", size: 72, foreground: 162 },
  { name: "xhdpi", size: 96, foreground: 216 },
  { name: "xxhdpi", size: 144, foreground: 324 },
  { name: "xxxhdpi", size: 192, foreground: 432 }
];

for (const density of densities) {
  const directory = path.join(androidRes, `mipmap-${density.name}`);
  await mkdir(directory, { recursive: true });
  const icon = await sharp(svg).resize(density.size, density.size).png().toBuffer();
  await sharp(icon).toFile(path.join(directory, "ic_launcher.png"));
  await sharp(icon).toFile(path.join(directory, "ic_launcher_round.png"));
  await sharp(svg).resize(density.foreground, density.foreground).png()
    .toFile(path.join(directory, "ic_launcher_foreground.png"));
}

console.log("Applied the existing icon.svg artwork to Android launcher icon resources.");
