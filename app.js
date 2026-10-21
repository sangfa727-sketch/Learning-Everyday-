import { lookupWord, tokenizeStory, countCharacters, clampSpeechRate } from "./learning-core.js";
import { readLocalValue, writeLocalValue } from "./local-state.js";
import { extractPdfText } from "./pdf-import.js";

const $ = (selector) => document.querySelector(selector);
const DEFAULT_STORY = "Maya has a small garden. Every morning, she waters the flowers. A yellow bird visits the garden and sings in the tree. Maya feels happy when she hears the song.";
let readingStory = DEFAULT_STORY;
let story = DEFAULT_STORY;
let activeListeningStoryId = null;
const LISTENING_STORIES = [
  { id: "garden-bird", title: "Maya’s Garden", myTitle: "Maya ၏ ဥယျာဉ်", level: "A1", category: "Nature", myCategory: "သဘာဝ", icon: "🌱", summary: "A little bird brings joy to a quiet garden.", mySummary: "ငှက်ကလေးတစ်ကောင်က ဥယျာဉ်လေးထဲ ပျော်ရွှင်မှုယူလာပုံ။", text: DEFAULT_STORY },
  { id: "market-morning", title: "A Morning at the Market", myTitle: "ဈေးထဲက မနက်ခင်း", level: "A1", category: "Everyday life", myCategory: "နေ့စဉ်ဘဝ", icon: "🧺", summary: "Nora visits the market to buy fruit for her family.", mySummary: "Nora က မိသားစုအတွက် သစ်သီးဝယ်ရန် ဈေးသို့သွားသည်။", text: "Nora goes to the market early in the morning. She buys three apples, some bananas, and a loaf of bread. The fruit seller smiles and puts everything in a small bag. Nora walks home and prepares breakfast for her family." },
  { id: "rainy-day", title: "The Rainy Afternoon", myTitle: "မိုးရွာသော နေ့လယ်ခင်း", level: "A1", category: "Weather", myCategory: "ရာသီဥတု", icon: "🌧️", summary: "A rainy afternoon becomes a cosy time for reading.", mySummary: "မိုးရွာတဲ့ နေ့လယ်ခင်းကို စာဖတ်ရင်း သာယာစွာ ဖြတ်သန်းပုံ။", text: "Dark clouds cover the sky after lunch. Ben brings the clothes inside before the rain begins. He makes a cup of warm tea and sits beside the window with a book. The rain is loud, but the house feels peaceful." },
  { id: "lost-puppy", title: "The Lost Puppy", myTitle: "ပျောက်နေသော ခွေးကလေး", level: "A2", category: "Animals", myCategory: "တိရစ္ဆာန်များ", icon: "🐶", summary: "Two neighbours work together to help a lost puppy.", mySummary: "အိမ်နီးချင်းနှစ်ဦးက ပျောက်နေသော ခွေးကလေးကို ကူညီရှာဖွေသည်။", text: "On her way home, Lina hears a soft sound near a shop. A small puppy is sitting beside a box and looks frightened. Lina asks a neighbour for help. They check the puppy’s collar and call its owner. Soon, a happy family arrives to take the puppy home." },
  { id: "school-trip", title: "A Day at the Museum", myTitle: "ပြတိုက်သို့ လေ့လာရေးခရီး", level: "A2", category: "Learning", myCategory: "လေ့လာရေး", icon: "🏛️", summary: "Students discover how people lived long ago.", mySummary: "ကျောင်းသားများက ရှေးခေတ်လူများ၏ နေထိုင်ပုံကို လေ့လာကြသည်။", text: "The class visits a local museum on Friday. Their guide shows them old tools, maps, and photographs. The students write notes and ask questions about daily life in the past. Before leaving, each student chooses one object to describe to the class." },
  { id: "village-library", title: "The Little Village Library", myTitle: "ရွာလေး၏ စာကြည့်တိုက်", level: "B1", category: "Community", myCategory: "လူမှုအသိုင်းအဝိုင်း", icon: "📚", summary: "A community creates a welcoming place to share books.", mySummary: "လူမှုအသိုင်းအဝိုင်းက စာအုပ်များ မျှဝေရန် နေရာကောင်းတစ်ခု ဖန်တီးသည်။", text: "For years, the children in the village had few books to read. One teacher suggested turning an empty room near the market into a small library. Families donated books, and volunteers repaired the shelves. Now children meet there after school to read, study, and share stories with one another." }
];
const translations = {
  en: { homeLink:"← Home", skillsLink:"Skills & Levels",chooseLevel:"Choose your CEFR level",chooseLevelSub:"Select one of the six levels, then start the selected skill.",startPractice:"Start selected practice →",changeLevel:"Change skill or level",progressLink:"Progress", eyebrow:"YOUR DAILY ENGLISH PRACTICE",daily:"A little practice goes a long way",minutes:"Start with 5 minutes",chooseSub:"Pick one and start right where you are.",lessonType:"A SHORT READING",beginner:"Beginner",backTop:"Back to top ↑",headline:"Small steps.<br>Stronger English.",intro:"Learn at your pace, even when you are offline.",offline:"Designed for offline learning",start:"GET STARTED",choose:"Choose a skill",reading:"Reading",readingDesc:"Stories and vocabulary",listening:"Listening",listeningDesc:"Listen with device voice",writing:"Writing",writingDesc:"Letters and sentences",speaking:"Speaking",speakingDesc:"Speak aloud and practice",practice:"PRACTICE ROOM",tapHint:"Tap a word in the story to explore its meaning.",word:"WORD",close:"Close",listenStory:"Listen to story",stop:"Stop",speed:"Speed",writePrompt:"Write this sentence: “I learn a little every day.”",speakPrompt:"Read the sentence aloud: “I learn a little every day.”",startSpeaking:"Start speaking practice",pdfTitle:"Bring your own story",pdfBody:"Choose a text-based PDF to read it aloud. The document is processed on this device and is never uploaded. The PDF reader downloads on first use and is cached for later offline use.",pdfChoose:"Choose PDF",pdfLoading:"Reading PDF on this device…",pdfSuccess:"PDF text loaded. Tap any word to look it up, or listen to the story.",pdfError:"Could not read this PDF.",privacy:"Your practice stays on this device in this first version.",characters:"characters",unknown:"No offline definition is available for this word yet.",voiceNote:"Your browser's installed English voice is used. Voice availability varies by device.",noSpeech:"Speech synthesis is not available in this browser.",listeningTitle:"Listen and follow the story",writingTitle:"Practice writing",speakingTitle:"Speaking practice",readTitle:"Read a short story",speakUnsupported:"Speech recognition is not supported by this browser. You can still practice aloud without recording.",permission:"Microphone access was not available. Check your browser permission settings." },
  my: { homeLink:"← ပင်မစာမျက်နှာ", skillsLink:"ကျွမ်းကျင်မှုနှင့် အဆင့်များ",chooseLevel:"CEFR အဆင့်ရွေးပါ",chooseLevelSub:"အဆင့် ၆ ဆင့်ထဲမှ ရွေးပြီး ရွေးထားသော ကျွမ်းကျင်မှုကို စတင်ပါ။",startPractice:"ရွေးထားသော လေ့ကျင့်ခန်း စတင်ရန် →",changeLevel:"ကျွမ်းကျင်မှု သို့မဟုတ် အဆင့် ပြောင်းရန်",progressLink:"လေ့လာမှုတိုးတက်မှု", eyebrow:"နေ့စဉ် အင်္ဂလိပ်စာ လေ့ကျင့်ခန်း",daily:"နေ့စဉ် နည်းနည်းစီ လေ့ကျင့်ခြင်းက တိုးတက်မှုကို ဖြစ်စေသည်",minutes:"၅ မိနစ်မှ စတင်ပါ",chooseSub:"မိမိနှင့် သင့်တော်သော ကဏ္ဍတစ်ခုကို ရွေးပြီး စတင်ပါ။",lessonType:"စာဖတ်လေ့ကျင့်ခန်းတို",beginner:"အစပြုသူ",backTop:"အပေါ်သို့ ပြန်သွားရန် ↑",headline:"အင်္ဂလိပ်စာ ကောင်းလာဖို့<br>နေ့စဉ် တစ်လှမ်းချင်း လှမ်းကြစို့။",intro:"အင်တာနက်မရှိချိန်မှာလည်း ကိုယ့်အရှိန်နဲ့ကိုယ် သင်ယူပါ။",offline:"အင်တာနက်မရှိဘဲ သင်ယူနိုင်ရန် ဒီဇိုင်းလုပ်ထားသည်",start:"စတင်လေ့လာရန်",choose:"ကျွမ်းကျင်မှုတစ်ခု ရွေးပါ",reading:"စာဖတ်ခြင်း",readingDesc:"ပုံပြင်နှင့် ဝေါဟာရ",listening:"နားထောင်ခြင်း",listeningDesc:"ဖုန်းအသံဖြင့် နားထောင်ရန်",writing:"စာရေးခြင်း",writingDesc:"အက္ခရာနှင့် ဝါကျများ",speaking:"စကားပြောခြင်း",speakingDesc:"အသံထွက် လေ့ကျင့်ရန်",practice:"လေ့ကျင့်ခန်း",tapHint:"စကားလုံးအဓိပ္ပာယ်ကြည့်ရန် စကားလုံးကို ထိပါ။",word:"စကားလုံး",close:"ပိတ်ရန်",listenStory:"ပုံပြင်နားထောင်ရန်",stop:"ရပ်ရန်",speed:"အမြန်နှုန်း",writePrompt:"ဤဝါကျကို ရေးပါ — “I learn a little every day.”",speakPrompt:"ဤဝါကျကို အသံထွက်ဖတ်ပါ — “I learn a little every day.”",startSpeaking:"စကားပြောလေ့ကျင့်မှု စတင်ရန်",pdfTitle:"ကိုယ်ပိုင်ပုံပြင် ထည့်သွင်းရန်",pdfBody:"စာသားပါသော PDF ကို ရွေးပြီး ဖုန်းပေါ်တွင် ဖတ်ရှုနားထောင်နိုင်သည်။ PDF ဖိုင်ကို server သို့ upload မလုပ်ပါ။ PDF ဖတ်ရှုသည့် library ကို ပထမဆုံးအသုံးပြုချိန်တွင် အင်တာနက်ဖြင့် ရယူပြီး နောက်ပိုင်း offline အသုံးပြုရန် cache သိမ်းထားသည်။",pdfChoose:"PDF ရွေးရန်",pdfLoading:"PDF ကို ဤစက်ပေါ်တွင် ဖတ်နေသည်…",pdfSuccess:"PDF စာသားထည့်သွင်းပြီးပါပြီ။ စကားလုံးကိုထိ၍ အဓိပ္ပာယ်ကြည့်နိုင်သလို အသံဖြင့်လည်း နားထောင်နိုင်သည်။",pdfError:"ဤ PDF ကို ဖတ်၍မရပါ။",privacy:"ယခုဗားရှင်းတွင် သင်၏လေ့ကျင့်မှုကို ဤစက်ပေါ်တွင်သာ ထားရှိသည်။",characters:"လုံး",unknown:"ဤစကားလုံးအတွက် offline အဓိပ္ပာယ် မထည့်ရသေးပါ။",voiceNote:"ဖုန်းတွင် ထည့်သွင်းထားသော English အသံကို အသုံးပြုသည်။ အသံရရှိမှုသည် စက်ပေါ်မူတည်သည်။",noSpeech:"ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။",listeningTitle:"ပုံပြင်ကို နားထောင်ပြီး လိုက်ဖတ်ပါ",writingTitle:"စာရေးလေ့ကျင့်ရန်",speakingTitle:"စကားပြောလေ့ကျင့်မှု",readTitle:"ပုံပြင်တိုတစ်ပုဒ် ဖတ်ရန်",speakUnsupported:"ဤ browser တွင် အသံမှ စာသားပြောင်းသည့်စနစ် မရနိုင်ပါ။ အသံထွက်လေ့ကျင့်နိုင်သေးသည်။",permission:"မိုက်ခရိုဖုန်းခွင့်ပြုချက် မရရှိပါ။ Browser ခွင့်ပြုချက်များကို စစ်ဆေးပါ။" }
};
const savedLanguage = readLocalValue("le.language", "en");
let language = savedLanguage === "my" ? "my" : "en";
let activeSkill = "reading";
let speechRecognition = null;

const pageCopy = {
  home: { en: { title: "Learn at your own pace", description: "Choose a skill and continue with a focused practice page.", eyebrow: "YOUR DAILY LEARNING PATH" }, my: { title: "မိမိနှုန်းထားအတိုင်း လေ့လာပါ", description: "ကျွမ်းကျင်မှုတစ်ခုကို ရွေးချယ်ပြီး သက်ဆိုင်ရာစာမျက်နှာတွင် အာရုံစိုက်လေ့ကျင့်ပါ။", eyebrow: "နေ့စဉ်လေ့လာမှု လမ်းကြောင်း" } },
  skills: { en: { title: "Four skills · Six levels", description: "Choose a skill and a CEFR level here. Your practice pages stay focused on the exercise.", eyebrow: "CHOOSE YOUR LEARNING PATH" }, my: { title: "ကျွမ်းကျင်မှု ၄ မျိုး · အဆင့် ၆ ဆင့်", description: "ကျွမ်းကျင်မှုနှင့် CEFR အဆင့်ကို ဤနေရာတွင် ရွေးပါ။ လေ့ကျင့်ခန်းစာမျက်နှာများတွင် လေ့ကျင့်မှုကိုသာ အာရုံစိုက်နိုင်သည်။", eyebrow: "သင်ယူမှုလမ်းကြောင်း ရွေးချယ်ပါ" } },
  progress: { en: { title: "Your learning progress", description: "Review your completed skill-level practices. Your progress stays on this device unless you export it.", eyebrow: "YOUR LEARNING JOURNEY" }, my: { title: "လေ့လာမှုတိုးတက်မှု", description: "ပြီးမြောက်ထားသော ကျွမ်းကျင်မှုလေ့ကျင့်ခန်းများကို ကြည့်ပါ။ Export မလုပ်ပါက မှတ်တမ်းကို ဤစက်ပေါ်တွင်သာ သိမ်းထားသည်။", eyebrow: "သင်ယူမှုခရီးစဉ်" } },
  reading: { en: { title: "Reading practice", description: "Read a short story, explore new words, and understand each sentence.", eyebrow: "READ · UNDERSTAND · GROW" }, my: { title: "စာဖတ်လေ့ကျင့်ခန်း", description: "ပုံပြင်တိုများဖတ်ပါ၊ စကားလုံးအသစ်များကို လေ့လာပြီး ဝါကျအဓိပ္ပာယ်ကို နားလည်အောင် လေ့ကျင့်ပါ။", eyebrow: "ဖတ်ပါ · နားလည်ပါ · တိုးတက်ပါ" } },
  listening: { en: { title: "Listening practice", description: "Listen to English at a comfortable speed and follow along with the text.", eyebrow: "LISTEN · FOLLOW · REPEAT" }, my: { title: "နားထောင်လေ့ကျင့်ခန်း", description: "မိမိနှင့်သင့်တော်သော အမြန်နှုန်းဖြင့် အင်္ဂလိပ်စာကို နားထောင်ပြီး စာသားနှင့်အတူ လိုက်လေ့ကျင့်ပါ။", eyebrow: "နားထောင်ပါ · လိုက်ဖတ်ပါ · ထပ်လေ့ကျင့်ပါ" } },
  writing: { en: { title: "Writing practice", description: "Build clear letter shapes and practise writing words and sentences.", eyebrow: "TRACE · WRITE · IMPROVE" }, my: { title: "စာရေးလေ့ကျင့်ခန်း", description: "စာလုံးပုံစံများကို မှန်ကန်စွာ လိုက်ရေးပြီး စကားလုံးနှင့် ဝါကျများကို လေ့ကျင့်ပါ။", eyebrow: "လိုက်ရေးပါ · ရေးသားပါ · တိုးတက်ပါ" } },
  speaking: { en: { title: "Speaking practice", description: "Practise saying useful English sentences aloud, at your own pace.", eyebrow: "SPEAK · PRACTISE · BUILD CONFIDENCE" }, my: { title: "စကားပြောလေ့ကျင့်ခန်း", description: "နေ့စဉ်အသုံးဝင်သော အင်္ဂလိပ်ဝါကျများကို မိမိအရှိန်အဟုန်ဖြင့် အသံထွက်လေ့ကျင့်ပါ။", eyebrow: "ပြောပါ · လေ့ကျင့်ပါ · ယုံကြည်မှုတည်ဆောက်ပါ" } }
};
const validPages = new Set(["home", "skills", "reading", "listening", "writing", "speaking", "progress"]);
function currentPage() {
  const route = location.hash.slice(1).split("/").filter(Boolean)[0];
  return validPages.has(route) ? route : "home";
}
function renderPage() {
  const page = currentPage();
  const copy = pageCopy[page][language];
  document.body.dataset.page = page;
  const navigation = $("#page-navigation");
  navigation.hidden = page === "home";
  $("#page-title").textContent = copy.title;
  $("#page-description").textContent = copy.description;
  navigation.querySelector(".eyebrow").textContent = copy.eyebrow;
  document.title = page === "home" ? "Learning Everyday — Your English practice space" : `${copy.title} — Learning Everyday`;
  if (["reading", "listening", "writing", "speaking"].includes(page)) {
    updateSkill(page);
  } else if (page === "skills") {
    updateSkill(activeSkill);
  } else if (page === "home") {
    document.querySelectorAll("[data-skill]").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
  }
  syncListeningView(page);
}
window.addEventListener("hashchange", () => {
  renderPage();
  window.scrollTo({ top: 0, behavior: "auto" });
});

function renderListeningLibrary() {
  const grid = $("#listening-story-grid");
  if (!grid) return;
  const isMyanmar = language === "my";
  grid.replaceChildren();
  for (const item of LISTENING_STORIES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "listening-story-card";
    card.dataset.storyId = item.id;
    card.setAttribute("aria-label", `${isMyanmar ? item.myTitle : item.title}, ${item.level}`);
    const art = document.createElement("span");
    art.className = "story-card-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = item.icon;
    const meta = document.createElement("span");
    meta.className = "story-card-meta";
    const level = document.createElement("span");
    level.className = "story-level-pill";
    level.textContent = item.level;
    const category = document.createElement("span");
    category.className = "story-card-category";
    category.textContent = isMyanmar ? item.myCategory : item.category;
    meta.append(level, category);
    const title = document.createElement("span");
    title.className = "story-card-title";
    title.textContent = isMyanmar ? item.myTitle : item.title;
    const summary = document.createElement("span");
    summary.className = "story-card-summary";
    summary.textContent = isMyanmar ? item.mySummary : item.summary;
    const action = document.createElement("span");
    action.className = "story-card-action";
    action.textContent = isMyanmar ? "ဖတ်ရှုနားထောင်ရန် →" : "Read & listen →";
    card.append(art, meta, title, summary, action);
    card.addEventListener("click", () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      location.hash = `#/listening/${item.id}`;
    });
    grid.append(card);
  }
  $("#listening-library-title").textContent = isMyanmar ? "ပုံပြင်စာကြည့်တိုက်" : "Story library";
  $("[data-library-eyebrow]").textContent = isMyanmar ? "ပုံပြင်များ စုစည်းမှု" : "STORY COLLECTION";
  $("[data-library-intro]").textContent = isMyanmar ? "ပုံပြင်ကတ်တစ်ခုကို ရွေးပြီး ဖတ်ရှုနားထောင်နိုင်သော စာမျက်နှာသို့ ဝင်ပါ။" : "Choose a story card to open its reading and listening page.";
  $("[data-library-count]").textContent = isMyanmar ? `ပုံပြင် ${LISTENING_STORIES.length} ပုဒ်` : `${LISTENING_STORIES.length} STORIES`;
  $("#back-to-story-library").textContent = isMyanmar ? "← ပုံပြင်စာကြည့်တိုက်သို့" : "← All stories";
}

function syncListeningView(page = currentPage()) {
  const library = $("#listening-library");
  const panel = $("#practice-panel");
  const back = $("#back-to-story-library");
  if (!library || !panel || !back) return;
  const route = location.hash.slice(1).split("/").filter(Boolean);
  if (page !== "listening") {
    library.hidden = true;
    panel.hidden = false;
    back.hidden = true;
    if (activeListeningStoryId) {
      story = readingStory;
      activeListeningStoryId = null;
      renderStory();
    }
    return;
  }
  const selected = LISTENING_STORIES.find((item) => item.id === route[1]);
  if (!selected) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    activeListeningStoryId = null;
    story = readingStory;
    renderStory();
    renderListeningLibrary();
    library.hidden = false;
    panel.hidden = true;
    back.hidden = true;
    return;
  }
  if (activeListeningStoryId !== selected.id) {
    activeListeningStoryId = selected.id;
    story = selected.text;
    renderStory();
    $("#word-card").hidden = true;
    $("#status-message").textContent = translations[language].voiceNote;
  }
  library.hidden = true;
  panel.hidden = false;
  back.hidden = false;
  $("#panel-title").textContent = language === "my" ? selected.myTitle : selected.title;
  $(".panel-heading .eyebrow").textContent = language === "my" ? "နားထောင်လေ့ကျင့်ခန်း" : "LISTENING STORY";
  $("#lesson-level-tag").textContent = `${selected.level} · ${selected.level === "A1" ? (language === "my" ? "အစပြုသူ" : "Beginner") : selected.level === "A2" ? (language === "my" ? "အခြေခံ" : "Elementary") : (language === "my" ? "အလယ်အလတ်" : "Intermediate")}`;
  $(".lesson-number").textContent = language === "my" ? "ပုံပြင်" : "STORY";
}

function renderStory() {
  const container = $("#lesson-text");
  container.replaceChildren();
  for (const part of tokenizeStory(story)) {
    if (!part.word) { container.append(document.createTextNode(part.text)); continue; }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-word";
    button.textContent = part.text;
    button.setAttribute("aria-label", `Look up ${part.word}`);
    button.addEventListener("click", () => showWord(part.word));
    container.append(button);
  }
}

function pronounceWord(word) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  const voice = selectedEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = clampSpeechRate($("#speech-speed")?.value ?? 0.85);
  utterance.onerror = () => { $("#status-message").textContent = translations[language].noSpeech; };
  window.speechSynthesis.speak(utterance);
}

function showWord(word) {
  const entry = lookupWord(word);
  $("#word-title").textContent = word;
  $("#word-definition").textContent = entry ? entry.meaning + ". " + entry.usage : translations[language].unknown;
  const myTranslation = $("#word-myanmar-translation");
  if (myTranslation) {
    myTranslation.textContent = entry?.my
      ? "မြန်မာအဓိပ္ပာယ် — " + entry.my
      : "မြန်မာအဓိပ္ပာယ် — ဤစကားလုံးအတွက် offline အဘိဓာန်အချက်အလက် မထည့်ရသေးပါ။";
  }
  $("#pronounce-word").textContent = language === "my" ? "🔊 အသံထွက် နားထောင်ရန်" : "🔊 Hear pronunciation";
  $("#pronounce-word").setAttribute("aria-label", "Pronounce " + word);
  $("#word-card").hidden = false;
  pronounceWord(word);
  $("#word-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setLanguage(next) {
  language = next;
  writeLocalValue("le.language", next);
  document.documentElement.lang = next === "my" ? "my" : "en";
  $("#language-toggle").textContent = next === "en" ? "မြန်မာ" : "English";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[next][key]) element.innerHTML = translations[next][key];
  });
  $("#status-message").textContent = translations[next].voiceNote;
  updateSkill(activeSkill);
  renderPage();
  if (!$("#word-card").hidden) showWord($("#word-title").textContent);
}

function updateSkill(skill) {
  activeSkill = skill;
  document.querySelectorAll("[data-skill]").forEach((button) => {
    const active = button.dataset.skill === skill;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("#writing-exercise").hidden = skill !== "writing";
  $("#speaking-exercise").hidden = skill !== "speaking";
  $("#player-controls").hidden = skill === "writing" || skill === "speaking";
  $("#pdf-note").hidden = skill !== "reading" && skill !== "listening";
  const title = { reading:"readTitle", listening:"listeningTitle", writing:"writingTitle", speaking:"speakingTitle" }[skill];
  $("#panel-title").textContent = translations[language][title];
  const lessonLabels = {
    reading: language === "my" ? "စာဖတ်လေ့ကျင့်ခန်းတို" : "A SHORT READING",
    listening: language === "my" ? "နားထောင်လေ့ကျင့်ခန်း" : "LISTENING PRACTICE",
    writing: language === "my" ? "စာရေးလေ့ကျင့်ခန်း" : "WRITING PRACTICE",
    speaking: language === "my" ? "စကားပြောလေ့ကျင့်ခန်း" : "SPEAKING PRACTICE"
  };
  document.querySelector("[data-i18n='lessonType']").textContent = lessonLabels[skill];
}

let englishVoices = [];

function refreshEnglishVoices() {
  if (!("speechSynthesis" in window)) return;
  englishVoices = window.speechSynthesis.getVoices();
  const select = $("#voice-select");
  if (!select) return;
  const previous = select.value;
  const english = englishVoices.map((voice, index) => ({ voice, index })).filter((item) => /^en([_-]|$)/i.test(item.voice.lang));
  select.replaceChildren();
  const automatic = document.createElement("option");
  automatic.value = "";
  automatic.textContent = "Automatic (best available)";
  select.append(automatic);
  for (const item of english) {
    const option = document.createElement("option");
    option.value = String(item.index);
    option.textContent = item.voice.name + " · " + item.voice.lang + (item.voice.localService ? " · device" : " · system");
    select.append(option);
  }
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  else {
    const best = english.find((item) => /natural|neural|online|google|microsoft|samantha|aria|jenny|guy|ava/i.test(item.voice.name)) ?? english.find((item) => /^en-US$/i.test(item.voice.lang)) ?? english[0];
    if (best) select.value = String(best.index);
  }
}

function selectedEnglishVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const select = $("#voice-select");
  const chosen = select && select.value !== "" ? voices[Number(select.value)] : null;
  if (chosen && /^en([_-]|$)/i.test(chosen.lang)) return chosen;
  const english = voices.filter((voice) => /^en([_-]|$)/i.test(voice.lang));
  return english.find((voice) => /natural|neural|online|google|microsoft|samantha|aria|jenny|guy|ava/i.test(voice.name)) ?? english.find((voice) => /^en-US$/i.test(voice.lang)) ?? english[0] ?? null;
}

if ("speechSynthesis" in window) {
  refreshEnglishVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshEnglishVoices);
  $("#voice-select")?.addEventListener("change", () => {
    const voice = selectedEnglishVoice();
    $("#status-message").textContent = voice ? "Selected " + voice.name + " (" + voice.lang + "). Quality depends on your device's installed voices." : "No English voice is available. Check your device's text-to-speech settings.";
  });
}

function speakStory() {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(story);
  const voice = selectedEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = clampSpeechRate($("#speech-speed").value);
  utterance.onstart = () => { $("#play-button").disabled = true; $("#status-message").textContent = language === "my" ? "နားထောင်နေသည်…" : "Playing story…"; };
  utterance.onend = () => { $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; };
  utterance.onerror = () => { $("#play-button").disabled = false; $("#status-message").textContent = translations[language].noSpeech; };
  window.speechSynthesis.speak(utterance);
}

function startSpeakingPractice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("#speech-result").textContent = translations[language].speakUnsupported;
    return;
  }
  try {
    speechRecognition?.abort();
    speechRecognition = new Recognition();
    speechRecognition.lang = "en-US";
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    $("#speech-result").textContent = language === "my" ? "နားထောင်နေသည်။ ဝါကျကို ပြောပါ…" : "Listening… Say: I learn a little every day.";
    speechRecognition.onresult = (event) => { $("#speech-result").textContent = event.results[0][0].transcript; };
    speechRecognition.onerror = () => { $("#speech-result").textContent = translations[language].permission; };
    speechRecognition.onend = () => { speechRecognition = null; };
    speechRecognition.start();
  } catch { $("#speech-result").textContent = translations[language].permission; }
}

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => {
  const page = button.dataset.skill;
  if (validPages.has(page) && currentPage() !== "skills") location.hash = `#/${page}`;
  updateSkill(page);
}));
$("#language-toggle").addEventListener("click", () => setLanguage(language === "en" ? "my" : "en"));
$("#play-button").addEventListener("click", speakStory);
$("#back-to-story-library").addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  location.hash = "#/listening";
});
$("#stop-button").addEventListener("click", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; });
$("#close-word").addEventListener("click", () => { $("#word-card").hidden = true; });
$("#pronounce-word").addEventListener("click", () => pronounceWord($("#word-title").textContent));
$("#writing-input").value = readLocalValue("le.writingDraft", "");
$("#writing-count").textContent = `${countCharacters($("#writing-input").value)} ${translations[language].characters}`;
$("#writing-input").addEventListener("input", (event) => {
  writeLocalValue("le.writingDraft", event.target.value);
  $("#writing-count").textContent = `${countCharacters(event.target.value)} ${translations[language].characters}`;
});
$("#speak-button").addEventListener("click", startSpeakingPractice);
$("#pdf-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const status = $("#pdf-status");
  status.textContent = translations[language].pdfLoading;
  $("#pdf-file").disabled = true;
  try {
    // The PDF stays on-device; only the version-pinned parser module is fetched.
    const pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
    story = await extractPdfText(file, pdfjs);
    readingStory = story;
    renderStory();
    $("#word-card").hidden = true;
    status.textContent = translations[language].pdfSuccess;
    updateSkill("reading");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : translations[language].pdfError;
  } finally {
    $("#pdf-file").disabled = false;
    event.target.value = "";
  }
});

window.addEventListener("pagehide", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); speechRecognition?.abort(); });
renderStory();
updateSkill("reading");
setLanguage(language);
renderPage();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {
    $("#status-message").textContent = "Offline caching could not be enabled in this browser.";
  }));
}


// Keep the Smart Writing Lab highly visible until a sample has been exported.
const writingLabExportKey = "le.writingLab.sampleExported.v3";
function syncWritingLabEntryVisibility() {
  try {
    const exported = window.localStorage.getItem(writingLabExportKey) === "1";
    document.querySelectorAll("[data-writing-lab-entry]").forEach((entry) => {
      if (exported) entry.setAttribute("hidden", "");
      else entry.removeAttribute("hidden");
    });
  } catch {
    // Storage may be unavailable in private browsing; keep the entry visible.
  }
}
syncWritingLabEntryVisibility();
window.addEventListener("pageshow", syncWritingLabEntryVisibility);
window.addEventListener("storage", (event) => {
  if (event.key === writingLabExportKey || event.key === null) syncWritingLabEntryVisibility();
});
