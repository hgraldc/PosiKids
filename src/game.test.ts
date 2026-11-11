import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshSave,
  startStage,
  submitAnswer,
  advance,
  decodeSave,
  unlocked,
  QUESTIONS,
  matches,
  validateContent,
} from "./game.ts";
import type { Save, StageId } from "./game.ts";
function player(): Save {
  return { ...freshSave(), character: "zaa" };
}
function finish(save: Save, stage: StageId): Save {
  let s = startStage(save, stage);
  for (const q of QUESTIONS[stage]) {
    s = submitAnswer(s, stage, q.options.find((o) => matches(q, o))!.id);
    if (q !== QUESTIONS[stage].at(-1)) s = advance(s, stage);
  }
  return s;
}
test("all questions have exactly one semantic answer", () => {
  assert.doesNotThrow(validateContent);
  for (const qs of Object.values(QUESTIONS))
    for (const q of qs)
      assert.equal(q.options.filter((o) => matches(q, o)).length, 1);
});
test("color and shape must both match", () => {
  const q = QUESTIONS[1][0];
  assert.equal(matches(q, q.options[0]), false);
  assert.equal(matches(q, q.options[1]), false);
  assert.equal(matches(q, q.options[2]), true);
});
test("locked stages and unknown options do not change state", () => {
  const s = player();
  assert.equal(startStage(s, 2), s);
  const a = startStage(s, 1);
  assert.equal(submitAnswer(a, 1, "unknown"), a);
  assert.equal(startStage(freshSave(), 1).sessions[1], undefined);
});
test("wrong answers retry same question and double input is ignored", () => {
  let s = startStage(player(), 1);
  s = submitAnswer(s, 1, "red-triangle");
  assert.equal(s.sessions[1]!.status, "wrong");
  assert.equal(submitAnswer(s, 1, "blue-triangle"), s);
  s = advance(s, 1);
  assert.equal(s.sessions[1]!.index, 0);
  s = submitAnswer(s, 1, "blue-triangle");
  assert.equal(s.sessions[1]!.attempts["color-1"], 2);
  assert.equal(submitAnswer(s, 1, "blue-triangle"), s);
});
test("completion saves before navigation, survives reload, and replay keeps badges", () => {
  let s = finish(player(), 1);
  assert.deepEqual(s.completed, [1]);
  assert.equal(unlocked(s, 2), true);
  assert.deepEqual(decodeSave(JSON.stringify(s)), s);
  s = startStage(s, 1, true);
  assert.equal(s.sessions[1]!.index, 0);
  assert.equal(unlocked(s, 2), true);
  assert.deepEqual(decodeSave(JSON.stringify(s)), s);
});
test("full path finishes all three stages and reading uses recipient ID", () => {
  let s = player();
  for (const id of [1, 2, 3] as StageId[]) s = finish(s, id);
  assert.deepEqual(s.completed, [1, 2, 3]);
  assert.deepEqual(decodeSave(JSON.stringify(s)), s);
  assert.equal(matches(QUESTIONS[3][0], QUESTIONS[3][0].options[1]), true);
});
test("reload restores correct and wrong feedback without adding attempts", () => {
  for (const answer of ["red-triangle", "blue-triangle"]) {
    const s = submitAnswer(startStage(player(), 1), 1, answer);
    assert.deepEqual(decodeSave(JSON.stringify(s)), s);
    assert.equal(s.sessions[1]!.attempts["color-1"], 1);
  }
});
test("corrupt, incompatible, and inconsistent snapshots are rejected", () => {
  assert.equal(decodeSave("{"), null);
  assert.equal(decodeSave(JSON.stringify({ ...player(), version: 2 })), null);
  assert.equal(
    decodeSave(JSON.stringify({ ...player(), completed: [3] })),
    null,
  );
  const s = startStage(player(), 1);
  s.sessions[1]!.index = 99;
  assert.equal(decodeSave(JSON.stringify(s)), null);
});
