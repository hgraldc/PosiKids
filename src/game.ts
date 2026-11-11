export type StageId = 1 | 2 | 3;
export type Character = "zaa" | "zee";
export type Option = {
  id: string;
  label: string;
  asset: string;
  color?: string;
  shape?: string;
  number?: number;
  recipient?: string;
};
export type Question = {
  id: string;
  stage: StageId;
  prompt: string;
  emphasis: string;
  hint: string;
  target: {
    color?: string;
    shape?: string;
    number?: number;
    recipient?: string;
  };
  options: Option[];
};
export const STAGES = [
  {
    id: 1 as StageId,
    title: "Bentuk & Warna",
    label: "Warna-warni rumah",
    description: "Temukan rumah dengan warna dan bentuk yang tepat.",
    icon: "shapes",
    color: "orange",
  },
  {
    id: 2 as StageId,
    title: "Angka",
    label: "Nomor rumah siapa?",
    description: "Cocokkan angka, lalu antarkan suratnya.",
    icon: "numbers",
    color: "blue",
  },
  {
    id: 3 as StageId,
    title: "Membaca",
    label: "Surat untuk teman",
    description: "Baca nama di surat dan temukan penerimanya.",
    icon: "book",
    color: "green",
  },
];
const house = (
  asset: string,
  label: string,
  color: string,
  shape: string,
): Option => ({ id: asset, asset, label, color, shape });
const houses = {
  bt: house("blue-triangle", "Biru · Segitiga", "blue", "triangle"),
  rt: house("red-triangle", "Merah · Segitiga", "red", "triangle"),
  bc: house("blue-circle", "Biru · Lingkaran", "blue", "circle"),
  pr: house(
    "purple-rectangle",
    "Ungu · Persegi panjang",
    "purple",
    "rectangle",
  ),
  ys: house("yellow-square", "Kuning · Persegi", "yellow", "square"),
  ps: house("purple-star", "Ungu · Bintang", "purple", "star"),
  rc: house("red-circle", "Merah · Lingkaran", "red", "circle"),
  gr: house("green-rectangle", "Hijau · Persegi panjang", "green", "rectangle"),
  op: house("orange-pentagon", "Oranye · Segilima", "orange", "pentagon"),
  yt: house("yellow-star", "Kuning · Bintang", "yellow", "star"),
};
const number = (n: number): Option => ({
  id: `number-${n}`,
  asset: `number-${n}`,
  label: `Rumah nomor ${n}`,
  number: n,
});
export const RECIPIENTS: Option[] = [
  "Rara",
  "Beni",
  "Mora",
  "Roni",
  "Amar",
  "Dewi",
  "Vena",
  "Miya",
].map((name) => ({
  id: name.toLowerCase(),
  asset: name.toLowerCase(),
  label: name,
  recipient: name.toLowerCase(),
}));
export const QUESTIONS: Record<StageId, Question[]> = {
  1: [
    {
      id: "color-1",
      stage: 1,
      prompt: "Antarkan surat ke rumah",
      emphasis: "biru berbentuk segitiga",
      hint: "Perhatikan warna dan bentuk rumahnya, ya!",
      target: { color: "blue", shape: "triangle" },
      options: [houses.rt, houses.bc, houses.bt, houses.pr],
    },
    {
      id: "color-2",
      stage: 1,
      prompt: "Cari rumah",
      emphasis: "kuning berbentuk persegi",
      hint: "Warna kuning dan empat sisi yang sama panjang.",
      target: { color: "yellow", shape: "square" },
      options: [houses.ps, houses.ys, houses.rc, houses.gr],
    },
    {
      id: "color-3",
      stage: 1,
      prompt: "Surat terakhir untuk rumah",
      emphasis: "oranye berbentuk segilima",
      hint: "Cari rumah oranye dengan lima sisi.",
      target: { color: "orange", shape: "pentagon" },
      options: [houses.bc, houses.pr, houses.yt, houses.op],
    },
  ],
  2: [
    {
      id: "number-1",
      stage: 2,
      prompt: "Antarkan surat ke rumah",
      emphasis: "nomor 5",
      hint: "Perhatikan angka pada papan rumah.",
      target: { number: 5 },
      options: [number(19), number(2), number(8), number(5)],
    },
    {
      id: "number-2",
      stage: 2,
      prompt: "Surat berikutnya untuk rumah",
      emphasis: "nomor 8",
      hint: "Temukan angka yang sama dengan tujuan surat.",
      target: { number: 8 },
      options: [number(3), number(8), number(6), number(9)],
    },
    {
      id: "number-3",
      stage: 2,
      prompt: "Cari rumah dengan",
      emphasis: "nomor 12",
      hint: "Dua digit: satu, lalu dua.",
      target: { number: 12 },
      options: [number(21), number(11), number(12), number(17)],
    },
  ],
  3: ["Beni", "Rara", "Dewi"].map((name, index) => ({
    id: `read-${index + 1}`,
    stage: 3,
    prompt: "Siapa penerima surat ini?",
    emphasis: name,
    hint: "Baca nama pada surat, lalu pilih teman yang sesuai.",
    target: { recipient: name.toLowerCase() },
    options: RECIPIENTS,
  })),
};
export function matches(q: Question, option: Option): boolean {
  if (q.stage === 1)
    return option.color === q.target.color && option.shape === q.target.shape;
  if (q.stage === 2) return option.number === q.target.number;
  return option.recipient === q.target.recipient;
}
export function validateContent(): void {
  const ids = new Set<string>();
  for (const stage of STAGES)
    for (const q of QUESTIONS[stage.id]) {
      if (
        ids.has(q.id) ||
        q.stage !== stage.id ||
        q.options.filter((o) => matches(q, o)).length !== 1 ||
        new Set(q.options.map((o) => o.id)).size !== q.options.length
      )
        throw new Error(`Soal tidak valid: ${q.id}`);
      ids.add(q.id);
    }
}
export type Session = {
  index: number;
  status: "answer" | "correct" | "wrong";
  attempts: Record<string, number>;
  correct: string[];
  lastOption: string | null;
};
export type Save = {
  version: 1;
  contentVersion: 1;
  character: Character | null;
  muted: boolean;
  completed: StageId[];
  sessions: Partial<Record<StageId, Session>>;
  puzzleCompleted: boolean;
};
export const STORAGE_KEY = "posikids.save.v1";
export const freshSave = (): Save => ({
  version: 1,
  contentVersion: 1,
  character: null,
  muted: false,
  completed: [],
  sessions: {},
  puzzleCompleted: false,
});
export const freshSession = (): Session => ({
  index: 0,
  status: "answer",
  attempts: {},
  correct: [],
  lastOption: null,
});
export function unlocked(save: Save, stage: StageId): boolean {
  return stage === 1 || save.completed.includes((stage - 1) as StageId);
}
export function startStage(save: Save, stage: StageId, replay = false): Save {
  if (!save.character || !unlocked(save, stage)) return save;
  if (save.sessions[stage] && !replay) return save;
  return { ...save, sessions: { ...save.sessions, [stage]: freshSession() } };
}
export function submitAnswer(
  save: Save,
  stage: StageId,
  optionId: string,
): Save {
  const session = save.sessions[stage];
  if (
    !save.character ||
    !unlocked(save, stage) ||
    !session ||
    session.status !== "answer"
  )
    return save;
  const q = QUESTIONS[stage][session.index];
  const option = q.options.find((o) => o.id === optionId);
  if (!option) return save;
  const correct = matches(q, option);
  const correctIds = correct
    ? [...new Set([...session.correct, q.id])]
    : session.correct;
  const completed =
    correctIds.length === QUESTIONS[stage].length
      ? [...new Set([...save.completed, stage])]
      : save.completed;
  return {
    ...save,
    completed,
    sessions: {
      ...save.sessions,
      [stage]: {
        ...session,
        status: correct ? "correct" : "wrong",
        lastOption: optionId,
        attempts: {
          ...session.attempts,
          [q.id]: (session.attempts[q.id] ?? 0) + 1,
        },
        correct: correctIds,
      },
    },
  };
}
export function advance(save: Save, stage: StageId): Save {
  const s = save.sessions[stage];
  if (!s) return save;
  if (s.status === "wrong")
    return {
      ...save,
      sessions: {
        ...save.sessions,
        [stage]: { ...s, status: "answer", lastOption: null },
      },
    };
  if (s.status !== "correct" || s.index >= QUESTIONS[stage].length - 1)
    return save;
  return {
    ...save,
    sessions: {
      ...save.sessions,
      [stage]: { ...s, index: s.index + 1, status: "answer", lastOption: null },
    },
  };
}
export function decodeSave(raw: string | null): Save | null {
  if (!raw) return freshSave();
  try {
    const x = JSON.parse(raw) as Save;
    if (
      x.version !== 1 ||
      x.contentVersion !== 1 ||
      !["zaa", "zee", null].includes(x.character) ||
      typeof x.muted !== "boolean" ||
      typeof x.puzzleCompleted !== "boolean" ||
      !Array.isArray(x.completed) ||
      !x.sessions ||
      typeof x.sessions !== "object" ||
      Array.isArray(x.sessions)
    )
      return null;
    if (
      new Set(x.completed).size !== x.completed.length ||
      x.completed.some((s) => ![1, 2, 3].includes(s))
    )
      return null;
    if (
      (x.completed.includes(2) && !x.completed.includes(1)) ||
      (x.completed.includes(3) && !x.completed.includes(2))
    )
      return null;
    if (Object.keys(x.sessions).some((k) => !["1", "2", "3"].includes(k)))
      return null;
    if ((x.completed.length || Object.keys(x.sessions).length) && !x.character)
      return null;
    for (const stage of STAGES) {
      const s = x.sessions[stage.id];
      if (!s) continue;
      const qs = QUESTIONS[stage.id];
      const validIds = new Set(qs.map((q) => q.id));
      if (
        !unlocked(x, stage.id) ||
        !Number.isInteger(s.index) ||
        s.index < 0 ||
        s.index >= qs.length ||
        !["answer", "correct", "wrong"].includes(s.status) ||
        !Array.isArray(s.correct) ||
        new Set(s.correct).size !== s.correct.length ||
        s.correct.some((id) => !validIds.has(id)) ||
        !s.attempts ||
        typeof s.attempts !== "object" ||
        Array.isArray(s.attempts)
      )
        return null;
      if (
        Object.entries(s.attempts).some(
          ([id, n]) => !validIds.has(id) || !Number.isInteger(n) || n < 0,
        )
      )
        return null;
      if (qs.slice(0, s.index).some((q) => !s.correct.includes(q.id)))
        return null;
      if (s.correct.some((id) => (s.attempts[id] ?? 0) < 1)) return null;
      if (qs.slice(s.index + 1).some((q) => s.correct.includes(q.id)))
        return null;
      const q = qs[s.index];
      if (
        s.status === "answer" &&
        (s.correct.includes(q.id) || s.lastOption !== null)
      )
        return null;
      if (s.status !== "answer") {
        const o = q.options.find((o) => o.id === s.lastOption);
        if (
          !o ||
          (s.attempts[q.id] ?? 0) < 1 ||
          (s.status === "correct") !== matches(q, o) ||
          (s.status === "correct") !== s.correct.includes(q.id)
        )
          return null;
      }
      if (s.correct.length === qs.length && !x.completed.includes(stage.id))
        return null;
    }
    // An earned badge must have a session; a replay may have fewer correct answers.
    if (x.completed.some((s) => !x.sessions[s])) return null;
    return x;
  } catch {
    return null;
  }
}
validateContent();
