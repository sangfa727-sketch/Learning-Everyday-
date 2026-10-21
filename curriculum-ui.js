import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, ALPHABET, getPractice, getPracticeCount } from "./curriculum.js";
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

function renderLetterGuide() {
  const guide = LETTER_GUIDES[selectedLetter] ?? {
    start: `Trace the ${selectedLetter === selectedLetter.toUpperCase() ? "uppercase" : "lowercase"} letter slowly, following the faint template.`,
    my: `ဖျော့ဖျော့လမ်းညွှန်စာလုံးအတိုင်း ${selectedLetter === selectedLetter.toUpperCase() ? "စာလုံးအကြီး" : "စာလုံးအသေး"} ကို ဖြည်းဖြည်းလိုက်ရေးပါ။`,
    paths: []
  };
  const sample = $("#letter-sample");
  sample.textContent = selectedLetter;
  sample.classList.remove("style-print", "style-cursive", "style-calligraphy");
  sample.classList.add(`style-${selectedStyle}`);
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
    const strokeGroup = document.createElementNS(ns, "g");
    strokeGroup.setAttribute("class", `letter-guide-strokes style-${selectedStyle}`);
    if (selectedStyle === "cursive") strokeGroup.setAttribute("transform", "skewX(-7) translate(5 0)");
    guide.paths.forEach((d, index) => {
      const path = makeSvgPath(d, index);
      path.classList.add(`style-${selectedStyle}`);
      path.style.animationDelay = `${index * 650}ms`;
      strokeGroup.append(path);
      if (selectedStyle === "calligraphy") {
        const highlight = makeSvgPath(d, index);
        highlight.classList.add("calligraphy-highlight");
        highlight.style.animationDelay = `${index * 650}ms`;
        strokeGroup.append(highlight);
      }
    });
    svg.append(strokeGroup);
    const start = document.createElementNS(ns, "circle");
    const firstMove = guide.paths[0]?.match(/^M\s*([\d.]+)[ ,]+([\d.]+)/);
    start.setAttribute("cx", firstMove?.[1] ?? "50");
    start.setAttribute("cy", firstMove?.[2] ?? "12");
    start.setAttribute("r", "3");
    start.setAttribute("class", "letter-start-dot");
    svg.append(start);
    if (selectedStyle === "cursive") {
      const entry = document.createElementNS(ns, "path");
      entry.setAttribute("d", "M 12 79 C 19 69, 24 71, 30 78");
      entry.setAttribute("class", "letter-style-flourish");
      svg.append(entry);
      const exit = document.createElementNS(ns, "path");
      exit.setAttribute("d", "M 68 78 C 76 84, 83 82, 89 73");
      exit.setAttribute("class", "letter-style-flourish");
      svg.append(exit);
    }
  } else {
    const glyph = document.createElementNS(ns, "text");
    glyph.setAttribute("x", "50"); glyph.setAttribute("y", "76");
    glyph.setAttribute("text-anchor", "middle");
    glyph.setAttribute("class", `letter-template-glyph style-${selectedStyle}`);
    glyph.textContent = selectedLetter;
    svg.append(glyph);
  }
  $("#letter-stroke-count").textContent = guide.paths.length
    ? selectedStyle === "print"
      ? (language === "my" ? `မျဉ်း ${guide.paths.length} ကြောင်း · အစဉ်လိုက် မျဉ်းဆွဲလှုပ်ရှားမှု` : `${guide.paths.length} strokes · Animated in writing order`)
      : selectedStyle === "cursive"
        ? (language === "my" ? `Cursive မျဉ်း ${guide.paths.length} ကြောင်း · စောင်းရေးဟန်နှင့် ဆက်ရေးဝင်/ထွက်မျဉ်း` : `Cursive guide · ${guide.paths.length} animated strokes with a slanted entry/exit style`)
        : (language === "my" ? `Calligraphy မျဉ်း ${guide.paths.length} ကြောင်း · အထူမျဉ်းနှင့် အလင်းအတွင်းမျဉ်း` : `Calligraphy guide · ${guide.paths.length} animated strokes with a thick-and-thin overlay`)
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
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  const fontSize = Math.max(72, Math.min(180, rect.height * 0.68, rect.width * 0.55));
  const font = selectedStyle === "cursive" ? `italic ${fontSize}px "Segoe Print", "Comic Sans MS", cursive`
    : selectedStyle === "calligraphy" ? `italic bold ${fontSize}px "URW Chancery L", "Brush Script MT", "Apple Chancery", cursive`
    : `${fontSize}px Arial, sans-serif`;
  context.font = font;
  context.lineWidth = selectedStyle === "calligraphy" ? 2.8 : selectedStyle === "cursive" ? 1.1 : 1.5;
  context.strokeStyle = "rgba(90, 124, 91, 0.32)";
  context.strokeText(selectedLetter, rect.width / 2, rect.height * 0.76);
  if (selectedStyle === "calligraphy") {
    context.fillStyle = "rgba(90, 124, 91, 0.08)";
    context.fillText(selectedLetter, rect.width / 2, rect.height * 0.76);
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
      practiceTitle: "ကျွမ်းကျင်မှုအလိုက် လေ့ကျင့်ခန်း",
      practiceIntro: "ရွေးထားသောအဆင့်တွင် လေ့ကျင့်ပါ။ ကျွမ်းကျင်မှု သို့မဟုတ် အဆင့်ပြောင်းရန် သက်ဆိုင်ရာစာမျက်နှာသို့ သွားပါ။",
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
  selectedExerciseIndex = 0;
  renderPractice();
}));
$("#start-selected-practice").addEventListener("click", () => {
  location.hash = `#/${activeSkill}`;
});
window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1).split("/").filter(Boolean)[0];
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
