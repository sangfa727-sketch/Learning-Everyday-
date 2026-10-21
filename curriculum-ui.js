import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, getPractice } from "./curriculum.js";
import { loadProgress, saveProgress, markPracticeComplete, clearProgress, exportProgress } from "./progress-state.js";

const $ = (selector, root = document) => root.querySelector(selector);
const ns = "http://www.w3.org/2000/svg";
let selectedCategory = VOCABULARY_CATEGORIES[0].id;
let selectedLevel = "A1";
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
    : `${count} completed skill-level practices · saved on this device only`;
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
  $("#practice-answer-wrap").hidden = activeSkill !== "writing" && activeSkill !== "reading";
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
  const styleStart = selectedStyle === "cursive"
    ? (language === "my" ? "Cursive: စာလုံး၏ ဝင်မျဉ်းမှစပြီး သင့်တော်သည့်နေရာတွင် ဘောပင်မမြှောက်ဘဲ နောက်စာလုံးသို့ ဆက်ပါ။ " : "Cursive: begin with an entry stroke and connect into the next letter where the form allows. ")
    : selectedStyle === "calligraphy"
      ? (language === "my" ? "Calligraphy: ဝင်မျဉ်းကို ဖိအားပေါ့ပေါ့ဖြင့်စပါ။ အောက်ဆင်းမျဉ်းတွင် ဖိအားတိုးပြီး အပေါ်တက်မျဉ်းတွင် လျှော့ပါ။ " : "Calligraphy: start the entry stroke lightly, add pressure on downstrokes, and release pressure on upstrokes. ")
      : "";
  $("#letter-start-instruction").textContent = (language === "my" ? guide.my : guide.start) + (selectedStyle === "print" ? "" : " " + styleStart);
  $("#letter-guide-title").textContent = selectedStyle === "print"
    ? `${language === "my" ? "ပုံနှိပ်စာလုံး" : "Print stroke guide"} · ${selectedLetter}`
    : `${selectedStyle === "cursive" ? "Cursive" : "Calligraphy"} · ${selectedLetter}`;

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
  $("#letter-stroke-count").textContent = selectedStyle === "print"
    ? (language === "my" ? `မျဉ်း ${guide.paths.length} ကြောင်း · တစ်ကြောင်းချင်း လှုပ်ရှားမှုကို ကြည့်ပါ` : `${guide.paths.length} strokes · Watch each movement in order`)
    : (language === "my" ? "လှုပ်ရှားမှုသည် ပုံနှိပ်စာလုံးအခြေခံလမ်းညွှန်ဖြစ်သည်။ စတိုင်အလိုက် အထက်ပါညွှန်ကြားချက်ကို လိုက်နာပါ။" : "Animation is the print reference; follow the style-specific directions above.");
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
  const copy = {
    en: {
      curriculumTitle: "Build skills step by step",
      curriculumIntro: "Explore everyday vocabulary, then practise reading, listening, writing and speaking from Beginner to Proficient.",
      vocabularyTitle: "Vocabulary by topic",
      vocabularyIntro: "Choose a real-life topic. Tap a word to see its Myanmar meaning and an example sentence.",
      practiceTitle: "Four skills · six levels",
      practiceIntro: "Select a level, then use the skill cards above to change the exercise.",
      letterTitle: "Letter writing studio",
      letterIntro: "Practise uppercase and lowercase print, then explore cursive and calligraphy. The animated guide shows sample stroke sequences.",
      chooseLetter: "Choose a letter",
      chooseStyle: "Writing style",
      replay: "Replay stroke animation",
      listen: "Listen to model",
      answerPlaceholder: "Write your answer or notes here…",
      speakingNote: "Say your response aloud. The speaking practice controls in the lesson panel below offer optional browser microphone recognition where supported."
    },
    my: {
      curriculumTitle: "အဆင့်လိုက် ကျွမ်းကျင်မှုများ တည်ဆောက်ပါ",
      curriculumIntro: "နေ့စဉ်သုံး ဝေါဟာရများကို လေ့လာပြီး အစပြုသူမှ ကျွမ်းကျင်အဆင့်အထိ ဖတ်ခြင်း၊ နားထောင်ခြင်း၊ ရေးခြင်းနှင့် ပြောခြင်းကို လေ့ကျင့်ပါ။",
      vocabularyTitle: "အမျိုးအစားအလိုက် ဝေါဟာရ",
      vocabularyIntro: "နေ့စဉ်ဘဝအကြောင်းအရာကို ရွေးပါ။ စကားလုံးကိုနှိပ်၍ မြန်မာအဓိပ္ပာယ်နှင့် ဥပမာဝါကျကို ကြည့်ပါ။",
      practiceTitle: "ကျွမ်းကျင်မှု ၄ မျိုး · အဆင့် ၆ ဆင့်",
      practiceIntro: "အဆင့်တစ်ခုကိုရွေးပြီး အပေါ်ရှိ ကျွမ်းကျင်မှုကတ်များမှ လေ့ကျင့်ခန်းကို ပြောင်းလဲပါ။",
      letterTitle: "အက္ခရာရေးသားမှု လေ့ကျင့်ခန်း",
      letterIntro: "စာလုံးအကြီး၊ အသေးကို လေ့ကျင့်ပြီး Cursive နှင့် Calligraphy စတိုင်များကို လေ့လာပါ။ လှုပ်ရှားပုံတွင် အခြေခံမျဉ်းဆွဲအစီအစဉ်ကို ပြထားသည်။",
      chooseLetter: "အက္ခရာရွေးပါ",
      chooseStyle: "ရေးသားမှုပုံစံ",
      replay: "မျဉ်းဆွဲလှုပ်ရှားမှု ပြန်ကြည့်ရန်",
      listen: "နမူနာအသံ နားထောင်ရန်",
      answerPlaceholder: "ဤနေရာတွင် အဖြေ သို့မဟုတ် မှတ်စုရေးပါ…",
      speakingNote: "အဖြေကို အသံထွက်ပြောပါ။ အောက်ရှိ Speaking လေ့ကျင့်ခန်းတွင် browser က ပံ့ပိုးပါက မိုက်ခရိုဖုန်းဖြင့် စမ်းသပ်နိုင်သည်။"
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
$("#replay-letter").addEventListener("click", () => renderLetterGuide());

$("#complete-practice").addEventListener("click", () => {
  try {
    const nextProgress = markPracticeComplete(progress, activeSkill, selectedLevel);
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
    URL.revokeObjectURL(url);
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
