import { mkdir, readFile, writeFile } from "node:fs/promises";
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

// Provide the same original artwork to the pre-Android-12 launch screen.
// Keep the logo centered on the app's light background rather than stretching it full-screen.
const drawable = path.join(androidRes, "drawable");
await mkdir(drawable, { recursive: true });
const splashIcon = await sharp(svg).resize(192, 192).png().toBuffer();
await sharp({
  create: { width: 432, height: 768, channels: 4, background: "#f5f7f3" }
})
  .composite([{ input: splashIcon, left: 120, top: 288 }])
  .png()
  .toFile(path.join(drawable, "splash.png"));

// Android 12+ reads its launch icon/background from the app theme.
const valuesDir = path.join(androidRes, "values");
await mkdir(valuesDir, { recursive: true });
const stylesPath = path.join(valuesDir, "styles.xml");
let styles = await readFile(stylesPath, "utf8");
const splashItems = [
  ['windowSplashScreenBackground', '#f5f7f3'],
  ['windowSplashScreenAnimatedIcon', '@mipmap/ic_launcher']
];
for (const [name, value] of splashItems) {
  const item = new RegExp(`<item\\s+name=["'](?:android:)?${name}["'][^>]*>[^<]*</item>`);
  const replacement = `<item name="android:${name}">${value}</item>`;
  if (item.test(styles)) {
    styles = styles.replace(item, replacement);
  } else {
    styles = styles.replace(/(<style\\b[^>]*name=["'][^"']*AppTheme[^"']*["'][^>]*>)/, `$1\\n        ${replacement}`);
  }
}
await writeFile(stylesPath, styles, "utf8");

console.log("Applied the existing icon.svg artwork to Android launcher icons and native launch screens.");
