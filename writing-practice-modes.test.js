import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const ui = readFileSync(new URL("./curriculum-ui.js", import.meta.url), "utf8");
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const fallbackDictionarySource = readFileSync(new URL("./learning-core.js", import.meta.url), "utf8");

test("Writing Practice exposes exactly Print and Handwriting mode controls", () => {
  assert.ok(html.includes('id="writing-mode-print"'));
  assert.ok(html.includes('id="writing-mode-handwriting"'));
  for (const id of ["writing-mode-alphabet", "hide-writing-card", "show-writing-card"]) {
    assert.ok(!html.includes(`id="${id}"`), `unexpected extra control: ${id}`);
    assert.ok(!ui.includes(`#${id}`), `unexpected listener/reference: ${id}`);
  }
  assert.equal((html.match(/id="writing-mode-(?:print|handwriting)"/g) ?? []).length, 2);
  assert.match(html, /id="handwriting-reference" class="script-reference"/);
  assert.doesNotMatch(html, /Choose a letter|id="letter-select"/);
  assert.match(ui, /function renderLetterOptions\(\) \{\s*renderAlphabetGrid\(\);/);
  assert.match(html, /id="smart-writing-lab" class="curriculum-card letter-practice"/);
  assert.match(html, /Choose Print for step-by-step letter strokes, or Handwriting for cursive letter forms\./);
});

test("Print mode preserves the stroke-by-stroke guide", () => {
  assert.match(ui, /function setWritingMode\(mode\)/);
  assert.match(ui, /const printMode = mode === "print"/);
  assert.match(ui, /tools\.hidden = !printMode/);
  assert.match(ui, /selectedStyle = printMode \? "print" : "cursive"/);
  assert.match(ui, /function renderLetterGuide\(\)/);
  assert.match(ui, /const stylePaths = selectedStyle === "cursive"/);
  assert.match(html, /id="letter-animation" class="letter-animation"/);
  assert.match(html, /id="letter-alphabet-grid" class="letter-alphabet-grid"/);
  assert.match(css, /#legacy-letter-tools\s+\.letter-preview,\s*#legacy-letter-tools\s+\.tracing-board-wrap\{display:none!important\}/);
});

test("Handwriting mode retains both ruled-paper script alphabets", () => {
  assert.match(html, /Uppercase A–Z/);
  assert.match(html, /Lowercase a–z/);
  assert.equal((html.match(/class="script-letter" type="button"/g) ?? []).length, 52);
  assert.match(html, /id="script-letter-card" class="script-letter-card" hidden/);
  assert.match(ui, /function renderScriptLetterPicker\(\)/);
  assert.match(ui, /largeGlyph\.textContent = glyph/);
  assert.match(css, /\.script-letter-card\s*\{[\s\S]*?aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(ui, /writing-mode-print.*setWritingMode\("print"\)/);
  assert.match(ui, /writing-mode-handwriting.*setWritingMode\("handwriting"\)/);
});


test("Listening Practice opens with a story library before the story reader", () => {
  assert.match(html, /id="listening-library"[^>]*hidden/);
  assert.match(html, /id="listening-story-grid"/);
  assert.match(html, /id="back-to-story-library"[^>]*hidden/);
  assert.match(app, /const LISTENING_STORIES = \[/);
  assert.equal((app.match(/\{\s*id: "/g) ?? []).length, 7);
  assert.match(app, /function renderListeningLibrary\(\)/);
  assert.match(app, /function syncListeningView\(/);
  assert.match(app, /location\.hash = `#\/listening\/\$\{item\.id\}`/);
  assert.match(app, /library\.hidden = false;\s*panel\.hidden = true;/);
  assert.match(app, /library\.hidden = true;\s*panel\.hidden = false;/);
  assert.match(app, /readingStory = story;/);
  assert.match(css, /\.listening-story-grid\s*\{[^}]*grid-template-columns: repeat\(3/);
  assert.match(css, /@media \(max-width: 560px\)/);
});


test("Tapping a story word exposes pronunciation and Myanmar meaning controls", () => {
  assert.match(html, /id="pronounce-word"/);
  assert.match(html, /id="word-myanmar-translation"/);
  assert.match(app, /function pronounceWord\(word\)/);
  assert.match(app, /new SpeechSynthesisUtterance\(word\)/);
  assert.match(app, /function showWord\(word, paragraphIndex = 0\)/);
  assert.match(app, /entry\?\.my/);
  assert.match(app, /pronounceWord\(word\)/);
  assert.match(app, /#pronounce-word.*pronounceWord/);
  assert.match(css, /\.word-myanmar-translation/);
  assert.match(css, /\.word-card-actions/);
});


test("Word lookup displays the selected story paragraph translation when available", () => {
  assert.match(html, /id="word-context-translation"/);
  assert.match(app, /let activeStoryTranslations = \[\]/);
  assert.match(app, /activeStoryTranslations = selected\.paragraphTranslations \|\| \[\]/);
  assert.match(app, /showWord\(part\.word, wordParagraphIndex\)/);
  assert.match(app, /activeStoryTranslations\[paragraphIndex\]/);
  assert.match(css, /\.word-context-translation/);
});


test("Former Reading card is now a focused Vocabulary page, while stories stay in Listening", () => {
  assert.match(html, /data-i18n="reading">Vocabulary<\/span>/);
  assert.match(html, /data-i18n="listening">Listening<\/span>/);
  assert.match(app, /title: "Vocabulary", description: "Explore everyday words by topic/);
  assert.match(app, /if \(page === "reading"\)/);
  assert.match(css, /body\[data-page="reading"\] #practice-panel\{display:none\}/);
  assert.match(css, /body\[data-page="reading"\] #curriculum-workbench \.curriculum-card:nth-child\(2\)\{display:none\}/);
  assert.match(app, /Stories to listen to and read/);
});


test("All seven listening stories have complete paragraphs and matching Myanmar translations", () => {
  assert.equal((app.match(/id: "(?:garden-bird|market-morning|rainy-day|lost-puppy|school-trip|village-library|river-remembers)"/g) ?? []).length, 7);
  assert.equal((app.match(/paragraphTranslations: \[/g) ?? []).length, 7);
  assert.match(app, /text: \[\s*"Maya lived in a small house/);
  assert.match(app, /text: \[\s*"For many years, children in Pine Village/);
  assert.match(app, /Books belong to everyone/);
  assert.match(app, /She continued home, glad that Milo was back/);
  assert.match(app, /history was not only a list of dates/);
  assert.match(app, /paragraphTranslations: \[[\s\S]*?Pine ရွာရှိ ကလေးများ/);
});

test("Offline dictionary includes key vocabulary from all listening stories", () => {
  assert.match(fallbackDictionarySource, /grandmother: \{/);
  assert.match(fallbackDictionarySource, /market: \{/);
  assert.match(fallbackDictionarySource, /disappointed: \{/);
  assert.match(fallbackDictionarySource, /whimper: \{/);
  assert.match(fallbackDictionarySource, /museum: \{/);
  assert.match(fallbackDictionarySource, /community: \{/);
  assert.match(fallbackDictionarySource, /contribute: \{/);
});


test("Expanded listening stories include further learning scenes and aligned Myanmar translations", () => {
  const storySection = app.slice(app.indexOf("const LISTENING_STORIES = ["), app.indexOf("function renderListeningLibrary"));
  assert.equal((storySection.match(/paragraphTranslations: \[/g) ?? []).length, 7);
  assert.match(storySection, /careful observation was just as important as hard work/);
  assert.match(storySection, /buying fruit in season often meant better flavour/);
  assert.match(storySection, /asking who took a photograph, when it was taken/);
  assert.match(storySection, /contact a responsible adult or an animal-care service/);
  assert.match(storySection, /learning often begins with a question/);
  assert.match(storySection, /weekly reading circle/);
  assert.match(storySection, /အာရုံစိုက်လေ့လာခြင်းလည်း အရေးကြီးကြောင်း Maya သိလာသည်|ဂရုတစိုက်လေ့လာခြင်းလည်း အရေးကြီးကြောင်း Maya သိလာသည်/);
  assert.match(storySection, /စာဖတ်သူအများဆုံးကို အထောက်အကူပြုမည့် စာအုပ်အနည်းငယ်/);
});

test("Expanded listening vocabulary remains available offline", () => {
  for (const word of ["lane", "nest", "bargain", "budget", "shelter", "approach", "identify", "exhibit", "artifact", "evidence", "accessible", "schedule", "maintain", "shortage", "transparent", "cooperate", "resource", "routine", "observe", "fragile", "reassure"]) {
    assert.match(fallbackDictionarySource, new RegExp("\\b" + word + ": \\{"));
  }
});


test("Long story narration is queued paragraph by paragraph with global word offsets", () => {
  assert.ok(app.includes("const paragraphPattern = /[^\\n]+/g;"));
  assert.match(app, /story\.matchAll\(paragraphPattern\)/);
  assert.match(app, /highlightSpeechWord\(paragraph\.start \+ event\.charIndex\)/);
  assert.match(app, /speakNextParagraph\(\);/);
  assert.match(app, /utterance\.onerror = \(\) => \{/);
});

test("Story narration tracks and visibly highlights the currently spoken word", () => {
  assert.match(app, /function stopStoryNarration\(\)/);
  assert.match(app, /function clearSpeechHighlight\(\)/);
  assert.match(app, /function highlightSpeechWord\(charIndex\)/);
  assert.match(app, /function stopStoryNarration\(\) \{\s*activeStoryUtterance = null;\s*if \("speechSynthesis" in window\) window\.speechSynthesis\.cancel\(\);\s*clearSpeechHighlight\(\);\s*const playButton = \$\("#play-button"\);\s*if \(playButton\) playButton\.disabled = false;/);
  assert.match(app, /\$\("#stop-button"\)\.addEventListener\("click", \(\) => \{\s*stopStoryNarration\(\);/);
  assert.match(app, /if \(activeListeningStoryId\) stopStoryNarration\(\);/);
  assert.match(app, /button\.dataset\.speechStart = String\(partStart\)/);
  assert.match(app, /button\.dataset\.speechEnd = String\(speechOffset\)/);
  assert.match(app, /utterance\.onboundary = \(event\) =>/);
  assert.match(app, /let activeStoryUtterance = null/);
  assert.match(app, /if \(activeStoryUtterance !== utterance\) return/);
  assert.match(app, /activeStoryUtterance = null;\s*clearSpeechHighlight\(\);\s*\$\("#play-button"\)\.disabled = false;\s*window\.speechSynthesis\.cancel\(\)/);
  assert.match(app, /highlightSpeechWord\(event\.charIndex\)/);
  assert.match(app, /active\.setAttribute\("aria-current", "true"\)/);
  assert.match(css, /\.lesson-word\.speech-current-word/);
  assert.match(css, /background: #ffe58a/);
  assert.match(app, /active\.scrollIntoView\(\{ block: "nearest", behavior: "smooth" \}\)/);
});

test("The River That Remembered is a long story with one Myanmar translation per paragraph", () => {
  const start = app.indexOf('id: "river-remembers"');
  const end = app.indexOf("const translations =", start);
  assert.ok(start >= 0 && end > start);
  const story = app.slice(start, end);
  const textStart = story.indexOf("text: [");
  const textEnd = story.indexOf("].join", textStart);
  const textParts = [...story.slice(textStart, textEnd).matchAll(/"((?:[^"\\\\]|\\\\.)*)"/g)].map((match) => JSON.parse('"' + match[1] + '"'));
  const englishText = textParts.join(" ");
  assert.ok(englishText.trim().split(/\s+/).length >= 5000, "long story should contain at least 5,000 whitespace-separated English words");
  const translationStart = story.indexOf("paragraphTranslations: [");
  const translationText = story.slice(translationStart);
  const translations = [...translationText.matchAll(/"((?:[^"\\\\]|\\\\.)*)"/g)].map((match) => JSON.parse('"' + match[1] + '"'));
  assert.equal(translations.length, textParts.length);
  assert.ok(translations.every((paragraph) => paragraph.trim().length > 20));
  assert.match(story, /Lina and her classmates/);
});

test("Offline dictionary includes vocabulary for the long river story", () => {
  for (const word of ["watershed", "wetland", "resilience", "drainage", "gauge", "upstream", "downstream", "rainfall", "verify", "reliable", "evacuate", "forecast", "vulnerable", "coordinate", "maintenance", "survey"]) {
    assert.match(fallbackDictionarySource, new RegExp("\\b" + word + ": \\{"));
  }
});


test("Listening exposes an optional full Myanmar translation aligned to story paragraphs", () => {
  assert.match(html, /id="toggle-story-translation"[^>]*aria-expanded="false"[^>]*aria-controls="story-translation"/);
  assert.match(html, /id="story-translation"[^>]*hidden/);
  assert.match(html, /id="story-translation-paragraphs"/);
  assert.match(app, /function renderStoryTranslation\(selected\)/);
  assert.match(app, /paragraph\.className = "story-translation-paragraph"/);
  assert.match(app, /for \(const \[index, translation\] of \(selected\.paragraphTranslations \|\| \[\]\)\.entries\(\)\)/);
  assert.match(app, /number\.textContent = `\$\{index \+ 1\}\.`;/);
  assert.match(app, /panel\.hidden = !panel\.hidden/);
  assert.match(app, /translationToggle\.setAttribute\("aria-expanded", "false"\)/);
  assert.match(css, /\.story-translation-paragraph \+ \.story-translation-paragraph/);
  assert.match(css, /@media \(max-width: 480px\)/);
});


test("Every Listening story keeps one non-empty Myanmar translation for each English paragraph", () => {
  const start = app.indexOf("const LISTENING_STORIES = [");
  const end = app.indexOf("function renderListeningLibrary", start);
  assert.ok(start >= 0 && end > start, "Listening story data should be present");
  const source = app.slice(start, end);
  const ids = [...source.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 7);

  const readQuotedStrings = (value) => [...value.matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((match) => JSON.parse('"' + match[1] + '"'));

  for (let index = 0; index < ids.length; index += 1) {
    const storyStart = source.indexOf(`id: "${ids[index]}"`);
    const storyEnd = index + 1 < ids.length
      ? source.indexOf(`id: "${ids[index + 1]}"`, storyStart)
      : source.length;
    const story = source.slice(storyStart, storyEnd);
    const englishMatch = story.match(/text: \[([\s\S]*?)\]\.join\("\\n\\n"\)/);
    const translationMatch = story.match(/paragraphTranslations: \[([\s\S]*?)\]\s*\}/);
    assert.ok(englishMatch, `${ids[index]} should define English paragraphs`);
    assert.ok(translationMatch, `${ids[index]} should define Myanmar translations`);

    const englishParagraphs = readQuotedStrings(englishMatch[1]);
    const translationsForStory = readQuotedStrings(translationMatch[1]);
    assert.equal(
      translationsForStory.length,
      englishParagraphs.length,
      `${ids[index]} must have exactly one translation per English paragraph`
    );
    assert.ok(
      translationsForStory.every((paragraph) => paragraph.trim().length >= 40),
      `${ids[index]} translations should not be empty or placeholder text`
    );
  }
});
