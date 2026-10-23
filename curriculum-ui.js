import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, LETTER_GUIDES, CURSIVE_GLYPHS, getPractice, getPracticeCount } from "./curriculum.js";
import { cursivePathsFor, splitCursiveStrokes } from "./cursive-paths.js";
import { loadProgress, saveProgress, markPracticeComplete, clearProgress, exportProgress } from "./progress-state.js";

const $ = (selector, root = document) => root.querySelector(selector);
const ns = "http://www.w3.org/2000/svg";


let selectedCategory = null;
let selectedLevel = "A1";
let selectedExerciseIndex = 0;
let selectedLetter = "A";
let selectedStyle = "print";
let selectedWord = null;
let vocabularyTitleNode = null;
let vocabularyListNode = null;
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
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = language === "my" ? "အမျိုးအစားရွေးပါ" : "Choose a topic";
  select.append(placeholder);
  for (const category of VOCABULARY_CATEGORIES) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = categoryLabel(category);
    select.append(option);
  }
  select.value = selectedCategory || "";
  select.hidden = true;

  let picker = $("#vocabulary-topic-picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "vocabulary-topic-picker";
    picker.className = "vocabulary-topic-picker";
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", language === "my" ? "ဝေါဟာရအမျိုးအစားရွေးရန်" : "Choose a vocabulary topic");
    select.insertAdjacentElement("afterend", picker);
  }

  const topicIcons = {
    home: "⌂", electrical: "ϟ", kitchen: "♨", food: "◉", clothing: "◇",
    school: "✎", bathroom: "◌", transport: "↗", weather: "☼", work: "▣",
    health: "✚", family: "♡", shopping: "♧", technology: "⌘", town: "⌖", time: "◷"
  };
  picker.replaceChildren();
  for (const category of VOCABULARY_CATEGORIES) {
    const shell = document.createElement("section");
    shell.className = "vocabulary-topic-shell";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vocabulary-topic-card";
    button.setAttribute("aria-label", language === "my"
      ? `${categoryLabel(category)} — ဝေါဟာရစာမျက်နှာသို့ ဝင်ရန်`
      : `Open ${categoryLabel(category)} vocabulary`);

    const icon = document.createElement("span");
    icon.className = "vocabulary-topic-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = topicIcons[category.id] || "✦";

    const label = document.createElement("span");
    label.className = "vocabulary-topic-label";
    label.textContent = categoryLabel(category);

    const marker = document.createElement("span");
    marker.className = "vocabulary-topic-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "↗";

    button.append(icon, label, marker);
    button.addEventListener("click", () => {
      selectedWord = null;
      location.hash = `#/reading/${category.id}`;
      if (location.hash === `#/reading/${category.id}`) syncVocabularyRoute();
    });
    shell.append(button);
    picker.append(shell);
  }
}

function syncVocabularyRoute() {
  const route = location.hash.slice(1).split("/").filter(Boolean);
  const requestedId = route[0] === "reading" ? route[1] : null;
  const category = VOCABULARY_CATEGORIES.find((item) => item.id === requestedId) || null;
  const nextCategory = category?.id || null;
  if (selectedCategory !== nextCategory) selectedWord = null;
  selectedCategory = nextCategory;

  if (category) document.body.dataset.vocabularyCategory = category.id;
  else delete document.body.dataset.vocabularyCategory;

  const heading = $("#vocabulary-heading");
  const intro = heading?.nextElementSibling;
  if (heading) heading.hidden = Boolean(category);
  if (intro) intro.hidden = Boolean(category);
  const back = $("#vocabulary-back-to-categories");
  if (back) {
    back.hidden = !category;
    back.textContent = language === "my" ? "← အမျိုးအစားများသို့ ပြန်သွားရန်" : "← Back to topics";
  }

  if (category) {
    const pageTitle = $("#page-title");
    const pageDescription = $("#page-description");
    const pageEyebrow = $("#page-navigation .eyebrow");
    if (pageTitle) pageTitle.textContent = categoryLabel(category);
    if (pageDescription) pageDescription.textContent = language === "my"
      ? "သက်ဆိုင်ရာ ဝေါဟာရ ၂၀ လုံး၏ အဓိပ္ပာယ်၊ အသံထွက်နှင့် ဥပမာဝါကျများကို လေ့လာပါ။"
      : "Explore 20 words with meanings, pronunciation and example sentences.";
    if (pageEyebrow) pageEyebrow.textContent = language === "my" ? "ဝေါဟာရ · အဓိပ္ပာယ် · အသံထွက်" : "VOCABULARY · MEANING · PRONUNCIATION";
    document.title = `${categoryLabel(category)} — Learning Everyday`;
    const categoryTitle = $("#vocabulary-category-title");
    if (categoryTitle) categoryTitle.textContent = categoryLabel(category);
  }
  renderCategoryOptions();
  renderVocabulary();
}

function speakVocabulary(text, label) {
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
  utterance.onstart = () => setStatus(language === "my" ? "အသံထွက်ဖတ်နေသည်…" : `Playing ${label.toLowerCase()}…`);
  utterance.onend = () => setStatus(language === "my" ? "နားထောင်ပြီးပါပြီ။" : "Playback finished.");
  window.speechSynthesis.speak(utterance);
}

function renderVocabulary() {
  const category = VOCABULARY_CATEGORIES.find((item) => item.id === selectedCategory);
  const list = vocabularyListNode || $("#vocabulary-list");
  vocabularyListNode = list;
  list.replaceChildren();
  const title = vocabularyTitleNode || $("#vocabulary-category-title");
  vocabularyTitleNode = title;
  if (!category) {
    title.textContent = "";
    title.hidden = true;
    list.hidden = true;
    return;
  }
  title.textContent = categoryLabel(category);
  title.hidden = false;
  list.hidden = false;
  if (selectedWord && !category.words.some(([word]) => word === selectedWord)) selectedWord = null;

  for (const [word, meaning, example] of category.words) {
    const entry = document.createElement("article");
    entry.className = "vocabulary-entry";

    const row = document.createElement("div");
    row.className = "vocabulary-entry-row";

    const wordButton = document.createElement("button");
    wordButton.type = "button";
    wordButton.className = "vocabulary-word";
    wordButton.setAttribute("aria-pressed", String(selectedWord === word));
    wordButton.setAttribute("aria-label", language === "my" ? `${word} — ${meaning}; အဓိပ္ပာယ်နှင့် ဥပမာဝါကျပြရန်` : `${word}: show meaning and example`);
    const wordEl = document.createElement("strong");
    wordEl.textContent = word;
    const meaningEl = document.createElement("span");
    meaningEl.textContent = meaning;
    wordButton.append(wordEl, meaningEl);
    wordButton.addEventListener("click", () => {
      if (selectedWord === word) {
        const detail = entry.querySelector(".vocabulary-detail");
        selectedWord = null;
        wordButton.setAttribute("aria-pressed", "false");
        if (detail) {
          detail.classList.remove("vocabulary-detail-in");
          detail.classList.add("is-closing");
          const finishClose = () => {
            if (selectedWord === null && list.contains(entry)) renderVocabulary();
          };
          detail.addEventListener("animationend", finishClose, { once: true });
          window.setTimeout(finishClose, 240);
        } else {
          renderVocabulary();
        }
        return;
      }
      selectedWord = word;
      renderVocabulary();
    });
    row.append(wordButton);

    const wordSpeaker = document.createElement("button");
    wordSpeaker.type = "button";
    wordSpeaker.className = "vocabulary-speaker";
    wordSpeaker.textContent = "🔊";
    wordSpeaker.setAttribute("aria-label", language === "my" ? `${word} အသံထွက်ဖတ်ရန်` : `Play pronunciation of ${word}`);
    wordSpeaker.title = language === "my" ? "စကားလုံးအသံထွက်" : "Play word pronunciation";
    wordSpeaker.addEventListener("click", () => speakVocabulary(word, "word pronunciation"));
    row.append(wordSpeaker);
    entry.append(row);

    if (selectedWord === word) {
      const detail = document.createElement("div");
      detail.className = "vocabulary-detail vocabulary-detail-in";
      detail.setAttribute("aria-live", "polite");

      const meaningHeading = document.createElement("strong");
      meaningHeading.className = "vocabulary-detail-meaning";
      meaningHeading.textContent = meaning;

      const sentenceRow = document.createElement("div");
      sentenceRow.className = "vocabulary-sentence-row";
      const sentence = document.createElement("p");
      sentence.className = "vocabulary-example";
      sentence.textContent = example;

      const sentenceSpeaker = document.createElement("button");
      sentenceSpeaker.type = "button";
      sentenceSpeaker.className = "vocabulary-sentence-speaker";
      sentenceSpeaker.textContent = "🔊";
      sentenceSpeaker.setAttribute("aria-label", language === "my" ? "ဥပမာဝါကျကို အသံထွက်ဖတ်ရန်" : "Play example sentence");
      sentenceSpeaker.title = language === "my" ? "ဝါကျအသံထွက်" : "Play example sentence";
      sentenceSpeaker.addEventListener("click", () => speakVocabulary(example, "example sentence"));

      sentenceRow.append(sentence, sentenceSpeaker);
      detail.append(meaningHeading, sentenceRow);
      entry.append(detail);
    }
    list.append(entry);
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
      renderSelectionPreview();
    });
    container.append(button);
  }
}

const skillObjectives = {
  reading: {
    en: ["Recognise familiar words and understand very short sentences.", "Understand simple everyday descriptions and short connected texts.", "Find main ideas and relevant details in clear, connected texts.", "Understand longer texts and compare viewpoints with more detail.", "Interpret complex texts, implied meaning and tone.", "Analyse demanding texts with precision, nuance and flexibility."],
    my: ["ရင်းနှီးပြီးသား စကားလုံးများနှင့် အလွန်တိုသော ဝါကျများကို နားလည်ရန်။", "နေ့စဉ်သုံး ဖော်ပြချက်များနှင့် ဆက်စပ်နေသော စာတိုများကို နားလည်ရန်။", "စာပိုဒ်၏ အဓိကအကြောင်းအရာနှင့် သက်ဆိုင်သော အသေးစိတ်ကို ရှာဖွေရန်။", "ပိုရှည်သောစာများနှင့် အမြင်ကွဲပြားမှုများကို နှိုင်းယှဉ်နားလည်ရန်။", "ရှုပ်ထွေးသောစာများ၏ သွယ်ဝိုက်အဓိပ္ပာယ်နှင့် လေသံကို နားလည်ရန်။", "ခက်ခဲသောစာများကို တိကျမှုနှင့် အဓိပ္ပာယ်နက်ရှိုင်းမှုဖြင့် သုံးသပ်ရန်။"]
  },
  listening: {
    en: ["Catch familiar words and the main point of slow, clear speech.", "Understand common phrases and short everyday messages.", "Follow the main points of clear speech on familiar topics.", "Follow longer speech, explanations and most discussions.", "Understand extended speech, attitude and implied meaning.", "Understand demanding speech with subtle distinctions and little effort."],
    my: ["ဖြည်းဖြည်းနှင့် ရှင်းလင်းစွာပြောသော စကားထဲမှ ရင်းနှီးသည့်စကားလုံးများနှင့် အဓိကအချက်ကို ဖမ်းယူရန်။", "နေ့စဉ်သုံး စကားစုများနှင့် စာတိုပြောဆိုမှုများကို နားလည်ရန်။", "ရင်းနှီးသောအကြောင်းအရာများအကြောင်း ရှင်းလင်းသည့် စကား၏ အဓိကအချက်များကို လိုက်နာရန်။", "ပိုရှည်သော ပြောဆိုမှု၊ ရှင်းလင်းချက်နှင့် ဆွေးနွေးချက်အများစုကို လိုက်နာရန်။", "ရှည်လျားသောစကား၏ သဘောထားနှင့် သွယ်ဝိုက်အဓိပ္ပာယ်ကို နားလည်ရန်။", "သိမ်မွေ့သော ကွဲပြားချက်များပါဝင်သည့် ခက်ခဲသောစကားကို လွယ်ကူတိကျစွာ နားလည်ရန်။"]
  },
  writing: {
    en: ["Write familiar words and very short personal sentences.", "Write simple connected sentences about everyday needs.", "Write a clear short text about familiar topics and experiences.", "Organise detailed text and explain reasons for an opinion.", "Write well-structured text on complex subjects with a clear tone.", "Write precise, fluent, well-structured text for complex purposes."],
    my: ["ရင်းနှီးသော စကားလုံးများနှင့် ကိုယ်ရေးအကြောင်း အလွန်တိုသော ဝါကျများကို ရေးရန်။", "နေ့စဉ်လိုအပ်ချက်များအကြောင်း ရိုးရှင်းသော ဆက်စပ်ဝါကျများ ရေးရန်။", "ရင်းနှီးသောအကြောင်းအရာနှင့် အတွေ့အကြုံများအကြောင်း စာတိုတစ်ပုဒ် ရှင်းလင်းစွာ ရေးရန်။", "အသေးစိတ်ပါသော စာကို စနစ်တကျဖွဲ့စည်းပြီး မိမိအမြင်၏ အကြောင်းရင်းကို ရှင်းပြရန်။", "ရှုပ်ထွေးသောအကြောင်းအရာများအတွက် ဖွဲ့စည်းပုံကောင်းပြီး လေသံသင့်တော်သောစာ ရေးရန်။", "ရည်ရွယ်ချက်ရှုပ်ထွေးသည့် စာများကို တိကျ၊ သွက်လက်ပြီး စနစ်တကျ ရေးသားရန်။"]
  },
  speaking: {
    en: ["Say familiar words and give simple personal information.", "Ask and answer simple questions in familiar situations.", "Describe experiences and explain simple opinions.", "Speak clearly at length and support a viewpoint with reasons.", "Express ideas fluently and adapt language to the situation.", "Communicate fluently and precisely with flexible nuance."],
    my: ["ရင်းနှီးသောစကားလုံးများကို ပြောပြီး ကိုယ်ရေးအချက်အလက် ရိုးရိုးဖော်ပြရန်။", "ရင်းနှီးသောအခြေအနေများတွင် ရိုးရှင်းသည့်မေးခွန်းများ မေးဖြေပြုလုပ်ရန်။", "အတွေ့အကြုံများကို ဖော်ပြပြီး ရိုးရှင်းသောအမြင်ကို ရှင်းပြရန်။", "အကြောင်းပြချက်များဖြင့် မိမိအမြင်ကို ရှင်းလင်းစွာ အချိန်ကြာကြာပြောရန်။", "အတွေးအမြင်များကို သွက်လက်စွာဖော်ပြပြီး အခြေအနေနှင့်ကိုက်ညီအောင် ဘာသာစကားအသုံးပြုရန်။", "သိမ်မွေ့သော အဓိပ္ပာယ်ကွဲပြားမှုများကို ထိန်းညှိ၍ သွက်လက်တိကျစွာ ဆက်သွယ်ရန်။"]
  }
};
function renderSelectionPreview() {
  const levelIndex = Math.max(0, LEVELS.findIndex((level) => level.id === selectedLevel));
  const level = LEVELS[levelIndex];
  const practice = activePractice();
  const skillNames = language === "my" ? { reading: "စာဖတ်ခြင်း", listening: "နားထောင်ခြင်း", writing: "စာရေးခြင်း", speaking: "စကားပြောခြင်း" } : { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };
  const title = $("#selected-path-title");
  const levelLabel = $("#selected-path-level");
  const objective = $("#selected-path-objective");
  const exerciseTitle = $("#selected-path-exercise-title");
  const prompt = $("#selected-path-exercise-prompt");
  if (!title || !levelLabel || !objective || !exerciseTitle || !prompt) return;
  title.textContent = `${skillNames[activeSkill]} · ${level.id}`;
  levelLabel.textContent = `${level.id} · ${labelForLevel(level)}`;
  objective.textContent = skillObjectives[activeSkill][language][levelIndex];
  exerciseTitle.textContent = language === "my" ? practice.my : practice.title;
  prompt.textContent = practice.prompt;
}
function syncStudyRoute() {
  const route = location.hash.slice(1).split("/").filter(Boolean);
  const page = route[0] || "home";
  if (["reading", "listening", "writing", "speaking"].includes(page)) {
    activeSkill = page;
    if (LEVELS.some((level) => level.id === route[1])) selectedLevel = route[1];
    selectedExerciseIndex = 0;
    renderLevelOptions();
    renderPractice();
    const levelIndex = Math.max(0, LEVELS.findIndex((item) => item.id === selectedLevel));
    const level = LEVELS[levelIndex];
    const skillNames = language === "my" ? { reading: "စာဖတ်ခြင်း", listening: "နားထောင်ခြင်း", writing: "စာရေးခြင်း", speaking: "စကားပြောခြင်း" } : { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };
    const pageTitle = $("#page-title");
    const pageDescription = $("#page-description");
    if (pageTitle) pageTitle.textContent = `${skillNames[activeSkill]} · ${level.id}`;
    if (pageDescription) pageDescription.textContent = skillObjectives[activeSkill][language][levelIndex];
  }
  renderSelectionPreview();
}

function syncSkillButtons() {
  document.querySelectorAll("[data-skill]").forEach((button) => {
    const selected = button.dataset.skill === activeSkill;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderPractice() {
  syncSkillButtons();
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
  sample.replaceChildren();
  sample.classList.remove("style-print", "style-cursive");
  sample.classList.add(`style-${selectedStyle}`);
  if (selectedStyle === "cursive") {
    // Render the same hand-drawn paths used by the animation, not a Unicode math font.
    const samplePaths = cursivePathsFor(selectedLetter) ?? [];
    if (samplePaths.length) {
      const sampleSvg = document.createElementNS(ns, "svg");
      sampleSvg.setAttribute("viewBox", "0 0 100 100");
      sampleSvg.setAttribute("class", "letter-sample-svg");
      sampleSvg.setAttribute("aria-hidden", "true");
      const orderedSamplePaths = splitCursiveStrokes(samplePaths);
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
    : "";
  $("#letter-start-instruction").textContent = selectedStyle === "cursive"
    ? styleStart
    : (language === "my" ? guide.my : guide.start) + (selectedStyle === "print" ? "" : " " + styleStart);
  $("#letter-guide-title").textContent = selectedStyle === "print"
    ? `${language === "my" ? "ပုံနှိပ်စာလုံး" : "Print stroke guide"} · ${selectedLetter}`
    : `Cursive · ${selectedLetter}`;

  // Cursive uses the shared hand-drawn centerline source; Print uses its own stroke guide.
  const stylePaths = selectedStyle === "cursive"
    ? (cursivePathsFor(selectedLetter) ?? [])
    : guide.paths;
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
    const orderedStrokePaths = splitCursiveStrokes(stylePaths);
    orderedStrokePaths.forEach((d, index) => {
      const path = makeSvgPath(d, index);
      path.classList.add(`style-${selectedStyle}`);
      path.style.animationDuration = "620ms";
      path.style.animationDelay = `${index * 650}ms`;
      strokeGroup.append(path);
    });
    svg.append(strokeGroup);
    // Mark each pen-down start so disconnected strokes and pen lifts are visible.
    orderedStrokePaths.forEach((d, index) => {
      const move = d.match(/^M\s*([-\d.]+)[ ,]+([-\d.]+)/);
      if (!move) return;
      const x = Number(move[1]);
      const y = Number(move[2]);
      const startMarker = document.createElementNS(ns, "circle");
      startMarker.setAttribute("cx", String(x));
      startMarker.setAttribute("cy", String(y));
      startMarker.setAttribute("r", "2.4");
      startMarker.setAttribute("class", "letter-start-dot");
      startMarker.setAttribute("aria-label", `Stroke ${index + 1} starts here`);
      svg.append(startMarker);
      const number = document.createElementNS(ns, "text");
      number.setAttribute("x", String(Math.min(96, Math.max(4, x + 3.5))));
      number.setAttribute("y", String(Math.max(7, y - 3.5)));
      number.setAttribute("class", "letter-stroke-number");
      number.textContent = String(index + 1);
      number.setAttribute("aria-hidden", "true");
      svg.append(number);
    });

  } else {
    const glyph = document.createElementNS(ns, "text");
    glyph.setAttribute("x", "50"); glyph.setAttribute("y", "76");
    glyph.setAttribute("text-anchor", "middle");
    glyph.setAttribute("class", `letter-template-glyph style-${selectedStyle}`);
    glyph.textContent = selectedStyle === "cursive" ? (CURSIVE_GLYPHS[selectedLetter] ?? selectedLetter) : selectedLetter;
    svg.append(glyph);
  }
  const visibleStrokeCount = splitCursiveStrokes(stylePaths).length;
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
  const handPaths = selectedStyle === "cursive" ? cursivePathsFor(selectedLetter) : null;
  if (handPaths && typeof Path2D === "function") {
    const size = Math.min(rect.width * 0.78, rect.height * 0.78);
    context.save();
    context.translate((rect.width - size) / 2, (rect.height - size) / 2);
    context.scale(size / 100, size / 100);
    context.strokeStyle = "rgba(65, 105, 79, 0.34)";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.4;
    for (const d of handPaths) context.stroke(new Path2D(d));
    context.restore();
  } else {
    // Font glyph is only a fallback when no hand-authored stroke paths exist.
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    const fontSize = Math.max(72, Math.min(180, rect.height * 0.68, rect.width * 0.55));
    context.font = `${fontSize}px Georgia, serif`;
    context.strokeText(selectedLetter, rect.width / 2, rect.height * 0.76);
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
        traceStrokes = [];
        renderLetterGuide();
      });
      row.append(button);
    }
    group.append(heading, row);
    grid.append(group);
  }
}


function renderScriptLetterPicker() {
  const card = $("#script-letter-card");
  const largeGlyph = $("#script-letter-card-glyph");
  const choices = document.querySelectorAll(".script-letter");
  if (!card || !largeGlyph || !choices.length) return;
  for (const choice of choices) {
    const glyph = choice.textContent.trim();
    choice.setAttribute("aria-label", `Show large script letter ${glyph}`);
    choice.setAttribute("aria-pressed", "false");
    choice.addEventListener("click", () => {
      largeGlyph.textContent = glyph;
      card.hidden = false;
      for (const item of choices) item.setAttribute("aria-pressed", String(item === choice));
    });
  }
}

function setWritingMode(mode) {
  const reference = $("#handwriting-reference");
  const tools = $("#legacy-letter-tools");
  const printButton = $("#writing-mode-print");
  const handwritingButton = $("#writing-mode-handwriting");
  if (!reference || !tools || !printButton || !handwritingButton) return;

  const printMode = mode === "print";
  reference.hidden = printMode;
  tools.hidden = !printMode;
  tools.setAttribute("aria-hidden", String(!printMode));
  selectedStyle = printMode ? "print" : "cursive";
  printButton.setAttribute("aria-pressed", String(printMode));
  handwritingButton.setAttribute("aria-pressed", String(!printMode));
  renderLetterGuide();
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
      letterTitle: "Script-style alphabet reference",
      letterIntro: "View uppercase and lowercase mathematical script letters on ruled writing paper. These are display forms, not stroke-by-stroke cursive instructions.",
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
      letterTitle: "Script အက္ခရာ နမူနာ",
      letterIntro: "စာလုံးအကြီးနှင့် အသေး Script ပုံစံများကို စာရွက်မျဉ်းကြောင်းပေါ်တွင် နမူနာအဖြစ် ဖော်ပြထားသည်။ ဤအရာသည် stroke အစီအစဉ်ပြသသော cursive လမ်းညွှန်မဟုတ်ပါ။",
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
  $("#writing-mode-print").textContent = "Print";
  $("#writing-mode-handwriting").textContent = "Handwriting";
  renderCategoryOptions();
  renderVocabulary();
  renderLevelOptions();
  renderPractice();
  renderSelectionPreview();
  renderLetterGuide();
}

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => {
  activeSkill = button.dataset.skill;
  syncSkillButtons();
  selectedExerciseIndex = 0;
  if (location.hash.slice(1).split("/").filter(Boolean)[0] === "home" || !location.hash || location.hash === "#") {
    location.hash = `#/${activeSkill}`;
    return;
  }
  renderPractice();
  renderSelectionPreview();
}));
$("#start-selected-practice").addEventListener("click", () => {
  location.hash = `#/${activeSkill}/${selectedLevel}`;
});
function syncSkillLevelPage() {
  const page = location.hash.slice(1).split("/").filter(Boolean)[0] || "home";
  document.body.classList.toggle("skills-levels-page", page === "skills");
  const picker = $(".skill-level-picker");
  if (picker) picker.setAttribute("aria-hidden", page === "skills" ? "false" : "true");
}
syncSkillLevelPage();
window.addEventListener("hashchange", () => {
  syncSkillLevelPage();
  syncVocabularyRoute();
  syncStudyRoute();
});
$("#vocabulary-category").addEventListener("change", (event) => {
  const categoryId = event.target.value;
  selectedWord = null;
  location.hash = categoryId ? `#/reading/${categoryId}` : "#/reading";
});
$("#vocabulary-back-to-categories").addEventListener("click", () => {
  selectedWord = null;
  location.hash = "#/reading";
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
$("#replay-letter").addEventListener("click", () => { renderLetterGuide(); setStatus(language === "my" ? "လမ်းညွှန်ကို ပြန်ဖော်ပြပြီးပါပြီ။ အောက်တွင် လက်ဖြင့်လိုက်ရေးပါ။" : "Guide refreshed. Trace the faint letter on the board below."); });
$("#writing-mode-print").addEventListener("click", () => setWritingMode("print"));
$("#writing-mode-handwriting").addEventListener("click", () => setWritingMode("handwriting"));

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

syncVocabularyRoute();
syncStudyRoute();
renderLevelOptions();
renderLetterOptions();
renderScriptLetterPicker();
renderPractice();
renderLetterGuide();
renderProgress();
