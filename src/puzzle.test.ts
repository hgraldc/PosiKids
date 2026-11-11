import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffledPieces, placePiece } from "./puzzle.ts";
test("shuffled tray contains all nine unique pieces", () => {
  const pieces = shuffledPieces(() => 0.3);
  assert.equal(new Set(pieces).size, 9);
  assert.deepEqual([...pieces].sort(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});
test("wrong, duplicate and invalid placements cannot advance puzzle", () => {
  const empty: number[] = [];
  assert.equal(placePiece(empty, 0, 1).result, "wrong");
  assert.equal(placePiece(empty, 0, 1).placed, empty);
  assert.equal(placePiece(empty, null, 0).result, "ignored");
  assert.equal(placePiece(empty, 12, 12).result, "ignored");
  const one = placePiece(empty, 0, 0).placed;
  assert.equal(placePiece(one, 0, 0).result, "ignored");
  assert.equal(placePiece(one, 1, 0).result, "ignored");
});
test("all unique correct pieces complete the puzzle once", () => {
  let placed: number[] = [];
  for (const id of shuffledPieces()) {
    const next = placePiece(placed, id, id);
    assert.equal(next.result, "correct");
    placed = next.placed;
  }
  assert.equal(placed.length, 9);
  assert.equal(placePiece(placed, 8, 8).result, "ignored");
});
