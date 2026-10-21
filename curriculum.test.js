import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, EXTRA_SKILL_PRACTICE, LETTER_GUIDES, ALPHABET, CURSIVE_GLYPHS, getPractice, getPracticeCount } from "./curriculum.js";

test("vocabulary categories have unique ids and bilingual words with examples", () => {
  assert.ok(VOCABULARY_CATEGORIES.length >= 16);
  assert.equal(new Set(VOCABULARY_CATEGORIES.map((category) => category.id)).size, VOCABULARY_CATEGORIES.length);
  assert.ok(VOCABULARY_CATEGORIES.reduce((total, category) => total + category.words.length, 0) >= 128);
  for (const category of VOCABULARY_CATEGORIES) {
    assert.ok(category.en && category.my && category.words.length >= 8);
    for (const [word, meaning, example] of category.words) assert.ok(word && meaning && example);
  }
});

test("all four skills have a non-empty exercise for every CEFR level", () => {
  assert.deepEqual(Object.keys(SKILL_PRACTICE).sort(), ["listening", "reading", "speaking", "writing"]);
  for (const skill of Object.values(SKILL_PRACTICE)) {
    for (const level of LEVELS) {
      assert.ok(skill[level.id]?.title && skill[level.id]?.prompt && skill[level.id]?.task && skill[level.id]?.myTask);
    }
  }
  assert.equal(getPractice("speaking", "C2").title, "Discuss trade-offs");
  assert.equal(getPractice("unknown", "A1"), null);
});

test("every skill and CEFR level has a second bilingual practice exercise", () => {
  for (const skillName of ["reading", "listening", "writing", "speaking"]) {
    for (const level of LEVELS) {
      const first = getPractice(skillName, level.id, 0);
      const second = getPractice(skillName, level.id, 1);
      assert.ok(first && second, skillName + " " + level.id + " should have two exercises");
      assert.notEqual(first.prompt, second.prompt);
      assert.ok(second.title && second.task && second.myTask);
      assert.equal(getPracticeCount(skillName, level.id), 2);
      assert.equal(EXTRA_SKILL_PRACTICE[skillName][level.id].prompt, second.prompt);
    }
  }
  assert.equal(getPractice("reading", "A1", 2), null);
});

test("every uppercase and lowercase letter has an animated bilingual stroke guide", () => {
  assert.deepEqual(Object.keys(LETTER_GUIDES).sort(), [...ALPHABET].sort());
  for (const letter of ALPHABET) {
    const guide = LETTER_GUIDES[letter];
    assert.ok(guide.start && guide.my && guide.paths.length > 0, `${letter} should have a guide`);
    assert.ok(guide.paths.every((path) => path.startsWith("M")), `${letter} paths should be SVG paths`);
  }
});

test("alphabet practice includes every uppercase and lowercase English letter exactly once", () => {
  assert.equal(ALPHABET.length, 52);
  assert.equal(new Set(ALPHABET).size, 52);
  assert.deepEqual(ALPHABET.slice(0, 26), [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);
  assert.deepEqual(ALPHABET.slice(26), [..."abcdefghijklmnopqrstuvwxyz"]);
});

test("script cursive sample glyphs cover all 52 letters and match the supplied style", () => {
  assert.deepEqual(Object.keys(CURSIVE_GLYPHS).sort(), [...ALPHABET].sort());
  assert.equal(new Set(Object.values(CURSIVE_GLYPHS)).size, 52);
  assert.equal(CURSIVE_GLYPHS.A, "𝒜");
  assert.equal(CURSIVE_GLYPHS.B, "ℬ");
  assert.equal(CURSIVE_GLYPHS.H, "ℋ");
  assert.equal(CURSIVE_GLYPHS.M, "ℳ");
  assert.equal(CURSIVE_GLYPHS.R, "ℛ");
  assert.equal(CURSIVE_GLYPHS.a, "𝒶");
  assert.equal(CURSIVE_GLYPHS.e, "ℯ");
  assert.equal(CURSIVE_GLYPHS.g, "ℊ");
  assert.equal(CURSIVE_GLYPHS.o, "ℴ");
});


test("cursive alphabet mapping covers uppercase and lowercase without collisions", () => {
  const uppercase = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  const lowercase = [..."abcdefghijklmnopqrstuvwxyz"];
  assert.deepEqual(Object.keys(CURSIVE_GLYPHS).filter((letter) => letter === letter.toUpperCase()), uppercase);
  assert.deepEqual(Object.keys(CURSIVE_GLYPHS).filter((letter) => letter !== letter.toUpperCase()), lowercase);
  assert.equal(CURSIVE_GLYPHS.a, "𝒶");
  assert.equal(CURSIVE_GLYPHS.o, "ℴ");
  assert.notEqual(CURSIVE_GLYPHS.a, CURSIVE_GLYPHS.o);
  for (const letter of ALPHABET) assert.ok(CURSIVE_GLYPHS[letter], `Missing script glyph for ${letter}`);
});
