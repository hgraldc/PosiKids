export function shuffledPieces(random: () => number = Math.random): number[] {
  const values = Array.from({ length: 9 }, (_, i) => i);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
export function placePiece(
  placed: number[],
  piece: number | null,
  slot: number,
): { result: "ignored" | "wrong" | "correct"; placed: number[] } {
  if (
    piece === null ||
    !Number.isInteger(piece) ||
    piece < 0 ||
    piece > 8 ||
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot > 8 ||
    placed.includes(piece) ||
    placed.includes(slot)
  )
    return { result: "ignored", placed };
  if (piece !== slot) return { result: "wrong", placed };
  return { result: "correct", placed: [...placed, piece] };
}
