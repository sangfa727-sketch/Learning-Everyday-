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

// Explicitly configure Android 8+ adaptive launcher icons. This prevents the
// generated Capacitor template's default icon XML from overriding our artwork.
const adaptiveDir = path.join(androidRes, "mipmap-anydpi-v26");
await mkdir(adaptiveDir, { recursive: true });
const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
await writeFile(path.join(adaptiveDir, "ic_launcher.xml"), adaptiveIcon, "utf8");
await writeFile(path.join(adaptiveDir, "ic_launcher_round.xml"), adaptiveIcon, "utf8");

// Use the original icon on pre-Android-12 splash screens without stretching it.
const drawable = path.join(androidRes, "drawable");
await mkdir(drawable, { recursive: true });
const splashXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap android:src="@mipmap/ic_launcher" android:gravity="center" />
    </item>
</layer-list>
`;
await writeFile(path.join(drawable, "app_launch_splash.xml"), splashXml, "utf8");

// Point the app's base theme at the splash drawable for older Android versions.
const valuesDir = path.join(androidRes, "values");
await mkdir(valuesDir, { recursive: true });
const colorsPath = path.join(valuesDir, "colors.xml");
let colors = "";
try {
  colors = await readFile(colorsPath, "utf8");
} catch {
  colors = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
}
for (const [name, value] of [["ic_launcher_background", "#183b35"], ["splash_background", "#f5f7f3"]]) {
  const colorItem = new RegExp(`<color\\s+name=["']${name}["'][^>]*>[^<]*</color>`);
  const replacement = `<color name="${name}">${value}</color>`;
  if (colorItem.test(colors)) colors = colors.replace(colorItem, replacement);
  else colors = colors.replace("</resources>", `    ${replacement}\n</resources>`);
}
await writeFile(colorsPath, colors, "utf8");
const stylesPath = path.join(valuesDir, "styles.xml");
let styles = await readFile(stylesPath, "utf8");
const appThemeOpen = /(<style\b[^>]*name=["'][^"']*AppTheme[^"']*["'][^>]*>)/;
if (!appThemeOpen.test(styles)) {
  throw new Error("Could not find AppTheme in android/app/src/main/res/values/styles.xml");
}
const windowBackground = /<item\s+name=["']android:windowBackground["'][^>]*>[^<]*<\/item>/;
if (windowBackground.test(styles)) {
  styles = styles.replace(windowBackground, '<item name="android:windowBackground">@drawable/app_launch_splash</item>');
} else {
  styles = styles.replace(appThemeOpen, '$1\n        <item name="android:windowBackground">@drawable/app_launch_splash</item>');
}
await writeFile(stylesPath, styles, "utf8");

// Android 12+ splash attributes belong in values-v31 so older devices do not
// depend on API 31 theme attributes. Preserve the generated AppTheme parent.
const valuesV31 = path.join(androidRes, "values-v31");
await mkdir(valuesV31, { recursive: true });
const stylesV31Path = path.join(valuesV31, "styles.xml");
let stylesV31;
try {
  stylesV31 = await readFile(stylesV31Path, "utf8");
} catch {
  stylesV31 = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">#f5f7f3</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`;
}
const splashV31Items = [
  ["windowSplashScreenBackground", "#f5f7f3"],
  ["windowSplashScreenAnimatedIcon", "@mipmap/ic_launcher"]
];
for (const [name, value] of splashV31Items) {
  const item = new RegExp(`<item\\s+name=["'](?:android:)?${name}["'][^>]*>[^<]*</item>`);
  const replacement = `<item name="${name}">${value}</item>`;
  if (item.test(stylesV31)) {
    stylesV31 = stylesV31.replace(item, replacement);
  } else {
    stylesV31 = stylesV31.replace(/(<style\b[^>]*name=["'][^"']*AppTheme[^"']*["'][^>]*>)/, `$1\n        ${replacement}`);
  }
}
await writeFile(stylesV31Path, stylesV31, "utf8");

console.log("Applied icon.svg to raster/adaptive launcher icons and wired native splash screens for Android 7+ and Android 12+.");
