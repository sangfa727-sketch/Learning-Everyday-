import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS, VOCABULARY_CATEGORIES, SKILL_PRACTICE, EXTRA_SKILL_PRACTICE, LETTER_GUIDES, ALPHABET, getPractice, getPracticeCount } from "./curriculum.js";

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

test("letter guides have animated stroke paths and bilingual start instructions", () => {
  for (const letter of ["A", "a", "B", "b", "C", "c"]) {
    const guide = LETTER_GUIDES[letter];
    assert.ok(guide.start && guide.my && guide.paths.length > 0);
    assert.ok(guide.paths.every((path) => path.startsWith("M")));
  }
});

test("alphabet practice includes every uppercase and lowercase English letter exactly once", () => {
  assert.equal(ALPHABET.length, 52);
  assert.equal(new Set(ALPHABET).size, 52);
  assert.deepEqual(ALPHABET.slice(0, 26), [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);
  assert.deepEqual(ALPHABET.slice(26), [..."abcdefghijklmnopqrstuvwxyz"]);
});
