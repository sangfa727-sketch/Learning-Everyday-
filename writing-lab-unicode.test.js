import test from "node:test";
import assert from "node:assert/strict";
import { normalizePastedLetter } from "./writing-lab-unicode.js";

test("Unicode mathematical script capitals normalize to their Latin letter", () => {
  const cases = [
    ["𝒜", "A"], ["ℬ", "B"], ["𝒞", "C"], ["𝒟", "D"], ["ℰ", "E"],
    ["ℱ", "F"], ["𝒢", "G"], ["ℋ", "H"], ["ℐ", "I"], ["𝒥", "J"],
    ["𝒦", "K"], ["ℒ", "L"], ["ℳ", "M"], ["𝒩", "N"], ["𝒪", "O"],
    ["𝒫", "P"], ["𝒬", "Q"], ["ℛ", "R"], ["𝒮", "S"], ["𝒯", "T"],
    ["𝒰", "U"], ["𝒱", "V"], ["𝒲", "W"], ["𝒳", "X"], ["𝒴", "Y"], ["𝒵", "Z"]
  ];
  for (const [script, latin] of cases) assert.equal(normalizePastedLetter(script), latin, script);
});

test("Unicode mathematical script lowercase letters normalize to Latin lowercase", () => {
  const cases = [
    ["𝒶", "a"], ["𝒷", "b"], ["𝒸", "c"], ["𝒹", "d"], ["ℯ", "e"],
    ["𝒻", "f"], ["ℊ", "g"], ["𝒽", "h"], ["𝒾", "i"], ["𝒿", "j"],
    ["𝓀", "k"], ["𝓁", "l"], ["𝓂", "m"], ["𝓃", "n"], ["ℴ", "o"],
    ["𝓅", "p"], ["𝓆", "q"], ["𝓇", "r"], ["𝓈", "s"], ["𝓉", "t"],
    ["𝓊", "u"], ["𝓋", "v"], ["𝓌", "w"], ["𝓍", "x"], ["𝓎", "y"], ["𝓏", "z"]
  ];
  for (const [script, latin] of cases) assert.equal(normalizePastedLetter(script), latin, script);
});

test("normalizer rejects multiple letters, SVG snippets, and unsupported symbols", () => {
  for (const value of ["", "𝒜ℬ", "AB", "𝟜", "♥", "M10 10L20 20", null, 42]) {
    assert.equal(normalizePastedLetter(value), null, String(value));
  }
  assert.equal(normalizePastedLetter(" 𝒜 "), "A");
});
