import { DICTIONARY } from "./dictionary.js";

export { DICTIONARY };

export function normalizeWord(value) {
  return String(value ?? "")
    .toLocaleLowerCase("en")
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-z'-]+|[^a-z'-]+$/g, "");
}

const IRREGULAR_WORD_BASES = Object.freeze({
  am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  went: "go", gone: "go", goes: "go", going: "go", came: "come", woke: "wake", grown: "grow", risen: "rise", lives: "life",
  saw: "see", seen: "see",
  took: "take", taken: "take",
  gave: "give", given: "give",
  got: "get", gotten: "get",
  brought: "bring", bought: "buy",
  thought: "think", caught: "catch",
  found: "find", told: "tell", said: "say",
  ran: "run", sat: "sit", fell: "fall", stood: "stand", felt: "feel",
  knew: "know", known: "know", understood: "understand",
  wrote: "write", written: "write",
  ate: "eat", eaten: "eat",
  drank: "drink", drunk: "drink",
  spoke: "speak", spoken: "speak",
  broke: "break", broken: "break",
  chose: "choose", chosen: "choose",
  kept: "keep", slept: "sleep", forgot: "forget", forgotten: "forget",
  held: "hold", heard: "hear",
  lost: "lose", won: "win",
  sent: "send", spent: "spend",
  built: "build", met: "meet",
  made: "make", did: "do", done: "do",
  had: "have", has: "have",
  children: "child", men: "man", women: "woman",
  feet: "foot", teeth: "tooth", mice: "mouse",
  worn: "wear", rang: "ring", rung: "ring", began: "begin", shelves: "shelf",
  safer: "safe", taller: "tall", lighter: "light", easier: "easy",
  hurried: "hurry", recognised: "recognise",
});

export function lookupWord(value, dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  if (!word) return null;
  if (Object.prototype.hasOwnProperty.call(dictionary, word)) return dictionary[word];
  // Curly/straight possessives should remain tappable as a whole word and reuse
  // the noun/name entry instead of producing an untranslated token.
  if (word.endsWith("'s")) {
    const possessiveBase = word.slice(0, -2);
    if (Object.prototype.hasOwnProperty.call(dictionary, possessiveBase)) return dictionary[possessiveBase];
  }
  const irregularBase = IRREGULAR_WORD_BASES[word];
  if (irregularBase && Object.prototype.hasOwnProperty.call(dictionary, irregularBase)) return dictionary[irregularBase];

  // Small, deterministic morphology fallback for common English inflections.
  // Keep it conservative: only return a definition when a candidate exists locally.
  const candidates = [];
  if (word.endsWith("ies") && word.length > 4) candidates.push(word.slice(0, -3) + "y");
  if (word.endsWith("es") && word.length > 4) candidates.push(word.slice(0, -2), word.slice(0, -1));
  if (word.endsWith("s") && word.length > 3) candidates.push(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  if (word.endsWith("ed") && word.length > 4) {
    const stem = word.slice(0, -2);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(dictionary, candidate)) return dictionary[candidate];
  }
  return null;
}


const CONTEXTUAL_SENSES = Object.freeze({
  rose: [
    { test: /\b(river|water|level|flood|sun|temperature|price|number|smoke|mist|voice|hand|head|from .*seat|early)\b/i, meaning: "past tense of rise; moved upward or increased", my: "မြင့်တက်လာခဲ့သည်၊ မြင့်တက်ခဲ့သည်" },
    { test: /\b(garden|flower|petal|stem|bloom|red|pink|thorn|plant|bouquet|vase)\b/i, meaning: "a rose, a kind of flowering plant", my: "နှင်းဆီပန်း" }
  ],
  lives: [
    { test: /\b(life|people's|many people's|our|their|his|her|different)\s+lives\b/i, meaning: "plural of life", my: "ဘဝများ၊ အသက်တာများ" },
    { test: /\b(near|in|at|with|she|he|it|who|that|there)\b/i, meaning: "verb: is alive or resides", my: "အသက်ရှင်နေသည်၊ နေထိုင်သည်" }
  ],
  saw: [
    { test: /\b(carpenter|wood|cut|tool|blade|workshop|repair)\b/i, meaning: "a tool used for cutting wood or other material", my: "လွှ" },
    { test: /\b(they|we|i|she|he|maya|nora|lina|students|people)\s+saw\b/i, meaning: "past tense of see; noticed or witnessed", my: "မြင်တွေ့ခဲ့သည်၊ တွေ့မြင်ခဲ့သည်" }
  ],
  found: [
    { test: /\b(founded|foundation|established|set up)\b/i, meaning: "established or set up", my: "တည်ထောင်ခဲ့သည်" },
    { test: /\b(found|discovered|located|puppy|evidence|enough|money|item|place)\b/i, meaning: "past tense of find; discovered or located", my: "တွေ့ရှိခဲ့သည်၊ ရှာတွေ့ခဲ့သည်" }
  ],
  means: [
    { test: /\b(a means|useful means|by means|means of|method|way|transport)\b/i, meaning: "a method or way of doing something", my: "နည်းလမ်း၊ အကြောင်းနည်းလမ်း" },
    { test: /\b(means|mean|means that|means asking|means making|means doing)\b/i, meaning: "indicates or expresses an idea; involves", my: "ဆိုလိုသည်၊ ပါဝင်သည်" }
  ],
  well: [
    { test: /\b(water|village|deep|dug|hole|bucket|drawn from)\b/i, meaning: "a deep hole from which water is obtained", my: "ရေတွင်း" },
    { test: /\b(healthy|sick|ill|feel|looks|doing|worked|spoke|performed|together)\b/i, meaning: "in a good or satisfactory way; healthy", my: "ကောင်းစွာ၊ ကျန်းမာသော" }
  ],
  looking: [
    { test: /\blooking back(?: on\b|,\s*(?:i|we|they|she|he)\b)/i, meaning: "reflecting on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်ခြင်း" },
    { test: /\blooking back at\b/i, meaning: "turning one's eyes toward something behind", my: "နောက်ဘက်သို့ လှည့်ကြည့်ခြင်း" }
  ],
  looked: [
    { test: /\blooked back on\b/i, meaning: "reflected on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်ခဲ့သည်" },
    { test: /\blocked back at\b/i, meaning: "turned one's eyes toward something behind", my: "နောက်ဘက်သို့ လှည့်ကြည့်ခဲ့သည်" }
  ],
  back: [
    { test: /\b(looking back(?: on\b|,\s*(?:i|we|they|she|he)\b)|look back on|thinking back)\b/i, meaning: "to think about or reflect on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်သည်" },
    { test: /\b(turned back|turn back|look back at|looked back at|looking back at|looked back toward|behind|back door|back of)\b/i, meaning: "the rear part; toward the rear", my: "နောက်ဘက်၊ နောက်သို့" }
  ],
  light: [
    { test: /\b(heavy|carry|weight|bag|basket|box)\b/i, meaning: "not heavy", my: "ပေါ့ပါးသော" },
    { test: /\b(sun|lamp|bright|dark|see|shine|torch)\b/i, meaning: "brightness that makes things visible", my: "အလင်းရောင်" }
  ],
  close: [
    { test: /\b(door|gate|window|shut|open|lid|book)\b/i, meaning: "to shut or cover an opening", my: "ပိတ်သည်" },
    { test: /\b(near|distance|nearby|house|school|shop|friend)\b/i, meaning: "near in distance or relationship", my: "နီးသော၊ ရင်းနှီးသော" }
  ],
  change: [
    { test: /\b(returned|coins|money|cash|pay|price)\b/i, meaning: "money returned after paying more than the cost", my: "ပြန်အမ်းငွေ" },
    { test: /\b(change|routine|plan|weather|become|different|decide|changed)\b/i, meaning: "to make or become different", my: "ပြောင်းလဲသည်၊ ပြောင်းလဲမှု" }
  ],
  present: [
    { test: /\b(gift|birthday|wrapped|gave|receive|Christmas)\b/i, meaning: "a gift", my: "လက်ဆောင်" },
    { test: /\b(attend|in the room|being|there|at school|currently)\b/i, meaning: "being in a place; existing now", my: "ရှိနေသော၊ လက်ရှိ" }
  ]
});

export function lookupWordInContext(value, context = "", dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  const entry = lookupWord(word, dictionary);
  if (!entry) return null;
  const senses = CONTEXTUAL_SENSES[word];
  if (!senses) return entry;
  const sentence = String(context ?? "");
  const selected = senses.find((sense) => sense.test.test(sentence));
  return selected ? { ...entry, meaning: selected.meaning, my: selected.my } : entry;
}

export function tokenizeStory(text) {
  return String(text ?? "").split(/(\s+)/).map((part) => {
    if (!part || /^\s+$/.test(part)) return { text: part, word: null };
    const word = normalizeWord(part);
    return { text: part, word: /^[a-z]+(?:['-][a-z]+)*$/i.test(word) ? word.toLowerCase() : null };
  });
}

export function countCharacters(value) {
  return Array.from(String(value ?? "")).length;
}

export function clampSpeechRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return 1;
  return Math.min(2, Math.max(0.5, rate));
}
