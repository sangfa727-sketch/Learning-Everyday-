import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, getPractice } from "./curriculum.js";

const $ = (selector, root = document) => root.querySelector(selector);
const ns = "http://www.w3.org/2000/svg";
let selectedCategory = VOCABULARY_CATEGORIES[0].id;
let selectedLevel = "A1";
let selectedLetter = "A";
let selectedStyle = "print";
let selectedWord = null;
let activeSkill = "reading";
let language = document.documentElement.lang === "my" ? "my" : "en";

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
  return getPractice(activeSkill, selectedLevel);
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
  const select = $("#practice-level");
  select.replaceChildren();
  for (const level of LEVELS) {
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = `${level.id} · ${labelForLevel(level)}`;
    select.append(option);
  }
  select.value = selectedLevel;
}

function renderPractice() {
  const practice = activePractice();
  const level = LEVELS.find((item) => item.id === selectedLevel);
  $("#level-practice-title").textContent = language === "my" ? practice.my : practice.title;
  $("#level-practice-level").textContent = `${level.id} · ${labelForLevel(level)}`;
  $("#level-practice-prompt").textContent = practice.prompt;
  $("#level-practice-task").textContent = language === "my" ? practice.myTask : practice.task;
  $("#level-practice-answer").value = "";
  $("#level-practice-answer").placeholder = language === "my" ? "ဤနေရာတွင် လေ့ကျင့်ပါ…" : "Write your answer or notes here…";
  $("#practice-answer-wrap").hidden = activeSkill !== "writing";
  $("#practice-listen").hidden = activeSkill !== "listening";
  $("#practice-speaking-note").hidden = activeSkill !== "speaking";
  $("#practice-action").textContent = activeSkill === "speaking"
    ? (language === "my" ? "ဝါကျကို နားထောင်ရန်" : "Listen to model")
    : (language === "my" ? "နမူနာကို နားထောင်ရန်" : "Listen to model");
}

function makeSvgPath(d, index) {
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  path.setAttribute("class", "letter-stroke");
  path.setAttribute("pathLength", "1");
  path.style.animationDelay = `${index * 650}ms`;
  return path;
}

function renderLetterGuide() {
  const guide = LETTER_GUIDES[selectedLetter];
  $("#letter-sample").textContent = selectedLetter;
  $("#letter-style-note").textContent = styleInfo[selectedStyle][language];
  $("#letter-start-instruction").textContent = language === "my" ? guide.my : guide.start;
  $("#letter-guide-title").textContent = `${selectedStyle === "print" ? (language === "my" ? "ပုံနှိပ်စာလုံး" : "Print") : selectedStyle === "cursive" ? "Cursive" : "Calligraphy"} · ${selectedLetter}`;
  const svg = $("#letter-animation");
  svg.replaceChildren();
  const baseline = document.createElementNS(ns, "line");
  baseline.setAttribute("x1", "8"); baseline.setAttribute("x2", "92");
  baseline.setAttribute("y1", "88"); baseline.setAttribute("y2", "88");
  baseline.setAttribute("class", "letter-baseline");
  svg.append(baseline);
  guide.paths.forEach((d, index) => svg.append(makeSvgPath(d, index)));
  const start = document.createElementNS(ns, "circle");
  start.setAttribute("cx", selectedLetter.toLowerCase() === "a" || selectedLetter === "B" || selectedLetter === "b" ? "30" : selectedLetter === "C" || selectedLetter === "c" ? "78" : "50");
  start.setAttribute("cy", selectedLetter === "A" ? "12" : selectedLetter === "a" ? "48" : selectedLetter === "C" || selectedLetter === "c" ? "25" : "12");
  start.setAttribute("r", "3");
  start.setAttribute("class", "letter-start-dot");
  svg.append(start);
  $("#letter-stroke-count").textContent = language === "my"
    ? `မျဉ်း ${guide.paths.length} ကြောင်း · တစ်ကြောင်းချင်း လှုပ်ရှားမှုကို ကြည့်ပါ`
    : `${guide.paths.length} strokes · Watch each movement in order`;
}

function renderLetterOptions() {
  const letterSelect = $("#letter-select");
  letterSelect.replaceChildren();
  for (const letter of "ABCabc") {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    letterSelect.append(option);
  }
  letterSelect.value = selectedLetter;
}

function setLanguage(next) {
  language = next;
  renderCategoryOptions();
  renderVocabulary();
  renderLevelOptions();
  renderPractice();
  renderLetterGuide();
}

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => {
  activeSkill = button.dataset.skill;
  renderPractice();
}));
$("#vocabulary-category").addEventListener("change", (event) => {
  selectedCategory = event.target.value;
  selectedWord = null;
  $("#vocabulary-detail").hidden = true;
  renderVocabulary();
});
$("#practice-level").addEventListener("change", (event) => {
  selectedLevel = event.target.value;
  renderPractice();
});
$("#practice-action").addEventListener("click", () => {
  const text = activePractice().prompt;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    setStatus(language === "my" ? "ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။" : "Text-to-speech is not available in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.onstart = () => setStatus(language === "my" ? "လေ့ကျင့်ခန်းကို နားထောင်နေသည်…" : "Playing the model sentence…");
  utterance.onend = () => setStatus(language === "my" ? "နားထောင်ပြီး လိုက်လေ့ကျင့်ပါ။" : "Now repeat or answer the exercise.");
  window.speechSynthesis.speak(utterance);
});
$("#letter-select").addEventListener("change", (event) => { selectedLetter = event.target.value; renderLetterGuide(); });
$("#letter-style").addEventListener("change", (event) => { selectedStyle = event.target.value; renderLetterGuide(); });
$("#replay-letter").addEventListener("click", () => {
  const svg = $("#letter-animation");
  svg.classList.remove("replay");
  void svg.getBoundingClientRect();
  svg.classList.add("replay");
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
