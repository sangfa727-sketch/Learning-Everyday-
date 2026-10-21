export const DICTIONARY = Object.freeze({
  garden: { meaning: "a place where flowers, fruit, or vegetables are grown", usage: "Maya has a small garden.", my: "ပန်းပင်၊ ဟင်းသီးဟင်းရွက် စိုက်ပျိုးရာနေရာ" },
  morning: { meaning: "the early part of the day", usage: "Every morning, she waters the flowers.", my: "မနက်ခင်း" },
  water: { meaning: "to give water to a plant or living thing", usage: "She waters the flowers.", my: "ရေလောင်းသည်" },
  flower: { meaning: "the colorful part of a plant", usage: "The flowers are beautiful.", my: "ပန်း" },
  bird: { meaning: "an animal with feathers, wings, and a beak", usage: "A yellow bird visits the garden.", my: "ငှက်" },
  visit: { meaning: "to go to see a person or place", usage: "A bird visits the garden.", my: "လာရောက်လည်ပတ်သည်" },
  sing: { meaning: "to make musical sounds with the voice", usage: "The bird sings in the tree.", my: "သီချင်းဆိုသည်" },
  happy: { meaning: "feeling pleased or glad", usage: "Maya feels happy.", my: "ပျော်ရွှင်သော" },
  small: { meaning: "little in size", usage: "She has a small garden.", my: "သေးငယ်သော" },
  learn: { meaning: "to gain knowledge or a new skill", usage: "I learn a little every day.", my: "သင်ယူသည်" },
  every: { meaning: "each one in a group or period of time", usage: "I practice every day.", my: "တိုင်း၊ အားလုံးသော" },
  tree: { meaning: "a tall plant with a trunk and branches", usage: "The bird sits in the tree.", my: "သစ်ပင်" },
  song: { meaning: "a short piece of music with words or melody", usage: "Maya hears the bird's song.", my: "သီချင်း" },
  hear: { meaning: "to notice a sound with your ears", usage: "She hears a bird sing.", my: "ကြားသည်" },
  feel: { meaning: "to experience an emotion or sensation", usage: "Maya feels happy.", my: "ခံစားရသည်" }
});

export function normalizeWord(value) {
  return String(value ?? "").toLocaleLowerCase("en").replace(/^[^a-z'-]+|[^a-z'-]+$/g, "");
}

export function lookupWord(value, dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  if (!word) return null;
  if (Object.prototype.hasOwnProperty.call(dictionary, word)) return dictionary[word];

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
