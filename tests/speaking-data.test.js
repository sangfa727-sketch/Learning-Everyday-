import test from "node:test";
import assert from "node:assert/strict";
import { CONVERSATIONS } from "../speaking-data.js";

test("speaking library contains exactly five distinct conversation topics", () => {
  assert.equal(CONVERSATIONS.length, 5);
  assert.equal(new Set(CONVERSATIONS.map((item) => item.id)).size, 5);
  for (const item of CONVERSATIONS) {
    assert.ok(item.title.trim());
    assert.ok(item.myTitle.trim());
    assert.ok(item.summary.trim());
    assert.ok(item.mySummary.trim());
  }
});

test("every conversation contains 10 to 15 complete alternating dialogue lines", () => {
  for (const conversation of CONVERSATIONS) {
    assert.ok(conversation.lines.length >= 10 && conversation.lines.length <= 15, conversation.id);
    conversation.lines.forEach((line, index) => {
      assert.equal(line.length, 4, conversation.id + " line " + index);
      assert.ok(line.every((part) => typeof part === "string" && part.trim()), conversation.id + " line " + index);
      assert.equal(line[1], index % 2 === 0 ? "female" : "male", conversation.id + " line " + index);
    });
  }
});

test("each conversation has a dedicated route id, level and bilingual labels", () => {
  for (const conversation of CONVERSATIONS) {
    assert.match(conversation.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.match(conversation.level, /^A[12]$/);
    assert.ok(conversation.lines.every((line) => /[A-Za-z]/.test(line[2])));
    assert.ok(conversation.lines.every((line) => /[\u1000-\u109F]/.test(line[3])));
  }
});
