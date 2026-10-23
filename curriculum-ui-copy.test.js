import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("practice card title follows the selected skill instead of repeating the four-skills overview", async () => {
  const [html, ui] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8")
  ]);
  assert.doesNotMatch(html, /Four skills · six levels/i);
  assert.match(html, /id="practice-heading">Reading practice</);
  assert.match(ui, /skillLabels\[activeSkill\]/);
  assert.match(ui, /Skills & Levels to change your skill or level/);
  assert.match(html, /id="skills-level-page"/);
  assert.match(html, /id="level-options"/);
  assert.match(ui, /button\.dataset\.level = level\.id/);
  assert.match(ui, /function syncSkillButtons\(\)/);
  assert.match(ui, /button\.classList\.toggle\("active", selected\)/);
  assert.match(ui, /button\.setAttribute\("aria-pressed", String\(selected\)\)/);
  assert.match(ui, /function renderPractice\(\) \{\s*syncSkillButtons\(\);/);
  assert.match(ui, /activeSkill = button\.dataset\.skill;\s*syncSkillButtons\(\);/);
  assert.match(ui, /ကျွမ်းကျင်မှုအလိုက် လေ့ကျင့်ခန်း/);
  assert.match(ui, /စာဖတ်ခြင်း/);
  assert.match(ui, /နားထောင်ခြင်း/);
  assert.match(ui, /စာရေးခြင်း/);
  assert.match(ui, /စကားပြောခြင်း/);
});


test("vocabulary topic cards navigate to dedicated pages and retain word audio details", async () => {
  const [html, ui, css, worker] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./sw.js", import.meta.url), "utf8")
  ]);
  assert.match(html, /id="vocabulary-category"/);
  assert.match(html, /id="vocabulary-back-to-categories"/);
  assert.match(ui, /id = "vocabulary-topic-picker"/);
  assert.match(ui, /className = "vocabulary-topic-card"/);
  assert.match(ui, /location\.hash = `#\/reading\/\$\{category\.id\}`/);
  assert.match(ui, /function syncVocabularyRoute\(\)/);
  assert.doesNotMatch(ui, /shell\.append\(title, list\)/);
  assert.match(css, /\.vocabulary-topic-picker\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.vocabulary-topic-label\{[^}]*overflow-wrap:break-word/s);
  assert.match(css, /word-break:normal/);
  assert.match(ui, /selectedWord === word/);
  assert.match(ui, /classList\.add\("is-closing"\)/);
  assert.match(ui, /className = "vocabulary-speaker"/);
  assert.match(css, /\.vocabulary-speaker\{position:absolute/);
  assert.match(css, /@keyframes vocabulary-detail-out/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(worker, /learning-everyday-shell-v43/);
});
test("Home Myanmar headline uses the requested wording and refined type styling", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(app, /headline:"အင်္ဂလိပ်စာ ကောင်းလာဖို့<br>နေ့စဉ် တစ်လှမ်းချင်း သင်ယူစို့။"/);
  assert.match(css, /\.hero h1\[data-i18n="headline"\]\{[^}]*font-family:"Noto Sans Myanmar"/);
  assert.match(css, /font-size:clamp\(25px,6\.4vw,32px\)/);
});


test("About page exposes the requested social links with safe external-link attributes", async () => {
  const [html, app, css] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(html, /id="about-page"[^>]*hidden/);
  assert.match(html, /href="#\/about" data-i18n="aboutLink"/);
  assert.match(html, /href="https:\/\/www\.tiktok\.com\/@saiihar0" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/t\.me\/scmss01" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/www\.facebook\.com\/share\/1Hj82kKydx\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(app, /new Set\(\["home", "skills", "reading", "listening", "writing", "speaking", "progress", "about"\]\)/);
  assert.match(app, /aboutLink:"အကြောင်း"/);
  assert.match(css, /body\[data-page="about"\] #about-page\{display:block\}/);
  assert.match(css, /\.about-social-link:focus-visible/);
});
