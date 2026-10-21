import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARY, normalizeWord, lookupWord, tokenizeStory, countCharacters, clampSpeechRate } from "../learning-core.js";

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
