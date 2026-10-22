import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARY, normalizeWord, lookupWord, lookupWordInContext, tokenizeStory, countCharacters, clampSpeechRate } from "../learning-core.js";
import { readLocalValue, writeLocalValue } from "../local-state.js";

test("normalizes punctuation and case for word lookup", () => {
  assert.equal(normalizeWord("Garden,"), "garden");
  assert.equal(lookupWord("BIRD.")?.my, "ငှက်");
  assert.equal(lookupWord("unknown"), null);
  assert.equal(lookupWord("!!!"), null);
});

test("dictionary is a local, non-empty source for the sample story", () => {
  assert.ok(Object.keys(DICTIONARY).length >= 10);
  for (const word of ["garden", "morning", "flower", "bird", "happy"]) assert.ok(lookupWord(word));
});

test("looks up common inflected forms without a network request", () => {
  assert.equal(lookupWord("flowers")?.my, "ပန်း");
  assert.equal(lookupWord("waters")?.my, "ရေ၊ ရေလောင်းသည် (ဝါကျအလိုက် အဓိပ္ပာယ်ကွဲသည်)");
  assert.equal(lookupWordInContext("water", "The river gave the town drinking water.")?.my, "ရေ");
  assert.equal(lookupWordInContext("waters", "Maya waters the flowers.")?.my, "ရေလောင်းသည်");
  assert.equal(lookupWord("visits")?.my, "လာရောက်လည်ပတ်သည်");
  assert.equal(lookupWord("singing")?.my, "သီချင်းဆိုသည်");
  assert.equal(lookupWord("unknowns"), null);
});

test("tokenization preserves all story text and whitespace", () => {
  const input = "A bird sings!";
  const tokens = tokenizeStory(input);
  assert.equal(tokens.map((part) => part.text).join(""), input);
  assert.equal(tokens.find((part) => part.text === "bird").word, "bird");
  assert.equal(tokens.find((part) => part.text === "sings!").word, "sings");
});

test("character count handles Unicode code points", () => {
  assert.equal(countCharacters("hello"), 5);
  assert.equal(countCharacters("မြန်မာ"), 6);
  assert.equal(countCharacters(""), 0);
});

test("speech rate is clamped and invalid values fall back safely", () => {
  assert.equal(clampSpeechRate("1.15"), 1.15);
  assert.equal(clampSpeechRate(0), 0.5);
  assert.equal(clampSpeechRate(9), 2);
  assert.equal(clampSpeechRate("not a number"), 1);
});

test("local state helpers save and restore values using injected storage", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value))
  };
  assert.equal(readLocalValue("language", "en", storage), "en");
  assert.equal(writeLocalValue("language", "my", storage), true);
  assert.equal(readLocalValue("language", "en", storage), "my");
});

test("local state helpers fail safely when storage is unavailable", () => {
  const brokenStorage = {
    getItem: () => { throw new Error("storage blocked"); },
    setItem: () => { throw new Error("storage blocked"); }
  };
  assert.equal(readLocalValue("draft", "", brokenStorage), "");
  assert.equal(writeLocalValue("draft", "text", brokenStorage), false);
});
