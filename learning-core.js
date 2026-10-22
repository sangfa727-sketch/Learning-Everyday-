import { DICTIONARY } from "./dictionary.js";

export { DICTIONARY };

export function normalizeWord(value) {
  return String(value ?? "").toLocaleLowerCase("en").replace(/^[^a-z'-]+|[^a-z'-]+$/g, "");
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
  worn: "wear", rang: "ring", rung: "ring", began: "begin",
  safer: "safe", taller: "tall", lighter: "light", easier: "easy",
  hurried: "hurry", recognised: "recognise",
});

export function lookupWord(value, dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  if (!word) return null;
  if (Object.prototype.hasOwnProperty.call(dictionary, word)) return dictionary[word];
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
