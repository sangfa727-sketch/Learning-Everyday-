import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const exists = async (file) => {
  try {
    await access(path.join(root, file));
    return true;
  } catch {
    return false;
  }
};

test("PWA manifest is valid and points to local install assets", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.name, "Learning Everyday");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.start_url, "start_url must be set");
  assert.ok(manifest.scope, "scope must be set");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "at least one app icon is required");

  for (const icon of manifest.icons) {
    assert.ok(icon.src && !/^https?:/i.test(icon.src), "app icons should be bundled locally");
    assert.ok(await exists(icon.src.replace(/^\.\//, "")), `manifest icon missing: ${icon.src}`);
  }
});

test("every local asset in the service-worker app shell exists", async () => {
  const sw = await read("sw.js");
  const match = sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/);
  assert.ok(match, "service worker must declare APP_SHELL");
  const assets = JSON.parse(match[1]);
  assert.ok(assets.includes("./index.html"), "offline shell must cache index.html");
  assert.ok(assets.includes("./manifest.webmanifest"), "offline shell must cache the manifest");
  assert.ok(assets.includes("./styles.css"), "offline shell must cache the stylesheet");
  assert.equal(new Set(assets).size, assets.length, "app shell must not contain duplicate paths");

  for (const asset of assets) {
    const localPath = asset.replace(/^\.\//, "") || "index.html";
    assert.ok(await exists(localPath), `service-worker app-shell asset missing: ${asset}`);
  }
});

test("entry HTML references existing local resources", async () => {
  const html = await read("index.html");
  const refs = [...html.matchAll(/\b(?:href|src)="(\.\/[^"?#]*)"/g)].map((match) => match[1]);
  assert.ok(refs.includes("./styles.css"), "entry page must load the main stylesheet");
  assert.ok(refs.includes("./manifest.webmanifest"), "entry page must link the PWA manifest");

  for (const ref of refs) {
    const localPath = ref.replace(/^\.\//, "") || "index.html";
    assert.ok(await exists(localPath), `entry HTML local resource missing: ${ref}`);
  }
});

test("service worker uses a versioned cache and only targets the app's cache namespace", async () => {
  const sw = await read("sw.js");
  const cacheName = sw.match(/const CACHE_NAME = "([^"]+)";/)?.[1];
  const cachePrefix = sw.match(/const APP_CACHE_PREFIX = "([^"]+)";/)?.[1];
  assert.ok(cacheName, "a versioned cache name is required");
  assert.ok(cachePrefix, "a cache namespace is required");
  assert.ok(cacheName.startsWith(cachePrefix), "cache name must use the app cache namespace");
  assert.match(cacheName, /v\d+$/, "cache name must end with a version number");
});

test("unverified PDF upload and read-aloud UI remains hidden in this release", async () => {
  const app = await read("app.js");
  assert.match(
    app,
    /PDF upload\/read-aloud is deferred[\s\S]{0,160}\$\("#pdf-note"\)\.hidden = true;/,
    "PDF upload/read-aloud must stay hidden until device acceptance is completed"
  );
});

test("Android packaging converts in-app profile marks to uppercase E and preserves the launcher icon", async () => {
  const prepare = await read("scripts/prepare-android.mjs");
  const icon = await read("icon.svg");
  assert.match(prepare, /class="about-mark"/);
  assert.match(prepare, /class="brand-mark"/);
  assert.match(prepare, /class="footer-mark"/);
  assert.match(prepare, /"\$1E\$2"/, "all targeted marks should be replaced with uppercase E");
  assert.match(icon, /<svg[\s\S]*viewBox="0 0 192 192"/, "keep the current launcher icon artwork");
});


test("Android package stages a native TTS bridge before loading app modules", async () => {
  const prepare = await read("scripts/prepare-android.mjs");
  const bridge = await read("native-tts-bridge.js");
  assert.match(prepare, /native-tts-bridge\.js/);
  assert.match(prepare, /native-tts\.js/);
  assert.match(bridge, /@capacitor-community\/text-to-speech/);
  assert.match(bridge, /TextToSpeech\.speak/);
  assert.match(bridge, /speechSynthesis/);
});


test("Android APK build applies the existing launcher artwork to native icon resources", async () => {
  const workflow = await read(".github/workflows/android-apk.yml");
  const iconScript = await read("scripts/apply-android-icon.mjs");
  assert.match(workflow, /Apply the existing Learning Everyday launcher icon[\s\S]*apply-android-icon\.mjs/);
  assert.match(iconScript, /icon\.svg/);
  assert.match(iconScript, /ic_launcher\.png/);
  assert.match(iconScript, /ic_launcher_round\.png/);
  assert.match(iconScript, /ic_launcher_foreground\.png/);
  for (const density of ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]) {
    assert.ok(iconScript.includes(`"${density}"`), `missing ${density} launcher icon density`);
  }
});


test("Android APK build applies the original icon to launcher and native splash resources", async () => {
  const workflow = await read(".github/workflows/android-apk.yml");
  const iconScript = await read("scripts/apply-android-icon.mjs");
  assert.ok(workflow.includes("Apply the existing Learning Everyday launcher icon"));
  assert.ok(workflow.includes("node scripts/apply-android-icon.mjs"));
  for (const resource of [
    "icon.svg",
    "ic_launcher.png",
    "ic_launcher_round.png",
    "ic_launcher_foreground.png",
    "splash.png",
    "windowSplashScreenAnimatedIcon",
    "windowSplashScreenBackground"
  ]) {
    assert.ok(iconScript.includes(resource), `missing icon resource configuration: ${resource}`);
  }
  for (const density of ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]) {
    assert.ok(iconScript.includes(`"${density}"`), `missing ${density} launcher icon density`);
  }
});
