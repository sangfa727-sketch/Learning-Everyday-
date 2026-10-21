import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, ALPHABET, CURSIVE_GLYPHS, getPractice, getPracticeCount } from "./curriculum.js";
import { loadProgress, saveProgress, markPracticeComplete, clearProgress, exportProgress } from "./progress-state.js";

const $ = (selector, root = document) => root.querySelector(selector);
const ns = "http://www.w3.org/2000/svg";


let selectedCategory = VOCABULARY_CATEGORIES[0].id;
let selectedLevel = "A1";
let selectedExerciseIndex = 0;
let selectedLetter = "A";
let selectedStyle = "print";
let selectedWord = null;
let activeSkill = "reading";
let language = document.documentElement.lang === "my" ? "my" : "en";
let progress = loadProgress();

function renderProgress() {
  const count = Object.keys(progress.completed).length;
  const summary = $("#progress-summary");
  if (summary) summary.textContent = language === "my"
    ? `ပြီးမြောက်သော လေ့ကျင့်ခန်း ${count} ခု · မှတ်တမ်းကို ဤစက်ပေါ်တွင်သာ သိမ်းထားသည်`
    : `${count} completed exercises · saved on this device only`;
  const details = $("#progress-details");
  if (!details) return;
  details.replaceChildren();
  const skillNames = language === "my"
    ? { reading: "စာဖတ်ခြင်း", listening: "နားထောင်ခြင်း", writing: "စာရေးခြင်း", speaking: "စကားပြောခြင်း" }
    : { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };
  for (const skill of ["reading", "listening", "writing", "speaking"]) {
    const section = document.createElement("section");
    section.className = "progress-skill";
    const heading = document.createElement("h4");
    heading.className = "progress-skill-title";
    heading.textContent = skillNames[skill];
    section.append(heading);
    const rows = document.createElement("div");
    rows.className = "progress-level-list";
    for (const level of LEVELS) {
      const row = document.createElement("div");
      row.className = "progress-level-row";
      const label = document.createElement("span");
      label.className = "progress-level-label";
      label.textContent = level.id;
      const exercises = document.createElement("div");
      exercises.className = "progress-exercises";
      for (let index = 0; index < getPracticeCount(skill, level.id); index += 1) {
        const completed = Object.hasOwn(progress.completed, `${skill}:${level.id}:${index}`);
        const chip = document.createElement("span");
        chip.className = completed ? "progress-exercise is-complete" : "progress-exercise";
        chip.textContent = completed
          ? (language === "my" ? `လေ့ကျင့်ခန်း ${index + 1} ✓` : `Exercise ${index + 1} ✓`)
          : (language === "my" ? `လေ့ကျင့်ခန်း ${index + 1} · မပြီးသေး` : `Exercise ${index + 1} · Not yet`);
        chip.setAttribute("aria-label", chip.textContent);
        exercises.append(chip);
      }
      row.append(label, exercises);
      rows.append(row);
    }
    section.append(rows);
    details.append(section);
  }
}

const styleInfo = {
  print: { en: "Print: use separate, clear strokes. Follow the numbered movement guide.", my: "ပုံနှိပ်စာလုံးပုံစံ — မျဉ်းတစ်ကြောင်းစီ ရှင်းရှင်းဆွဲပြီး လမ်းညွှန်အတိုင်း လိုက်ပါ။" },
  cursive: { en: "Cursive: keep letters connected where appropriate, use a relaxed wrist, and maintain a consistent slant.", my: "Cursive — သင့်တော်သည့်နေရာတွင် စာလုံးများကို ဆက်ရေးပါ။ လက်ကောက်ဝတ်ကို ဖြေလျှော့ပြီး စောင်းနှုန်းညီအောင်ထားပါ။" },
  calligraphy: { en: "Calligraphy: begin with light guide strokes, vary pressure for thick and thin lines, and move slowly.", my: "Calligraphy — လမ်းညွှန်မျဉ်းကို ပေါ့ပေါ့စဆွဲပါ။ ဖိအားကိုပြောင်း၍ မျဉ်းအထူအပါးဖန်တီးပြီး ဖြည်းဖြည်းရေးပါ။" }
};

function labelForLevel(level) {
  return language === "my" ? level.my : level.name;
}
function categoryLabel(category) {
  return language === "my" ? category.my : category.en;
}
function activePractice() {
  return getPractice(activeSkill, selectedLevel, selectedExerciseIndex) ?? getPractice(activeSkill, selectedLevel, 0);
}
function setStatus(message) {
  const node = $("#curriculum-status");
  if (node) node.textContent = message;
}

function renderCategoryOptions() {
  const select = $("#vocabulary-category");
  select.replaceChildren();
  for (const category of VOCABULARY_CATEGORIES) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = categoryLabel(category);
    select.append(option);
  }
  select.value = selectedCategory;
}

function renderVocabulary() {
  const category = VOCABULARY_CATEGORIES.find((item) => item.id === selectedCategory);
  const list = $("#vocabulary-list");
  list.replaceChildren();
  $("#vocabulary-category-title").textContent = categoryLabel(category);
  for (const [word, meaning, example] of category.words) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vocabulary-word";
    button.setAttribute("aria-pressed", String(selectedWord === word));
    const wordEl = document.createElement("strong");
    wordEl.textContent = word;
    const meaningEl = document.createElement("span");
    meaningEl.textContent = meaning;
    button.append(wordEl, meaningEl);
    button.addEventListener("click", () => {
      selectedWord = word;
      $("#vocabulary-meaning").textContent = meaning;
      $("#vocabulary-example").textContent = example;
      $("#vocabulary-detail").hidden = false;
      renderVocabulary();
    });
    list.append(button);
  }
  if (selectedWord && !category.words.some(([word]) => word === selectedWord)) {
    selectedWord = null;
    $("#vocabulary-detail").hidden = true;
  }
}

function renderLevelOptions() {
  const container = $("#level-options");
  if (!container) return;
  container.replaceChildren();
  for (const level of LEVELS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-choice";
    button.setAttribute("aria-pressed", String(level.id === selectedLevel));
    button.dataset.level = level.id;
    const code = document.createElement("strong");
    code.textContent = level.id;
    const name = document.createElement("span");
    name.textContent = labelForLevel(level);
    button.append(code, name);
    button.addEventListener("click", () => {
      selectedLevel = level.id;
      selectedExerciseIndex = 0;
      renderLevelOptions();
      renderPractice();
    });
    container.append(button);
  }
}

function renderPractice() {
  const practice = activePractice();
  const level = LEVELS.find((item) => item.id === selectedLevel);
  const skillLabels = language === "my"
    ? { reading: "စာဖတ်ခြင်း", listening: "နားထောင်ခြင်း", writing: "စာရေးခြင်း", speaking: "စကားပြောခြင်း" }
    : { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };
  $("#practice-heading").textContent = skillLabels[activeSkill] + (language === "my" ? " လေ့ကျင့်ခန်း" : " practice");
  $("#practice-heading").nextElementSibling.textContent = language === "my"
    ? skillLabels[activeSkill] + " လေ့ကျင့်ခန်းကို ရွေးထားသောအဆင့်တွင် လုပ်ပါ။ အဆင့်ပြောင်းရန် ကျွမ်းကျင်မှုနှင့် အဆင့်များစာမျက်နှာသို့ သွားပါ။"
    : "Practise at the selected level. Use Skills & Levels to change your skill or level.";
  $("#level-practice-title").textContent = language === "my" ? practice.my : practice.title;
  $("#level-practice-level").textContent = `${level.id} · ${labelForLevel(level)}`;
  $("#level-practice-prompt").textContent = practice.prompt;
  $("#level-practice-task").textContent = language === "my" ? practice.myTask : practice.task;
  $("#level-practice-answer").value = "";
  $("#level-practice-answer").placeholder = language === "my" ? "ဤနေရာတွင် လေ့ကျင့်ပါ…" : "Write your answer or notes here…";
  $("#practice-answer-wrap").hidden = activeSkill !== "writing" && activeSkill !== "reading";
  $("#practice-speaking-note").hidden = activeSkill !== "speaking";
  $("#practice-action").textContent = language === "my" ? "နမူနာအသံ နားထောင်ရန်" : "Listen to model";
  const nextButton = $("#next-practice");
  if (nextButton) { nextButton.hidden = getPracticeCount(activeSkill, selectedLevel) < 2; nextButton.textContent = language === "my" ? "နောက်လေ့ကျင့်ခန်း →" : "Next exercise →"; }
  const number = $("#practice-exercise-number");
  if (number) number.textContent = language === "my" ? "လေ့ကျင့်ခန်း " + (selectedExerciseIndex + 1) + "/" + getPracticeCount(activeSkill, selectedLevel) : "Exercise " + (selectedExerciseIndex + 1) + " of " + getPracticeCount(activeSkill, selectedLevel);
}

function makeSvgPath(d, index) {
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  path.setAttribute("class", "letter-stroke");
  path.setAttribute("pathLength", "1");
  path.style.animationDelay = `${index * 650}ms`;
  return path;
}

// Hand-authored cursive lowercase centerlines. These are not transformed print glyphs.
const CURSIVE_LOWERCASE_PATHS = Object.freeze({
  a: ["M12 72 C18 61 26 55 35 56 C48 57 49 76 37 80 C24 84 19 68 27 59 C36 49 50 54 54 65 C57 74 53 83 62 82 C69 81 75 75 82 68"],
  b: ["M12 72 C20 62 28 56 36 57 C49 58 49 77 37 80 C24 83 19 68 28 59 C38 48 53 54 55 66 L55 27 C55 18 62 15 69 22 L82 34"],
  c: ["M80 61 C71 51 60 51 49 57 C36 64 38 80 52 81 C63 82 73 76 82 69"],
  d: ["M12 72 C20 62 28 56 36 57 C49 58 49 77 37 80 C24 83 19 68 28 59 C38 48 53 54 55 66 L55 28 C55 18 62 16 69 22 L82 34"],
  e: ["M14 69 C27 67 42 65 54 64 C58 54 49 49 39 54 C26 59 27 77 41 81 C56 85 70 77 82 68"],
  f: ["M23 82 C31 66 40 46 43 29 C45 18 55 15 62 24 C66 30 63 38 59 43 M11 57 C27 52 45 51 61 54 M39 49 C34 65 29 79 23 91 C18 101 10 99 9 91"],
  g: ["M12 71 C20 61 28 55 36 56 C49 57 49 76 37 80 C24 83 19 67 28 58 C38 48 52 54 55 65 C59 78 55 91 47 95 C38 100 28 95 24 90"],
  h: ["M12 72 C20 60 27 49 31 36 C34 25 39 20 45 24 C50 28 46 41 42 51 L31 80 C41 65 51 55 61 57 C73 59 67 74 63 82 C72 79 78 73 85 67"],
  i: ["M14 72 C23 62 31 56 39 57 C49 58 45 70 40 80 C49 77 57 72 64 66", "M46 39 C49 35 52 34 55 35"],
  j: ["M14 72 C23 62 31 56 39 57 C49 58 45 70 40 80 C47 78 53 74 60 68 C57 82 52 93 45 98 C39 102 33 99 34 93", "M48 38 C51 34 54 34 57 35"],
  k: ["M12 72 C20 60 27 49 31 36 C34 25 39 20 45 24 C50 28 46 41 42 51 L31 80 C42 68 53 58 65 55 M48 66 C58 72 68 78 82 80"],
  l: ["M12 72 C23 56 32 39 38 26 C42 17 49 18 52 25 C56 33 46 52 40 65 C35 76 35 83 43 82 C55 81 70 73 83 66"],
  m: ["M10 72 C20 61 27 56 35 57 C45 58 39 71 35 80 C46 66 53 56 62 58 C72 60 65 73 61 81 C72 72 78 68 87 66"],
  n: ["M11 72 C21 61 29 56 37 57 C47 58 41 71 37 80 C48 66 57 56 66 58 C77 60 70 74 66 81 C74 77 80 71 87 66"],
  o: ["M15 68 C25 54 41 50 51 59 C62 69 53 81 41 82 C27 84 20 72 28 61 C38 48 53 54 59 65 C63 74 67 79 74 76 C78 74 82 70 87 66"],
  p: ["M12 72 C22 61 30 56 38 57 C49 58 43 73 38 83 L26 99 C34 82 45 66 56 59 C67 52 77 57 74 68 C71 79 58 84 45 80"],
  q: ["M14 68 C24 54 40 50 50 59 C61 69 52 81 40 82 C26 84 19 72 27 61 C37 48 52 54 58 65 C64 79 60 91 53 96 C47 101 39 97 40 91"],
  r: ["M12 72 C22 61 30 56 38 57 C49 58 42 72 38 80 C48 67 58 57 69 59 C75 60 78 64 82 67"],
  s: ["M79 57 C67 49 55 51 48 58 C41 66 57 69 62 73 C70 80 58 85 47 82 C37 80 29 75 21 73"],
  t: ["M12 72 C22 61 30 56 38 57 C49 58 43 71 38 80 C47 78 56 73 63 66 M26 51 C38 48 51 47 65 49"],
  u: ["M12 62 C9 74 13 82 23 81 C33 80 41 67 47 58 C41 69 38 82 48 82 C59 82 70 73 83 66"],
  v: ["M12 61 C17 69 23 79 29 81 C37 83 44 66 51 57 C49 70 49 81 59 81 C68 81 77 73 86 66"],
  w: ["M10 61 C16 70 21 79 27 81 C35 83 40 68 46 58 C44 71 45 81 53 81 C61 81 68 67 75 58 C72 70 74 81 82 79 C87 78 90 73 93 68"],
  x: ["M13 62 C25 69 37 77 50 81 C59 83 67 73 83 59 M19 81 C36 72 48 64 60 58"],
  y: ["M12 61 C17 70 24 80 31 81 C39 82 46 66 52 58 C49 73 44 87 38 96 C32 104 23 100 24 93 C25 88 33 87 43 87 C57 87 72 77 86 66"],
  z: ["M17 58 C34 55 52 55 69 58 C57 67 43 76 28 81 C45 82 63 80 82 73"]
});

// Hand-authored cursive capitals use curved, flowing forms instead of the print centerlines.
const CURSIVE_UPPERCASE_PATHS = Object.freeze({
  A: ["M12 78 C24 58 35 31 48 17 C57 30 63 57 72 77 C75 84 82 82 88 73", "M32 53 C44 48 55 48 65 51"],
  B: ["M20 80 C22 59 25 37 28 17 C43 15 58 18 60 31 C62 43 48 49 30 49 C48 45 68 48 70 64 C72 80 47 84 20 80"],
  C: ["M76 29 C63 16 46 14 33 25 C18 38 18 65 33 76 C46 86 63 81 79 68"],
  D: ["M21 80 C23 59 25 38 27 18 C45 14 64 24 69 43 C75 65 57 82 21 80"],
  E: ["M70 21 C54 15 37 16 27 27 C19 38 23 48 39 48 C52 48 61 45 67 42 M26 48 C24 63 31 77 48 80 C59 82 70 77 80 68"],
  F: ["M24 80 C28 59 30 39 33 20 C48 14 61 19 62 30 C63 41 50 47 35 48 M23 50 C39 46 55 46 70 49 M40 48 C36 64 31 79 24 91 C19 98 12 96 13 89"],
  G: ["M77 28 C63 16 45 16 32 28 C18 41 20 66 34 76 C48 86 65 79 76 68 L76 54 L57 55"],
  H: ["M20 80 C24 58 27 38 30 18 C32 11 40 14 39 23 L31 54 C44 44 57 43 64 49 C70 55 63 69 60 80 M33 51 C46 46 61 47 75 53"],
  I: ["M36 22 C44 17 52 18 59 22 M46 22 C42 42 37 63 33 80 C44 82 55 80 66 75"],
  J: ["M61 22 C51 18 42 19 33 23 M49 22 C44 45 41 70 32 84 C25 96 14 93 15 84"],
  K: ["M22 80 C26 58 29 37 32 18 C34 11 42 14 41 23 L33 53 C45 43 57 35 68 27 M42 48 C51 61 62 72 78 78"],
  L: ["M33 19 C31 39 27 61 23 78 C39 84 58 80 78 67"],
  M: ["M16 79 C20 57 24 35 28 18 C37 31 44 48 49 62 C56 44 63 28 72 17 C76 38 80 59 84 78"],
  N: ["M19 79 C23 57 27 35 31 18 C44 37 56 58 69 78 C72 57 76 37 80 18"],
  O: ["M51 17 C31 15 20 34 21 52 C22 72 35 83 51 80 C68 77 77 58 75 40 C73 25 63 17 51 17"],
  P: ["M23 80 C27 59 30 38 32 18 C47 14 63 19 65 33 C67 48 50 54 30 51"],
  Q: ["M51 17 C31 15 20 34 21 52 C22 72 35 83 51 80 C68 77 77 58 75 40 C73 25 63 17 51 17 M52 64 C60 74 69 83 83 88"],
  R: ["M23 80 C27 59 30 38 32 18 C47 14 63 19 65 33 C67 47 50 54 30 51 M43 52 C52 63 64 73 80 79"],
  S: ["M70 25 C58 15 42 16 32 26 C21 37 35 45 48 49 C64 54 72 62 64 73 C55 84 36 82 22 73"],
  T: ["M22 24 C39 18 57 18 75 23 M49 22 C44 42 38 63 32 81"],
  U: ["M27 20 C24 40 22 62 32 74 C43 87 59 79 64 65 C69 52 72 35 75 20"],
  V: ["M23 21 C31 42 39 64 48 81 C60 61 70 40 80 21"],
  W: ["M15 22 C22 42 28 63 35 80 C44 63 50 48 56 36 C60 52 65 67 70 80 C79 60 85 41 90 22"],
  X: ["M25 23 C39 39 54 59 76 79 M75 23 C58 40 42 61 23 79"],
  Y: ["M22 23 C33 39 42 50 51 58 C60 46 69 35 79 22 M51 58 C46 68 41 76 35 84"],
  Z: ["M26 24 C43 19 60 20 76 24 C59 42 42 61 25 78 C43 82 62 80 80 74"]
});

// Calligraphy has its own capital/lowercase forms where the pen movement changes,
// not just a thicker rendering of the cursive centerline. These hand-authored
// exemplars prioritize a legible entry, main form, and exit stroke.
const CALLIGRAPHY_PATH_OVERRIDES = Object.freeze({
  a: ["M14 68 C22 54 39 50 49 59 C59 68 53 80 41 81 C28 82 21 72 28 61 C35 51 48 54 53 64", "M53 64 C58 73 56 82 64 82 C72 82 79 74 86 66"],
  o: ["M18 68 C26 55 39 51 49 58 C59 65 57 77 46 81 C34 85 23 77 25 66 C27 56 37 52 46 56", "M46 56 C55 61 60 72 66 78 C72 82 79 74 86 66"],
  f: ["M17 82 C28 66 39 45 42 27 C44 14 56 10 64 20 C71 29 64 39 56 46 C48 53 40 57 32 61", "M12 58 C29 51 48 50 68 53", "M38 49 C34 64 29 80 22 92 C18 99 11 97 9 91"],
  A: ["M10 79 C24 57 37 29 49 13 C61 34 67 59 77 78 C80 84 85 80 90 72", "M29 55 C42 48 57 47 68 51", "M48 14 C43 8 39 10 38 16"],
  F: ["M24 82 C28 59 31 37 34 18 C47 11 61 16 64 27 C67 38 54 46 36 48", "M22 51 C39 45 57 45 73 49", "M39 49 C34 65 29 81 23 92 C18 100 11 98 9 91", "M34 18 C40 10 47 8 53 12"]
});

function calligraphyPathsFor(letter) {
  return CALLIGRAPHY_PATH_OVERRIDES[letter] ?? cursivePathsFor(letter);
}

function cursivePathsFor(letter) {
  return CURSIVE_LOWERCASE_PATHS[letter] ?? CURSIVE_UPPERCASE_PATHS[letter] ?? null;
}

function renderLetterGuide() {
  const guide = LETTER_GUIDES[selectedLetter] ?? {
    start: `Trace the ${selectedLetter === selectedLetter.toUpperCase() ? "uppercase" : "lowercase"} letter slowly, following the faint template.`,
    my: `ဖျော့ဖျော့လမ်းညွှန်စာလုံးအတိုင်း ${selectedLetter === selectedLetter.toUpperCase() ? "စာလုံးအကြီး" : "စာလုံးအသေး"} ကို ဖြည်းဖြည်းလိုက်ရေးပါ။`,
    paths: []
  };
  const sample = $("#letter-sample");
  sample.replaceChildren();
  sample.classList.remove("style-print", "style-cursive", "style-calligraphy");
  sample.classList.add(`style-${selectedStyle}`);
  if (selectedStyle === "cursive") {
    // Render the same hand-drawn paths used by the animation, not a Unicode math font.
    const samplePaths = cursivePathsFor(selectedLetter) ?? [];
    if (samplePaths.length) {
      const sampleSvg = document.createElementNS(ns, "svg");
      sampleSvg.setAttribute("viewBox", "0 0 100 100");
      sampleSvg.setAttribute("class", "letter-sample-svg");
      sampleSvg.setAttribute("aria-hidden", "true");
      const orderedSamplePaths = samplePaths.flatMap((d) =>
        d.trim().split(/(?=M\s*[-\d.])/).map((part) => part.trim()).filter(Boolean)
      );;
      orderedSamplePaths.forEach((d, index) => {
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", d);
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", "letter-sample-stroke");
        path.style.animationDelay = `${index * 650}ms`;
        sampleSvg.append(path);
      });
      sample.append(sampleSvg);
    } else {
      sample.textContent = CURSIVE_GLYPHS[selectedLetter] ?? selectedLetter;
    }
  } else {
    sample.textContent = selectedLetter;
  }
  renderAlphabetGrid();
  $("#letter-style-note").textContent = styleInfo[selectedStyle][language];
  const styleStart = selectedStyle === "cursive"
    ? (language === "my"
      ? "Cursive — လက်ရေးပုံစံအတိုင်း ဆွဲထားသောမျဉ်းများကို အစဉ်လိုက်ကြည့်ပြီး ဝင်မျဉ်း၊ အဝိုင်းနှင့် ထွက်မျဉ်းကို လေ့ကျင့်ပါ။"
      : "Cursive — follow the hand-drawn centerline strokes in order, practising the entry, letter form, and exit stroke.")
    : selectedStyle === "calligraphy"
      ? (language === "my" ? "Calligraphy: ဝင်မျဉ်းကို ဖိအားပေါ့ပေါ့ဖြင့်စပါ။ အောက်ဆင်းမျဉ်းတွင် ဖိအားတိုးပြီး အပေါ်တက်မျဉ်းတွင် လျှော့ပါ။ " : "Calligraphy: start the entry stroke lightly, add pressure on downstrokes, and release pressure on upstrokes. ")
      : "";
  $("#letter-start-instruction").textContent = selectedStyle === "cursive"
    ? styleStart
    : (language === "my" ? guide.my : guide.start) + (selectedStyle === "print" ? "" : " " + styleStart);
  $("#letter-guide-title").textContent = selectedStyle === "print"
    ? `${language === "my" ? "ပုံနှိပ်စာလုံး" : "Print stroke guide"} · ${selectedLetter}`
    : `${selectedStyle === "cursive" ? "Cursive" : "Calligraphy"} · ${selectedLetter}`;

  // Cursive and calligraphy animate hand-authored centerline paths; keep tracing on the same path source.
  const stylePaths = selectedStyle === "print"
    ? guide.paths
    : selectedStyle === "cursive"
      ? (cursivePathsFor(selectedLetter) ?? [])
      : (calligraphyPathsFor(selectedLetter) ?? guide.paths);
  const svg = $("#letter-animation");
  svg.replaceChildren();
  const baseline = document.createElementNS(ns, "line");
  baseline.setAttribute("x1", "8"); baseline.setAttribute("x2", "92");
  baseline.setAttribute("y1", "88"); baseline.setAttribute("y2", "88");
  baseline.setAttribute("class", "letter-baseline");
  svg.append(baseline);
  if (stylePaths.length) {
    const strokeGroup = document.createElementNS(ns, "g");
    strokeGroup.setAttribute("class", `letter-guide-strokes style-${selectedStyle}`);
    if (selectedStyle === "cursive") strokeGroup.setAttribute("transform", "skewX(-7) translate(5 0)");
    // An SVG path can contain multiple "M" commands, which represent pen lifts.
    // Split them so disconnected sub-strokes animate in actual writing order.
    const orderedStrokePaths = stylePaths.flatMap((d) =>
      d.trim().split(/(?=M\s*[-\d.])/).map((part) => part.trim()).filter(Boolean)
    );
    orderedStrokePaths.forEach((d, index) => {
      const path = makeSvgPath(d, index);
      path.classList.add(`style-${selectedStyle}`);
      path.style.animationDuration = "620ms";
      path.style.animationDelay = `${index * 650}ms`;
      strokeGroup.append(path);
      if (selectedStyle === "calligraphy") {
        const highlight = makeSvgPath(d, index);
        highlight.classList.add("calligraphy-highlight");
        highlight.style.animationDuration = "620ms";
        highlight.style.animationDelay = `${index * 650}ms`;
        strokeGroup.append(highlight);
      }
    });
    svg.append(strokeGroup);
    const start = document.createElementNS(ns, "circle");
    const firstMove = stylePaths[0]?.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/);
    start.setAttribute("cx", firstMove?.[1] ?? "50");
    start.setAttribute("cy", firstMove?.[2] ?? "12");
    start.setAttribute("r", "3");
    start.setAttribute("class", "letter-start-dot");
    svg.append(start);

  } else {
    const glyph = document.createElementNS(ns, "text");
    glyph.setAttribute("x", "50"); glyph.setAttribute("y", "76");
    glyph.setAttribute("text-anchor", "middle");
    glyph.setAttribute("class", `letter-template-glyph style-${selectedStyle}`);
    glyph.textContent = selectedStyle === "cursive" ? (CURSIVE_GLYPHS[selectedLetter] ?? selectedLetter) : selectedLetter;
    svg.append(glyph);
  }
  const visibleStrokeCount = stylePaths.reduce((count, d) => count + d.trim().split(/(?=M\s*[-\d.])/).filter(Boolean).length, 0);
  $("#letter-stroke-count").textContent = visibleStrokeCount
    ? selectedStyle === "print"
      ? (language === "my" ? `မျဉ်း ${visibleStrokeCount} ကြောင်း · အစဉ်လိုက် မျဉ်းဆွဲလှုပ်ရှားမှု` : `${visibleStrokeCount} strokes · animated in order`)
      : selectedStyle === "cursive"
        ? (language === "my" ? `Cursive မျဉ်း ${visibleStrokeCount} ကြောင်း · ဝင်မျဉ်း၊ ဆက်ရေးပုံနှင့် ထွက်မျဉ်း` : `Cursive · ${visibleStrokeCount} hand-drawn strokes animated in sequence`)
        : (language === "my" ? `Calligraphy မျဉ်း ${visibleStrokeCount} ကြောင်း · အထူမျဉ်းနှင့် အလင်းအတွင်းမျဉ်း` : `Calligraphy · ${visibleStrokeCount} animated strokes with thick/thin overlay`)
    : (language === "my" ? "လမ်းညွှန်ပုံစံကို ပြထားသည်။ အောက်ရှိ tracing board တွင် လိုက်ရေးပါ။" : "Template preview only; trace the letter on the practice board below.");
  renderTraceTemplate();
}


function renderTraceTemplate() {
  const canvas = $("#letter-tracing");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);
  context.strokeStyle = "#dfe7d8";
  context.lineWidth = 1;
  context.setLineDash([4, 5]);
  context.beginPath();
  context.moveTo(12, rect.height * 0.78);
  context.lineTo(rect.width - 12, rect.height * 0.78);
  context.stroke();
  context.setLineDash([]);
  const handPaths = selectedStyle === "cursive"
    ? cursivePathsFor(selectedLetter)
    : selectedStyle === "calligraphy" ? calligraphyPathsFor(selectedLetter) : null;
  if (handPaths && typeof Path2D === "function") {
    const size = Math.min(rect.width * 0.78, rect.height * 0.78);
    context.save();
    context.translate((rect.width - size) / 2, (rect.height - size) / 2);
    context.scale(size / 100, size / 100);
    context.strokeStyle = "rgba(65, 105, 79, 0.34)";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = selectedStyle === "calligraphy" ? 5.2 : 2.4;
    for (const d of handPaths) context.stroke(new Path2D(d));
    context.restore();
  } else {
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    const fontSize = Math.max(72, Math.min(180, rect.height * 0.68, rect.width * 0.55));
    const font = selectedStyle === "cursive" ? `${fontSize}px "Cambria Math", "STIX Two Math", "Noto Sans Math", "Segoe UI Symbol", serif`
      : selectedStyle === "calligraphy" ? `italic bold ${fontSize}px "URW Chancery L", "Brush Script MT", "Apple Chancery", cursive`
      : `${fontSize}px Arial, sans-serif`;
    context.font = font;
    context.lineWidth = selectedStyle === "calligraphy" ? 2.8 : selectedStyle === "cursive" ? 1.1 : 1.5;
    context.strokeStyle = "rgba(90, 124, 91, 0.32)";
    const traceGlyph = selectedStyle === "cursive" ? (CURSIVE_GLYPHS[selectedLetter] ?? selectedLetter) : selectedLetter;
    context.strokeText(traceGlyph, rect.width / 2, rect.height * 0.76);
    if (selectedStyle === "calligraphy") {
      context.fillStyle = "rgba(90, 124, 91, 0.08)";
      context.fillText(selectedLetter, rect.width / 2, rect.height * 0.76);
    }
  }

  // Repaint learner strokes after the canvas backing store is resized.
  for (const stroke of traceStrokes) drawTraceStroke(context, stroke, rect.width, rect.height);
}

function traceStrokeWidth(style, pressure = 0.5) {
  const base = style === "cursive" ? 3.5 : style === "calligraphy" ? 5 : 4;
  if (style !== "calligraphy") return base;
  const normalized = Number.isFinite(pressure) && pressure > 0 ? pressure : 0.5;
  return base * (0.45 + Math.min(1, normalized) * 1.1);
}

function drawTraceSegment(context, stroke, previous, point, width, height) {
  context.beginPath();
  context.strokeStyle = stroke.style === "calligraphy" ? "#24554a" : "#477b62";
  context.lineWidth = (traceStrokeWidth(stroke.style, previous.pressure) + traceStrokeWidth(stroke.style, point.pressure)) / 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.moveTo(previous.x * width, previous.y * height);
  context.lineTo(point.x * width, point.y * height);
  context.stroke();
}

function drawTraceStroke(context, stroke, width, height) {
  if (!stroke.points.length) return;
  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    context.beginPath();
    context.fillStyle = stroke.style === "calligraphy" ? "#24554a" : "#477b62";
    context.arc(point.x * width, point.y * height, traceStrokeWidth(stroke.style, point.pressure) / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  for (let index = 1; index < stroke.points.length; index += 1) {
    drawTraceSegment(context, stroke, stroke.points[index - 1], stroke.points[index], width, height);
  }
}

function renderLetterOptions() {
  const letterSelect = $("#letter-select");
  letterSelect.replaceChildren();
  for (const letter of ALPHABET) {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    letterSelect.append(option);
  }
  letterSelect.value = selectedLetter;
  renderAlphabetGrid();
}

function renderAlphabetGrid() {
  const grid = $("#letter-alphabet-grid");
  if (!grid) return;
  grid.replaceChildren();
  for (const [label, letters] of [
    [language === "my" ? "စာလုံးအကြီး A–Z" : "Uppercase A–Z", [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]],
    [language === "my" ? "စာလုံးအသေး a–z" : "Lowercase a–z", [..."abcdefghijklmnopqrstuvwxyz"]]
  ]) {
    const group = document.createElement("section");
    group.className = "letter-alphabet-group";
    const heading = document.createElement("h4");
    heading.textContent = label;
    const row = document.createElement("div");
    row.className = "letter-alphabet-row";
    for (const letter of letters) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "letter-alphabet-choice";
      button.dataset.letter = letter;
      button.setAttribute("aria-pressed", String(letter === selectedLetter));
      button.setAttribute("aria-label", (letter === letter.toUpperCase()
        ? (language === "my" ? "စာလုံးအကြီး " : "Uppercase ")
        : (language === "my" ? "စာလုံးအသေး " : "Lowercase ")) + letter);
      button.textContent = selectedStyle === "cursive" ? (CURSIVE_GLYPHS[letter] ?? letter) : letter;
      button.addEventListener("click", () => {
        selectedLetter = letter;
        const select = $("#letter-select");
        if (select) select.value = letter;
        traceStrokes = [];
        renderLetterGuide();
      });
      row.append(button);
    }
    group.append(heading, row);
    grid.append(group);
  }
}

function setLanguage(next) {
  language = next;
  const copy = {
    en: {
      curriculumTitle: "Build skills step by step",
      curriculumIntro: "Explore everyday vocabulary, then practise reading, listening, writing and speaking from Beginner to Proficient.",
      vocabularyTitle: "Vocabulary by topic",
      vocabularyIntro: "Choose a real-life topic. Tap a word to see its Myanmar meaning and an example sentence.",
      practiceTitle: "Practice by skill",
      practiceIntro: "Practise at the selected level. Use Skills & Levels to change your skill or level.",
      letterTitle: "Smart Writing Lab",
      letterIntro: "Practise uppercase and lowercase letters with guided stroke animation and finger tracing. Choose print, cursive, or calligraphy.",
      chooseLetter: "Choose a letter",
      chooseStyle: "Writing style",
      replay: "Replay stroke animation",
      listen: "Listen to model",
      answerPlaceholder: "Write your answer or notes here…",
      speakingNote: "Say your response aloud. The speaking practice controls in the lesson panel below offer optional browser microphone recognition where supported.",
      traceTitle: "Trace and practise",
      traceIntro: "Follow the faint letter with your finger or mouse. This drawing stays in the current page and is not uploaded.",
      clearTrace: "Clear tracing"
    },
    my: {
      curriculumTitle: "အဆင့်လိုက် ကျွမ်းကျင်မှုများ တည်ဆောက်ပါ",
      curriculumIntro: "နေ့စဉ်သုံး ဝေါဟာရများကို လေ့လာပြီး အစပြုသူမှ ကျွမ်းကျင်အဆင့်အထိ ဖတ်ခြင်း၊ နားထောင်ခြင်း၊ ရေးခြင်းနှင့် ပြောခြင်းကို လေ့ကျင့်ပါ။",
      vocabularyTitle: "အမျိုးအစားအလိုက် ဝေါဟာရ",
      vocabularyIntro: "နေ့စဉ်ဘဝအကြောင်းအရာကို ရွေးပါ။ စကားလုံးကိုနှိပ်၍ မြန်မာအဓိပ္ပာယ်နှင့် ဥပမာဝါကျကို ကြည့်ပါ။",
      practiceTitle: "ကျွမ်းကျင်မှုအလိုက် လေ့ကျင့်ခန်း",
      practiceIntro: "ရွေးထားသောအဆင့်တွင် လေ့ကျင့်ပါ။ ကျွမ်းကျင်မှု သို့မဟုတ် အဆင့်ပြောင်းရန် သက်ဆိုင်ရာစာမျက်နှာသို့ သွားပါ။",
      letterTitle: "Smart Writing Lab · လက်ရေးလေ့ကျင့်ခန်း",
      letterIntro: "စာလုံးအကြီး၊ အသေးများကို လမ်းညွှန် Animation နှင့် လက်ချောင်းဖြင့် လိုက်ရေးပါ။ Print၊ Cursive သို့မဟုတ် Calligraphy ကို ရွေးနိုင်သည်။",
      chooseLetter: "အက္ခရာရွေးပါ",
      chooseStyle: "ရေးသားမှုပုံစံ",
      replay: "မျဉ်းဆွဲလှုပ်ရှားမှု ပြန်ကြည့်ရန်",
      listen: "နမူနာအသံ နားထောင်ရန်",
      answerPlaceholder: "ဤနေရာတွင် အဖြေ သို့မဟုတ် မှတ်စုရေးပါ…",
      speakingNote: "အဖြေကို အသံထွက်ပြောပါ။ အောက်ရှိ Speaking လေ့ကျင့်ခန်းတွင် browser က ပံ့ပိုးပါက မိုက်ခရိုဖုန်းဖြင့် စမ်းသပ်နိုင်သည်။",
      traceTitle: "စာလုံးကို လိုက်ရေးလေ့ကျင့်ပါ",
      traceIntro: "ဖျော့ဖျော့ပြထားသော စာလုံးကို လက်ချောင်း သို့မဟုတ် mouse ဖြင့် လိုက်ရေးပါ။ ရေးဆွဲချက်ကို ဤစာမျက်နှာတွင်သာ ထားရှိပြီး upload မလုပ်ပါ။",
      clearTrace: "လေ့ကျင့်မှုကို ရှင်းရန်"
    }
  }[next];
  $("#curriculum-title").textContent = copy.curriculumTitle;
  $(".curriculum-header > div > p:last-child").textContent = copy.curriculumIntro;
  $("#vocabulary-heading").textContent = copy.vocabularyTitle;
  $("#vocabulary-heading").nextElementSibling.textContent = copy.vocabularyIntro;
  $("#practice-heading").textContent = copy.practiceTitle;
  $("#practice-heading").nextElementSibling.textContent = copy.practiceIntro;
  $("#letter-practice-heading").textContent = copy.letterTitle;
  $("#letter-practice-heading").nextElementSibling.textContent = copy.letterIntro;
  $("#letter-select").previousElementSibling.textContent = copy.chooseLetter;
  $("#letter-style").previousElementSibling.textContent = copy.chooseStyle;
  $("#replay-letter").textContent = copy.replay;
  $("#practice-action").textContent = copy.listen;
  $("#level-practice-answer").placeholder = copy.answerPlaceholder;
  $("#practice-speaking-note").textContent = copy.speakingNote;
  $("#tracing-heading").textContent = copy.traceTitle;
  $("#letter-tracing").previousElementSibling.textContent = copy.traceIntro;
  $("#clear-tracing").textContent = copy.clearTrace;
  $("#complete-practice").textContent = next === "my" ? "ဤလေ့ကျင့်ခန်း ပြီးမြောက်ကြောင်း မှတ်ရန်" : "Mark practice complete";
  $("#export-progress").textContent = next === "my" ? "မှတ်တမ်း Export ထုတ်ရန်" : "Export progress";
  $("#clear-progress").textContent = next === "my" ? "မှတ်တမ်းရှင်းရန်" : "Clear progress";
  renderProgress();
  const styleOptions = $("#letter-style").options;
  styleOptions[0].textContent = next === "my" ? "ပုံနှိပ်စာလုံး · အကြီး / အသေး" : "Print · Uppercase / lowercase";
  styleOptions[1].textContent = next === "my" ? "Cursive · ဆက်ရေးဟန်" : "Cursive";
  styleOptions[2].textContent = next === "my" ? "Calligraphy · အလှရေးဟန်" : "Calligraphy";
  renderCategoryOptions();
  renderVocabulary();
  renderLevelOptions();
  renderPractice();
  renderLetterGuide();
}

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => {
  activeSkill = button.dataset.skill;
  selectedExerciseIndex = 0;
  if (location.hash.slice(1).split("/").filter(Boolean)[0] === "home" || !location.hash || location.hash === "#") {
    location.hash = `#/${activeSkill}`;
    return;
  }
  renderPractice();
}));
$("#start-selected-practice").addEventListener("click", () => {
  location.hash = `#/${activeSkill}`;
});
function syncSkillLevelPage() {
  const page = location.hash.slice(1).split("/").filter(Boolean)[0] || "home";
  document.body.classList.toggle("skills-levels-page", page === "skills");
  const picker = $(".skill-level-picker");
  if (picker) picker.setAttribute("aria-hidden", page === "skills" ? "false" : "true");
}
syncSkillLevelPage();
window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1).split("/").filter(Boolean)[0];
  syncSkillLevelPage();
  if (["reading", "listening", "writing", "speaking"].includes(page)) {
    activeSkill = page;
    renderPractice();
  }
});
$("#vocabulary-category").addEventListener("change", (event) => {
  selectedCategory = event.target.value;
  selectedWord = null;
  $("#vocabulary-detail").hidden = true;
  renderVocabulary();
});

$("#next-practice").addEventListener("click", () => {
  const count = getPracticeCount(activeSkill, selectedLevel);
  if (count < 2) return;
  selectedExerciseIndex = (selectedExerciseIndex + 1) % count;
  renderPractice();
});

function preferredEnglishVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const select = $("#voice-select");
  const selected = select && select.value !== "" ? voices[Number(select.value)] : null;
  if (selected && /^en([_-]|$)/i.test(selected.lang)) return selected;
  const english = voices.filter((voice) => /^en([_-]|$)/i.test(voice.lang));
  return english.find((voice) => /natural|neural|online|google|microsoft|samantha|aria|jenny|guy|ava/i.test(voice.name)) ?? english.find((voice) => /^en-US$/i.test(voice.lang)) ?? english[0] ?? null;
}

$("#practice-action").addEventListener("click", () => {
  const text = activePractice().prompt;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    setStatus(language === "my" ? "ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။" : "Text-to-speech is not available in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = preferredEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = Number($("#speech-speed")?.value || 0.9);
  utterance.onstart = () => setStatus(language === "my" ? "လေ့ကျင့်ခန်းကို နားထောင်နေသည်…" : "Playing the model sentence…");
  utterance.onend = () => setStatus(language === "my" ? "နားထောင်ပြီး လိုက်လေ့ကျင့်ပါ။" : "Now repeat or answer the exercise.");
  window.speechSynthesis.speak(utterance);
});
$("#letter-select").addEventListener("change", (event) => {
  selectedLetter = event.target.value;
  traceStrokes = [];
  renderLetterGuide();
});
$("#letter-style").addEventListener("change", (event) => {
  selectedStyle = event.target.value;
  traceStrokes = [];
  renderLetterGuide();
});
$("#replay-letter").addEventListener("click", () => { renderLetterGuide(); setStatus(language === "my" ? "လမ်းညွှန်ကို ပြန်ဖော်ပြပြီးပါပြီ။ အောက်တွင် လက်ဖြင့်လိုက်ရေးပါ။" : "Guide refreshed. Trace the faint letter on the board below."); });

const tracingCanvas = $("#letter-tracing");
let traceDrawing = false;
let traceLastPoint = null;
let traceStrokes = [];
tracingCanvas.addEventListener("pointerdown", (event) => {
  const rect = tracingCanvas.getBoundingClientRect();
  const context = tracingCanvas.getContext("2d");
  if (!context || !rect.width || !rect.height) return;
  traceDrawing = true;
  traceLastPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  traceStrokes.push({
    style: selectedStyle,
    points: [{ x: traceLastPoint.x / rect.width, y: traceLastPoint.y / rect.height, pressure: event.pressure }]
  });
  tracingCanvas.setPointerCapture(event.pointerId);
  context.beginPath();
  context.moveTo(traceLastPoint.x, traceLastPoint.y);
});
tracingCanvas.addEventListener("pointermove", (event) => {
  if (!traceDrawing || !traceLastPoint) return;
  const rect = tracingCanvas.getBoundingClientRect();
  const context = tracingCanvas.getContext("2d");
  if (!context || !rect.width || !rect.height) return;
  const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  const stroke = traceStrokes[traceStrokes.length - 1];
  const normalizedPoint = { x: point.x / rect.width, y: point.y / rect.height, pressure: event.pressure };
  const previous = stroke.points[stroke.points.length - 1];
  stroke.points.push(normalizedPoint);
  drawTraceSegment(context, stroke, previous, normalizedPoint, rect.width, rect.height);
  traceLastPoint = point;
});
const stopTrace = () => { traceDrawing = false; traceLastPoint = null; };
tracingCanvas.addEventListener("pointerup", stopTrace);
tracingCanvas.addEventListener("pointercancel", stopTrace);
$("#clear-tracing").addEventListener("click", () => {
  traceStrokes = [];
  renderTraceTemplate();
});
window.addEventListener("resize", () => renderTraceTemplate());

$("#complete-practice").addEventListener("click", () => {
  try {
    const nextProgress = markPracticeComplete(progress, activeSkill, selectedLevel, selectedExerciseIndex);
    if (!saveProgress(nextProgress)) {
      setStatus(language === "my" ? "မှတ်တမ်းကို ဤစက်တွင် သိမ်း၍မရပါ။ Storage ခွင့်ပြုချက်ကို စစ်ပါ။" : "Progress could not be saved on this device. Check storage availability.");
      return;
    }
    progress = nextProgress;
    renderProgress();
    setStatus(language === "my" ? "လေ့ကျင့်ခန်းပြီးမြောက်မှုကို သိမ်းဆည်းပြီးပါပြီ။" : "Practice completion saved on this device.");
  } catch {
    setStatus(language === "my" ? "မှတ်တမ်းသိမ်းရာတွင် အမှားဖြစ်နေသည်။" : "Could not record this completion.");
  }
});

$("#export-progress").addEventListener("click", () => {
  try {
    const blob = new Blob([exportProgress(progress)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "learning-everyday-progress.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(language === "my" ? "မှတ်တမ်းဖိုင်ကို Export ထုတ်ပြီးပါပြီ။" : "Progress export started.");
  } catch {
    setStatus(language === "my" ? "မှတ်တမ်း Export မလုပ်နိုင်ပါ။" : "Progress export is not available in this browser.");
  }
});

$("#clear-progress").addEventListener("click", () => {
  const confirmed = window.confirm(language === "my"
    ? "ဤစက်ပေါ်ရှိ Learning Everyday လေ့ကျင့်မှုမှတ်တမ်းအားလုံးကို ရှင်းမည်လား။"
    : "Clear all Learning Everyday progress saved on this device?");
  if (!confirmed) return;
  if (!clearProgress()) {
    setStatus(language === "my" ? "မှတ်တမ်းကို မရှင်းနိုင်ပါ။" : "Progress could not be cleared.");
    return;
  }
  progress = loadProgress();
  renderProgress();
  setStatus(language === "my" ? "လေ့ကျင့်မှုမှတ်တမ်းကို ရှင်းပြီးပါပြီ။" : "Learning progress cleared from this device.");
});

const languageButton = $("#language-toggle");
languageButton.addEventListener("click", () => window.setTimeout(() => setLanguage(document.documentElement.lang === "my" ? "my" : "en"), 0));
new MutationObserver(() => setLanguage(document.documentElement.lang === "my" ? "my" : "en"))
  .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

renderCategoryOptions();
renderVocabulary();
renderLevelOptions();
renderLetterOptions();
renderPractice();
renderLetterGuide();
renderProgress();
