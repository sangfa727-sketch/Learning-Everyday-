import { DICTIONARY, lookupWord, tokenizeStory, countCharacters, clampSpeechRate } from "./learning-core.js";

const $ = (selector) => document.querySelector(selector);
const story = "Maya has a small garden. Every morning, she waters the flowers. A yellow bird visits the garden and sings in the tree. Maya feels happy when she hears the song.";
const translations = {
  en: { eyebrow:"YOUR DAILY ENGLISH PRACTICE",headline:"Small steps.<br>Stronger English.",intro:"Learn at your pace, even when you are offline.",offline:"Designed for offline learning",start:"GET STARTED",choose:"Choose a skill",reading:"Reading",readingDesc:"Stories and vocabulary",listening:"Listening",listeningDesc:"Listen with device voice",writing:"Writing",writingDesc:"Letters and sentences",speaking:"Speaking",speakingDesc:"Speak aloud and practice",practice:"PRACTICE ROOM",tapHint:"Tap a word in the story to explore its meaning.",word:"WORD",close:"Close",listenStory:"Listen to story",stop:"Stop",speed:"Speed",writePrompt:"Write this sentence: “I learn a little every day.”",speakPrompt:"Read the sentence aloud: “I learn a little every day.”",startSpeaking:"Start speaking practice",pdfTitle:"Bring your own story",pdfBody:"PDF text import is planned for the next milestone. This first version keeps sample lessons available offline and does not upload your files.",privacy:"Your practice stays on this device in this first version.",characters:"characters",unknown:"No offline definition is available for this word yet.",voiceNote:"Your browser's installed English voice is used. Voice availability varies by device.",noSpeech:"Speech synthesis is not available in this browser.",listeningTitle:"Listen and follow the story",writingTitle:"Practice writing",speakingTitle:"Speaking practice",readTitle:"Read a short story",speakUnsupported:"Speech recognition is not supported by this browser. You can still practice aloud without recording.",permission:"Microphone access was not available. Check your browser permission settings." },
  my: { eyebrow:"နေ့စဉ် အင်္ဂလိပ်စာ လေ့ကျင့်ခန်း",headline:"ခြေလှမ်းငယ်များ။<br>အင်္ဂလိပ်စာ ပိုကောင်းလာမယ်။",intro:"အင်တာနက်မရှိချိန်မှာလည်း ကိုယ့်အရှိန်နဲ့ကိုယ် သင်ယူပါ။",offline:"အင်တာနက်မရှိဘဲ သင်ယူနိုင်ရန် ဒီဇိုင်းလုပ်ထားသည်",start:"စတင်လေ့လာရန်",choose:"ကျွမ်းကျင်မှုတစ်ခု ရွေးပါ",reading:"စာဖတ်ခြင်း",readingDesc:"ပုံပြင်နှင့် ဝေါဟာရ",listening:"နားထောင်ခြင်း",listeningDesc:"ဖုန်းအသံဖြင့် နားထောင်ရန်",writing:"စာရေးခြင်း",writingDesc:"အက္ခရာနှင့် ဝါကျများ",speaking:"စကားပြောခြင်း",speakingDesc:"အသံထွက် လေ့ကျင့်ရန်",practice:"လေ့ကျင့်ခန်း",tapHint:"စကားလုံးအဓိပ္ပာယ်ကြည့်ရန် စကားလုံးကို ထိပါ။",word:"စကားလုံး",close:"ပိတ်ရန်",listenStory:"ပုံပြင်နားထောင်ရန်",stop:"ရပ်ရန်",speed:"အမြန်နှုန်း",writePrompt:"ဤဝါကျကို ရေးပါ — “I learn a little every day.”",speakPrompt:"ဤဝါကျကို အသံထွက်ဖတ်ပါ — “I learn a little every day.”",startSpeaking:"စကားပြောလေ့ကျင့်မှု စတင်ရန်",pdfTitle:"ကိုယ်ပိုင်ပုံပြင် ထည့်သွင်းရန်",pdfBody:"PDF စာသားထည့်သွင်းမှုကို နောက်အဆင့်တွင် ထည့်သွင်းမည်။ ယခုဗားရှင်းတွင် နမူနာသင်ခန်းစာများကို offline သုံးနိုင်ပြီး ဖိုင်များကို upload မလုပ်ပါ။",privacy:"ယခုဗားရှင်းတွင် သင်၏လေ့ကျင့်မှုကို ဤစက်ပေါ်တွင်သာ ထားရှိသည်။",characters:"လုံး",unknown:"ဤစကားလုံးအတွက် offline အဓိပ္ပာယ် မထည့်ရသေးပါ။",voiceNote:"ဖုန်းတွင် ထည့်သွင်းထားသော English အသံကို အသုံးပြုသည်။ အသံရရှိမှုသည် စက်ပေါ်မူတည်သည်။",noSpeech:"ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။",listeningTitle:"ပုံပြင်ကို နားထောင်ပြီး လိုက်ဖတ်ပါ",writingTitle:"စာရေးလေ့ကျင့်ရန်",speakingTitle:"စကားပြောလေ့ကျင့်မှု",readTitle:"ပုံပြင်တိုတစ်ပုဒ် ဖတ်ရန်",speakUnsupported:"ဤ browser တွင် အသံမှ စာသားပြောင်းသည့်စနစ် မရနိုင်ပါ။ အသံထွက်လေ့ကျင့်နိုင်သေးသည်။",permission:"မိုက်ခရိုဖုန်းခွင့်ပြုချက် မရရှိပါ။ Browser ခွင့်ပြုချက်များကို စစ်ဆေးပါ။" }
};
let language = "en";
let activeSkill = "reading";
let speechRecognition = null;

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
  document.documentElement.lang = next === "my" ? "my" : "en";
  $("#language-toggle").textContent = next === "en" ? "မြန်မာ" : "English";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[next][key]) element.innerHTML = translations[next][key];
  });
  $("#status-message").textContent = translations[next].voiceNote;
  updateSkill(activeSkill);
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

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => updateSkill(button.dataset.skill)));
$("#language-toggle").addEventListener("click", () => setLanguage(language === "en" ? "my" : "en"));
$("#play-button").addEventListener("click", speakStory);
$("#stop-button").addEventListener("click", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; });
$("#close-word").addEventListener("click", () => { $("#word-card").hidden = true; });
$("#writing-input").addEventListener("input", (event) => { $("#writing-count").textContent = `${countCharacters(event.target.value)} ${translations[language].characters}`; });
$("#speak-button").addEventListener("click", startSpeakingPractice);
window.addEventListener("pagehide", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); speechRecognition?.abort(); });
renderStory();
updateSkill("reading");
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {
    $("#status-message").textContent = "Offline caching could not be enabled in this browser.";
  }));
}
