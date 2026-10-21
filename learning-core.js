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
  song: { meaning: "a short piece of music with words or melody", usage: "Maya hears the bird's song.", my: "သီချင်း" }
});

export function normalizeWord(value) {
  return String(value ?? "").toLocaleLowerCase("en").replace(/^[^a-z'-]+|[^a-z'-]+$/g, "");
}

export function lookupWord(value, dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  return word && Object.prototype.hasOwnProperty.call(dictionary, word) ? dictionary[word] : null;
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
