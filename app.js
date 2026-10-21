import { lookupWord, tokenizeStory, countCharacters, clampSpeechRate } from "./learning-core.js";
import { readLocalValue, writeLocalValue } from "./local-state.js";
import { extractPdfText } from "./pdf-import.js";

const $ = (selector) => document.querySelector(selector);
let story = "Maya has a small garden. Every morning, she waters the flowers. A yellow bird visits the garden and sings in the tree. Maya feels happy when she hears the song.";
const translations = {
  en: { eyebrow:"YOUR DAILY ENGLISH PRACTICE",daily:"A little practice goes a long way",minutes:"Start with 5 minutes",chooseSub:"Pick one and start right where you are.",lessonType:"A SHORT READING",beginner:"Beginner",backTop:"Back to top ↑",headline:"Small steps.<br>Stronger English.",intro:"Learn at your pace, even when you are offline.",offline:"Designed for offline learning",start:"GET STARTED",choose:"Choose a skill",reading:"Reading",readingDesc:"Stories and vocabulary",listening:"Listening",listeningDesc:"Listen with device voice",writing:"Writing",writingDesc:"Letters and sentences",speaking:"Speaking",speakingDesc:"Speak aloud and practice",practice:"PRACTICE ROOM",tapHint:"Tap a word in the story to explore its meaning.",word:"WORD",close:"Close",listenStory:"Listen to story",stop:"Stop",speed:"Speed",writePrompt:"Write this sentence: “I learn a little every day.”",speakPrompt:"Read the sentence aloud: “I learn a little every day.”",startSpeaking:"Start speaking practice",pdfTitle:"Bring your own story",pdfBody:"Choose a text-based PDF to read it aloud. The document is processed on this device and is never uploaded. The PDF reader downloads on first use and is cached for later offline use.",pdfChoose:"Choose PDF",pdfLoading:"Reading PDF on this device…",pdfSuccess:"PDF text loaded. Tap any word to look it up, or listen to the story.",pdfError:"Could not read this PDF.",privacy:"Your practice stays on this device in this first version.",characters:"characters",unknown:"No offline definition is available for this word yet.",voiceNote:"Your browser's installed English voice is used. Voice availability varies by device.",noSpeech:"Speech synthesis is not available in this browser.",listeningTitle:"Listen and follow the story",writingTitle:"Practice writing",speakingTitle:"Speaking practice",readTitle:"Read a short story",speakUnsupported:"Speech recognition is not supported by this browser. You can still practice aloud without recording.",permission:"Microphone access was not available. Check your browser permission settings." },
  my: { eyebrow:"နေ့စဉ် အင်္ဂလိပ်စာ လေ့ကျင့်ခန်း",daily:"နေ့စဉ် နည်းနည်းစီ လေ့ကျင့်ခြင်းက တိုးတက်မှုကို ဖြစ်စေသည်",minutes:"၅ မိနစ်မှ စတင်ပါ",chooseSub:"မိမိနှင့် သင့်တော်သော ကဏ္ဍတစ်ခုကို ရွေးပြီး စတင်ပါ။",lessonType:"စာဖတ်လေ့ကျင့်ခန်းတို",beginner:"အစပြုသူ",backTop:"အပေါ်သို့ ပြန်သွားရန် ↑",headline:"အင်္ဂလိပ်စာ ကောင်းလာဖို့<br>နေ့စဉ် တစ်လှမ်းချင်း လှမ်းကြစို့။",intro:"အင်တာနက်မရှိချိန်မှာလည်း ကိုယ့်အရှိန်နဲ့ကိုယ် သင်ယူပါ။",offline:"အင်တာနက်မရှိဘဲ သင်ယူနိုင်ရန် ဒီဇိုင်းလုပ်ထားသည်",start:"စတင်လေ့လာရန်",choose:"ကျွမ်းကျင်မှုတစ်ခု ရွေးပါ",reading:"စာဖတ်ခြင်း",readingDesc:"ပုံပြင်နှင့် ဝေါဟာရ",listening:"နားထောင်ခြင်း",listeningDesc:"ဖုန်းအသံဖြင့် နားထောင်ရန်",writing:"စာရေးခြင်း",writingDesc:"အက္ခရာနှင့် ဝါကျများ",speaking:"စကားပြောခြင်း",speakingDesc:"အသံထွက် လေ့ကျင့်ရန်",practice:"လေ့ကျင့်ခန်း",tapHint:"စကားလုံးအဓိပ္ပာယ်ကြည့်ရန် စကားလုံးကို ထိပါ။",word:"စကားလုံး",close:"ပိတ်ရန်",listenStory:"ပုံပြင်နားထောင်ရန်",stop:"ရပ်ရန်",speed:"အမြန်နှုန်း",writePrompt:"ဤဝါကျကို ရေးပါ — “I learn a little every day.”",speakPrompt:"ဤဝါကျကို အသံထွက်ဖတ်ပါ — “I learn a little every day.”",startSpeaking:"စကားပြောလေ့ကျင့်မှု စတင်ရန်",pdfTitle:"ကိုယ်ပိုင်ပုံပြင် ထည့်သွင်းရန်",pdfBody:"စာသားပါသော PDF ကို ရွေးပြီး ဖုန်းပေါ်တွင် ဖတ်ရှုနားထောင်နိုင်သည်။ PDF ဖိုင်ကို server သို့ upload မလုပ်ပါ။ PDF ဖတ်ရှုသည့် library ကို ပထမဆုံးအသုံးပြုချိန်တွင် အင်တာနက်ဖြင့် ရယူပြီး နောက်ပိုင်း offline အသုံးပြုရန် cache သိမ်းထားသည်။",pdfChoose:"PDF ရွေးရန်",pdfLoading:"PDF ကို ဤစက်ပေါ်တွင် ဖတ်နေသည်…",pdfSuccess:"PDF စာသားထည့်သွင်းပြီးပါပြီ။ စကားလုံးကိုထိ၍ အဓိပ္ပာယ်ကြည့်နိုင်သလို အသံဖြင့်လည်း နားထောင်နိုင်သည်။",pdfError:"ဤ PDF ကို ဖတ်၍မရပါ။",privacy:"ယခုဗားရှင်းတွင် သင်၏လေ့ကျင့်မှုကို ဤစက်ပေါ်တွင်သာ ထားရှိသည်။",characters:"လုံး",unknown:"ဤစကားလုံးအတွက် offline အဓိပ္ပာယ် မထည့်ရသေးပါ။",voiceNote:"ဖုန်းတွင် ထည့်သွင်းထားသော English အသံကို အသုံးပြုသည်။ အသံရရှိမှုသည် စက်ပေါ်မူတည်သည်။",noSpeech:"ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။",listeningTitle:"ပုံပြင်ကို နားထောင်ပြီး လိုက်ဖတ်ပါ",writingTitle:"စာရေးလေ့ကျင့်ရန်",speakingTitle:"စကားပြောလေ့ကျင့်မှု",readTitle:"ပုံပြင်တိုတစ်ပုဒ် ဖတ်ရန်",speakUnsupported:"ဤ browser တွင် အသံမှ စာသားပြောင်းသည့်စနစ် မရနိုင်ပါ။ အသံထွက်လေ့ကျင့်နိုင်သေးသည်။",permission:"မိုက်ခရိုဖုန်းခွင့်ပြုချက် မရရှိပါ။ Browser ခွင့်ပြုချက်များကို စစ်ဆေးပါ။" }
};
const savedLanguage = readLocalValue("le.language", "en");
let language = savedLanguage === "my" ? "my" : "en";
let activeSkill = "reading";
let speechRecognition = null;

const pageCopy = {
  home: { en: { title: "Learn at your own pace", description: "Choose a skill and continue with a focused practice page.", eyebrow: "YOUR DAILY LEARNING PATH" }, my: { title: "မိမိနှုန်းထားအတိုင်း လေ့လာပါ", description: "ကျွမ်းကျင်မှုတစ်ခုကို ရွေးချယ်ပြီး သက်ဆိုင်ရာစာမျက်နှာတွင် အာရုံစိုက်လေ့ကျင့်ပါ။", eyebrow: "နေ့စဉ်လေ့လာမှု လမ်းကြောင်း" } },
  reading: { en: { title: "Reading practice", description: "Read a short story, explore new words, and understand each sentence.", eyebrow: "READ · UNDERSTAND · GROW" }, my: { title: "စာဖတ်လေ့ကျင့်ခန်း", description: "ပုံပြင်တိုများဖတ်ပါ၊ စကားလုံးအသစ်များကို လေ့လာပြီး ဝါကျအဓိပ္ပာယ်ကို နားလည်အောင် လေ့ကျင့်ပါ။", eyebrow: "ဖတ်ပါ · နားလည်ပါ · တိုးတက်ပါ" } },
  listening: { en: { title: "Listening practice", description: "Listen to English at a comfortable speed and follow along with the text.", eyebrow: "LISTEN · FOLLOW · REPEAT" }, my: { title: "နားထောင်လေ့ကျင့်ခန်း", description: "မိမိနှင့်သင့်တော်သော အမြန်နှုန်းဖြင့် အင်္ဂလိပ်စာကို နားထောင်ပြီး စာသားနှင့်အတူ လိုက်လေ့ကျင့်ပါ။", eyebrow: "နားထောင်ပါ · လိုက်ဖတ်ပါ · ထပ်လေ့ကျင့်ပါ" } },
  writing: { en: { title: "Writing practice", description: "Build clear letter shapes and practise writing words and sentences.", eyebrow: "TRACE · WRITE · IMPROVE" }, my: { title: "စာရေးလေ့ကျင့်ခန်း", description: "စာလုံးပုံစံများကို မှန်ကန်စွာ လိုက်ရေးပြီး စကားလုံးနှင့် ဝါကျများကို လေ့ကျင့်ပါ။", eyebrow: "လိုက်ရေးပါ · ရေးသားပါ · တိုးတက်ပါ" } },
  speaking: { en: { title: "Speaking practice", description: "Practise saying useful English sentences aloud, at your own pace.", eyebrow: "SPEAK · PRACTISE · BUILD CONFIDENCE" }, my: { title: "စကားပြောလေ့ကျင့်ခန်း", description: "နေ့စဉ်အသုံးဝင်သော အင်္ဂလိပ်ဝါကျများကို မိမိအရှိန်အဟုန်ဖြင့် အသံထွက်လေ့ကျင့်ပါ။", eyebrow: "ပြောပါ · လေ့ကျင့်ပါ · ယုံကြည်မှုတည်ဆောက်ပါ" } }
};
const validPages = new Set(["home", "reading", "listening", "writing", "speaking"]);
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
  if (page !== "home") updateSkill(page);
}
window.addEventListener("hashchange", () => {
  renderPage();
  window.scrollTo({ top: 0, behavior: "auto" });
});

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

function showWord(word) {
  const entry = lookupWord(word);
  $("#word-title").textContent = word;
  const meaning = entry ? entry.meaning : translations[language].unknown;
  $("#word-definition").textContent = entry ? `${meaning}. ${entry.usage}${language === "my" && entry.my ? ` — ${entry.my}` : ""}` : meaning;
  $("#word-card").hidden = false;
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
}

function speakStory() {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(story);
  utterance.lang = "en-US";
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
  if (validPages.has(page)) location.hash = `#/${page}`;
  updateSkill(page);
}));
$("#language-toggle").addEventListener("click", () => setLanguage(language === "en" ? "my" : "en"));
$("#play-button").addEventListener("click", speakStory);
$("#stop-button").addEventListener("click", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; });
$("#close-word").addEventListener("click", () => { $("#word-card").hidden = true; });
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
