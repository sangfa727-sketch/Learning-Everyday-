import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, ALPHABET, getPractice } from "./curriculum.js";
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
  const guide = LETTER_GUIDES[selectedLetter] ?? {
    start: `Trace the ${selectedLetter === selectedLetter.toUpperCase() ? "uppercase" : "lowercase"} letter slowly, following the faint template.`,
    my: `ဖျော့ဖျော့လမ်းညွှန်စာလုံးအတိုင်း ${selectedLetter === selectedLetter.toUpperCase() ? "စာလုံးအကြီး" : "စာလုံးအသေး"} ကို ဖြည်းဖြည်းလိုက်ရေးပါ။`,
    paths: []
  };
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
  if (guide.paths.length) {
    guide.paths.forEach((d, index) => svg.append(makeSvgPath(d, index)));
  } else {
    const glyph = document.createElementNS(ns, "text");
    glyph.setAttribute("x", "50"); glyph.setAttribute("y", "76");
    glyph.setAttribute("text-anchor", "middle"); glyph.setAttribute("class", "letter-template-glyph");
    glyph.textContent = selectedLetter;
    svg.append(glyph);
  }
  const start = document.createElementNS(ns, "circle");
  start.setAttribute("cx", selectedLetter.toLowerCase() === "a" || selectedLetter === "B" || selectedLetter === "b" ? "30" : selectedLetter === "C" || selectedLetter === "c" ? "78" : "50");
  start.setAttribute("cy", selectedLetter === "A" ? "12" : selectedLetter === "a" ? "48" : selectedLetter === "C" || selectedLetter === "c" ? "25" : "12");
  start.setAttribute("r", "3");
  start.setAttribute("class", "letter-start-dot");
  if (guide.paths.length) svg.append(start);
  $("#letter-stroke-count").textContent = guide.paths.length && selectedStyle === "print"
    ? (language === "my" ? `မျဉ်း ${guide.paths.length} ကြောင်း · တစ်ကြောင်းချင်း လှုပ်ရှားမှုကို ကြည့်ပါ` : `${guide.paths.length} strokes · Watch each movement in order`)
    : (language === "my" ? (guide.paths.length ? "လှုပ်ရှားမှုသည် ပုံနှိပ်စာလုံးအခြေခံလမ်းညွှန်ဖြစ်သည်။ စတိုင်အလိုက် အထက်ပါညွှန်ကြားချက်ကို လိုက်နာပါ။" : "ဤစာလုံးအတွက် လမ်းညွှန်ပုံစံကို ပြထားသည်။ အောက်ရှိ tracing board တွင် လိုက်ရေးပါ။") : (guide.paths.length ? "Animation is the print reference; follow the style-specific directions above." : "Template preview only; trace the letter on the practice board below."));
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
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  const fontSize = Math.max(72, Math.min(180, rect.height * 0.68, rect.width * 0.55));
  const font = selectedStyle === "cursive" ? `italic ${fontSize}px cursive`
    : selectedStyle === "calligraphy" ? `bold ${fontSize}px Georgia, serif`
    : `${fontSize}px Arial, sans-serif`;
  context.font = font;
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(90, 124, 91, 0.28)";
  context.strokeText(selectedLetter, rect.width / 2, rect.height * 0.76);
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
      letterIntro: "Practise all 26 uppercase and lowercase letters. Choose print, cursive, or calligraphy, then use the tracing board.",
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
      practiceTitle: "ကျွမ်းကျင်မှု ၄ မျိုး · အဆင့် ၆ ဆင့်",
      practiceIntro: "အဆင့်တစ်ခုကိုရွေးပြီး အပေါ်ရှိ ကျွမ်းကျင်မှုကတ်များမှ လေ့ကျင့်ခန်းကို ပြောင်းလဲပါ။",
      letterTitle: "အက္ခရာရေးသားမှု လေ့ကျင့်ခန်း",
      letterIntro: "အင်္ဂလိပ်စာလုံးအကြီး၊ အသေး ၂၆ လုံးစီကို လေ့ကျင့်ပါ။ Print၊ Cursive သို့မဟုတ် Calligraphy ကိုရွေးပြီး tracing board တွင် လိုက်ရေးပါ။",
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
$("#replay-letter").addEventListener("click", () => { renderLetterGuide(); setStatus(language === "my" ? "လမ်းညွှန်ကို ပြန်ဖော်ပြပြီးပါပြီ။ အောက်တွင် လက်ဖြင့်လိုက်ရေးပါ။" : "Guide refreshed. Trace the faint letter on the board below."); });

const tracingCanvas = $("#letter-tracing");
let traceDrawing = false;
let traceLastPoint = null;
tracingCanvas.addEventListener("pointerdown", (event) => {
  const rect = tracingCanvas.getBoundingClientRect();
  const context = tracingCanvas.getContext("2d");
  if (!context) return;
  traceDrawing = true;
  traceLastPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  tracingCanvas.setPointerCapture(event.pointerId);
  context.beginPath(); context.moveTo(traceLastPoint.x, traceLastPoint.y);
});
tracingCanvas.addEventListener("pointermove", (event) => {
  if (!traceDrawing || !traceLastPoint) return;
  const rect = tracingCanvas.getBoundingClientRect();
  const context = tracingCanvas.getContext("2d");
  if (!context) return;
  const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  context.strokeStyle = selectedStyle === "calligraphy" ? "#24554a" : "#477b62";
  context.lineWidth = selectedStyle === "calligraphy" ? 5 : selectedStyle === "cursive" ? 3.5 : 4;
  context.lineCap = "round"; context.lineJoin = "round";
  context.lineTo(point.x, point.y); context.stroke();
  traceLastPoint = point;
});
const stopTrace = () => { traceDrawing = false; traceLastPoint = null; };
tracingCanvas.addEventListener("pointerup", stopTrace);
tracingCanvas.addEventListener("pointercancel", stopTrace);
$("#clear-tracing").addEventListener("click", () => renderTraceTemplate());
window.addEventListener("resize", () => renderTraceTemplate());

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
