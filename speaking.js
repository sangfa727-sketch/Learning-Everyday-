import { CONVERSATIONS } from "./speaking-data.js";

const $ = (selector) => document.querySelector(selector);
const FEMALE_VOICE_HINTS = /female|samantha|ava|jenny|aria|zira|susan|karen|victoria|tessa|moira|fiona|google.*(us|uk).*english/i;
const MALE_VOICE_HINTS = /male|david|guy|mark|daniel|alex|fred|tom|james|george|oliver|google.*english.*male/i;
let activeConversation = null;
let voices = [];
let playbackToken = 0;

function language() {
  return document.documentElement.lang === "my" ? "my" : "en";
}

function availableEnglishVoices() {
  if (!("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis.getVoices();
  voices = all.filter((voice) => /^en([_-]|$)/i.test(voice.lang));
  return voices;
}

function voiceForGender(gender) {
  const english = availableEnglishVoices();
  if (!english.length) return null;
  const preferred = gender === "female" ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
  return english.find((voice) => preferred.test(voice.name)) || english.find((voice) => /natural|neural|online/i.test(voice.name)) || english[0];
}

function stopPlayback() {
  playbackToken += 1;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  const status = $("#speaking-status");
  if (status) status.textContent = language() === "my" ? "အသံဖတ်ခြင်းကို ရပ်လိုက်ပါပြီ။" : "Playback stopped.";
  const playButton = $("#speaking-play-all");
  if (playButton) playButton.disabled = false;
}

function speakLine(line, onend = null) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    const status = $("#speaking-status");
    if (status) status.textContent = language() === "my"
      ? "ဤ browser တွင် TTS အသံဖတ်စနစ် မရနိုင်ပါ။ စာသားကို ဆက်ဖတ်နိုင်ပါသည်။"
      : "Text-to-speech is not available in this browser. You can still read the conversation.";
    return false;
  }
  const utterance = new SpeechSynthesisUtterance(line[2]);
  utterance.lang = "en-US";
  utterance.rate = Number($("#speaking-speed")?.value || 0.88);
  const voice = voiceForGender(line[1]);
  if (voice) utterance.voice = voice;
  utterance.onend = () => { if (onend) onend(); };
  utterance.onerror = (event) => {
    if (event.error === "canceled" || event.error === "interrupted") return;
    const status = $("#speaking-status");
    if (status) status.textContent = language() === "my"
      ? "အသံဖတ်ရာတွင် ပြဿနာရှိသည်။ စာသားကို ဖတ်နိုင်ပါသည်။"
      : "The selected device voice could not read this line. The text is still available.";
    if (onend) onend();
  };
  window.speechSynthesis.speak(utterance);
  return true;
}

function setHeader(conversation = null) {
  const isMyanmar = language() === "my";
  const title = $("#page-title");
  const description = $("#page-description");
  const eyebrow = $("#page-navigation .eyebrow");
  if (!title || !description || !eyebrow) return;
  if (conversation) {
    title.textContent = isMyanmar ? conversation.myTitle : conversation.title;
    description.textContent = isMyanmar ? conversation.mySummary : conversation.summary;
    eyebrow.textContent = isMyanmar ? "စကားပြော · နားထောင် · လေ့ကျင့်" : "CONVERSATION · LISTEN · PRACTISE";
    document.title = (isMyanmar ? conversation.myTitle : conversation.title) + " — Learning Everyday";
  } else {
    title.textContent = isMyanmar ? "စကားပြောလေ့ကျင့်ခန်း" : "Speaking practice";
    description.textContent = isMyanmar
      ? "နေ့စဉ်ဘဝတွင် အသုံးဝင်သော စကားပြောအမျိုးအစားတစ်ခုကို ရွေးပါ။ စာသားဖတ်ပြီး အသံနားထောင်ပါ။"
      : "Choose an everyday conversation. Read each line and listen to the two speakers.";
    eyebrow.textContent = isMyanmar ? "ပြောပါ · နားထောင်ပါ · လေ့ကျင့်ပါ" : "SPEAK · LISTEN · PRACTISE";
    document.title = (isMyanmar ? "စကားပြောလေ့ကျင့်ခန်း" : "Speaking practice") + " — Learning Everyday";
  }
}

function renderCategories() {
  const grid = $("#speaking-category-grid");
  if (!grid) return;
  const isMyanmar = language() === "my";
  grid.replaceChildren();
  for (const conversation of CONVERSATIONS) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "speaking-category-card";
    card.dataset.conversationId = conversation.id;
    card.setAttribute("aria-label", (isMyanmar ? conversation.myTitle : conversation.title) + ", " + conversation.level);
    const art = document.createElement("span");
    art.className = "speaking-card-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = conversation.icon;
    const meta = document.createElement("span");
    meta.className = "speaking-card-meta";
    const level = document.createElement("span");
    level.className = "speaking-level-pill";
    level.textContent = conversation.level;
    const count = document.createElement("span");
    count.className = "speaking-line-count";
    count.textContent = isMyanmar ? "၁၂ ကြောင်း" : "12 lines";
    meta.append(level, count);
    const title = document.createElement("span");
    title.className = "speaking-card-title";
    title.textContent = isMyanmar ? conversation.myTitle : conversation.title;
    const summary = document.createElement("span");
    summary.className = "speaking-card-summary";
    summary.textContent = isMyanmar ? conversation.mySummary : conversation.summary;
    const action = document.createElement("span");
    action.className = "speaking-card-action";
    action.textContent = isMyanmar ? "စကားပြောခန်း ဖွင့်ရန် →" : "Open conversation →";
    card.append(art, meta, title, summary, action);
    card.addEventListener("click", () => {
      stopPlayback();
      location.hash = "#/speaking/" + conversation.id;
      renderSpeakingRoute();
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    grid.append(card);
  }
  $("#speaking-library-title").textContent = isMyanmar ? "အမျိုးအစားအလိုက် စကားပြောခန်းများ" : "Conversations by topic";
  $("#speaking-library-intro").textContent = isMyanmar
    ? "ကတ်တစ်ခုကို ရွေးပြီး စကားပြောစာသားကို ဖတ်ပါ၊ မိန်းကလေးနှင့် ယောက်ျားလေးအသံများကို နားထောင်ပါ။"
    : "Choose a topic to read the dialogue and listen to alternating speakers.";
  $("#speaking-library-count").textContent = isMyanmar ? "အမျိုးအစား ၅ မျိုး" : "5 TOPICS";
}

function renderConversation(conversation) {
  const detail = $("#speaking-conversation");
  const isMyanmar = language() === "my";
  const title = $("#speaking-conversation-title");
  const summary = $("#speaking-conversation-summary");
  const lines = $("#speaking-dialogue-lines");
  title.textContent = isMyanmar ? conversation.myTitle : conversation.title;
  summary.textContent = isMyanmar
    ? "အသံကို နားထောင်ရန် စာကြောင်းတစ်ကြောင်းချင်းရှိ 🔊 ခလုတ်ကို နှိပ်ပါ၊ သို့မဟုတ် စကားပြောခန်းတစ်ခုလုံးကို ဖွင့်နားထောင်ပါ။"
    : "Tap a speaker button to hear one line, or play the full conversation from beginning to end.";
  lines.replaceChildren();
  conversation.lines.forEach((line, index) => {
    const row = document.createElement("article");
    row.className = "speaking-dialogue-line speaker-" + line[1];
    const avatar = document.createElement("span");
    avatar.className = "speaking-speaker-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = line[1] === "female" ? "👩" : "👨";
    const content = document.createElement("div");
    content.className = "speaking-dialogue-copy";
    const speaker = document.createElement("strong");
    speaker.className = "speaking-speaker-name";
    speaker.textContent = line[0];
    const english = document.createElement("p");
    english.className = "speaking-english-line";
    english.textContent = line[2];
    const translation = document.createElement("p");
    translation.className = "speaking-myanmar-line";
    translation.textContent = line[3];
    const actions = document.createElement("div");
    actions.className = "speaking-line-actions";
    const listen = document.createElement("button");
    listen.type = "button";
    listen.className = "speaking-line-play";
    listen.textContent = "🔊";
    listen.setAttribute("aria-label", isMyanmar ? line[0] + " ၏ စာကြောင်း " + (index + 1) + " ကို နားထောင်ရန်" : "Play line " + (index + 1) + " by " + line[0]);
    listen.title = isMyanmar ? "ဤစာကြောင်းကို နားထောင်ရန်" : "Listen to this line";
    listen.addEventListener("click", () => {
      stopPlayback();
      speakLine(line);
      const status = $("#speaking-status");
      if (status) status.textContent = isMyanmar ? line[0] + " ပြောနေသည်…" : line[0] + " is speaking…";
    });
    actions.append(listen);
    content.append(speaker, english, translation, actions);
    row.append(avatar, content);
    lines.append(row);
  });
  $("#speaking-play-all").textContent = isMyanmar ? "▶ စကားပြောခန်းတစ်ခုလုံး နားထောင်ရန်" : "▶ Play conversation";
  $("#speaking-stop").textContent = isMyanmar ? "■ ရပ်ရန်" : "■ Stop";
  $("#speaking-back").textContent = isMyanmar ? "← အမျိုးအစားများသို့ ပြန်သွားရန်" : "← Back to topics";
  $("#speaking-voice-note").textContent = isMyanmar
    ? "မိန်းကလေး/ယောက်ျားလေးအသံ ရွေးချယ်မှုသည် ဖုန်းတွင်ရှိသော English TTS အသံများပေါ် မူတည်သည်။ အသံမရှိလျှင် စာသားကို ဖတ်နိုင်ပါသည်။"
    : "Female and male voice choices depend on the English voices installed on your device. Voice names vary; text remains available if TTS is unavailable.";
  detail.hidden = false;
  $("#speaking-category-list").hidden = true;
  setHeader(conversation);
  $("#speaking-status").textContent = isMyanmar ? "နားထောင်ရန် စကားပြောခန်းကို ရွေးထားပါသည်။" : "Ready to play this conversation.";
}

function playAll() {
  if (!activeConversation) return;
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    speakLine(activeConversation.lines[0]);
    return;
  }
  window.speechSynthesis.cancel();
  const token = ++playbackToken;
  const button = $("#speaking-play-all");
  button.disabled = true;
  let index = 0;
  const next = () => {
    if (token !== playbackToken) return;
    if (index >= activeConversation.lines.length) {
      button.disabled = false;
      $("#speaking-status").textContent = language() === "my" ? "စကားပြောခန်း ပြီးဆုံးပါပြီ။" : "Conversation finished.";
      return;
    }
    const line = activeConversation.lines[index];
    $("#speaking-status").textContent = language() === "my" ? line[0] + " ပြောနေသည်…" : line[0] + " is speaking…";
    index += 1;
    speakLine(line, next);
  };
  next();
}

function renderSpeakingRoute() {
  const section = $("#speaking-library");
  if (!section) return;
  const route = location.hash.slice(1).split("/").filter(Boolean);
  const isSpeaking = route[0] === "speaking";
  const conversation = isSpeaking ? CONVERSATIONS.find((item) => item.id === route[1]) : null;
  const panel = $("#practice-panel");
  if (panel) panel.hidden = isSpeaking;
  section.hidden = !isSpeaking;
  if (!isSpeaking) {
    stopPlayback();
    activeConversation = null;
    return;
  }
  renderCategories();
  if (conversation) {
    if (activeConversation?.id !== conversation.id) stopPlayback();
    activeConversation = conversation;
    renderConversation(conversation);
  } else {
    stopPlayback();
    activeConversation = null;
    $("#speaking-conversation").hidden = true;
    $("#speaking-category-list").hidden = false;
    setHeader(null);
  }
}

$("#speaking-back").addEventListener("click", () => {
  stopPlayback();
  location.hash = "#/speaking";
});
$("#speaking-play-all").addEventListener("click", playAll);
$("#speaking-stop").addEventListener("click", stopPlayback);
window.addEventListener("hashchange", renderSpeakingRoute);
if ("speechSynthesis" in window) {
  availableEnglishVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", availableEnglishVoices);
}
const languageObserver = new MutationObserver(() => {
  if (location.hash.slice(1).split("/").filter(Boolean)[0] === "speaking") renderSpeakingRoute();
});
languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
renderSpeakingRoute();
