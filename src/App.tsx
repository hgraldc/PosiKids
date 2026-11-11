import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  STAGES,
  QUESTIONS,
  STORAGE_KEY,
  freshSave,
  startStage,
  submitAnswer,
  advance,
  decodeSave,
  unlocked,
} from "./game";
import type { Save, StageId, Character, Question } from "./game";
import { shuffledPieces, placePiece } from "./puzzle";
import dimensions from "../asset-dimensions.json";

type IconName =
  | "home"
  | "back"
  | "next"
  | "sound"
  | "mute"
  | "lock"
  | "unlock"
  | "check"
  | "repeat"
  | "mail"
  | "bulb"
  | "puzzle"
  | "book";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <path d="M5 13 16 3l11 10v14h-8v-9h-6v9H5Z" />,
    back: <path d="M28 11H15V5L3 16l12 11v-7h13Z" />,
    next: <path d="M4 11h13V5l12 11-12 11v-7H4Z" />,
    sound: (
      <>
        <path d="M3 11h6l9-7v24l-9-7H3Z" />
        <path className="icon-line" d="m24 8 3-2m-3 10h5m-5 8 3 2" />
      </>
    ),
    mute: (
      <>
        <path d="M3 11h6l9-7v24l-9-7H3Z" />
        <path className="icon-line" d="m23 11 7 10m0-10-7 10" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="13" width="22" height="17" rx="4" />
        <path className="icon-line" d="M10 14V8a6 6 0 0 1 12 0v6" />
        <path d="M14 21h4v5h-4z" fill="white" />
        <circle cx="16" cy="20" r="3" fill="white" />
      </>
    ),
    unlock: (
      <>
        <rect x="5" y="13" width="22" height="17" rx="4" />
        <path
          className="icon-line"
          d="M10 14V8a6 6 0 0 1 12-2M26 7l3-2M27 11h3"
        />
        <path d="M14 21h4v5h-4z" fill="white" />
        <circle cx="16" cy="20" r="3" fill="white" />
      </>
    ),
    check: <path className="icon-line" d="m5 16 7 7L27 7" />,
    repeat: (
      <>
        <path className="icon-line" d="M26 11A11 11 0 1 0 27 22" />
        <path d="M29 3v12H17Z" />
      </>
    ),
    mail: (
      <>
        <rect
          x="2"
          y="6"
          width="28"
          height="20"
          rx="1"
          fill="#fff9ee"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m3 7 13 11L29 7M3 25l9-10m17 10-9-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </>
    ),
    bulb: (
      <>
        <path
          d="M10 23c0-4-6-6-6-13a12 12 0 0 1 24 0c0 7-6 9-6 13Z"
          fill="#ffe13b"
          stroke="#493a22"
          strokeWidth="1"
        />
        <path
          d="m12 23-2-10 6 3 6-3-2 10m-9 1h10m-10 3h10m-8 3h6"
          fill="none"
          stroke="#493a22"
          strokeWidth="1.4"
        />
      </>
    ),
    puzzle: (
      <path d="M4 5h8V3a4 4 0 0 1 8 0v2h8v8h2a4 4 0 0 1 0 8h-2v8h-8v-3a4 4 0 0 0-8 0v3H4v-8h3a4 4 0 0 0 0-8H4Z" />
    ),
    book: (
      <>
        <path d="m3 4 22-3 5 26-23 4Z" fill="#ff966e" stroke="#59382a" />
        <path d="m7 7 14-2 2 7-14 2Z" fill="#fff8ed" stroke="#59382a" />
        <path d="m7 27 20-3M6 4l5 24" fill="none" stroke="#59382a" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
function Art({
  name,
  alt = "",
  className = "",
  priority = false,
}: {
  name: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [name]);
  const size = (dimensions as Record<string, number[]>)[name] ?? [600, 600];
  if (failed)
    return (
      <span
        className={`art-error ${className}`}
        role="img"
        aria-label={alt || "Gambar tidak tersedia"}
      >
        Gambar tidak tersedia. Muat ulang halaman.
      </span>
    );
  return (
    <img
      src={`/assets/${name}.webp`}
      width={size[0]}
      height={size[1]}
      alt={alt}
      className={className}
      draggable={false}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
function RoundButton({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`round-button ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} />
    </button>
  );
}
function Sign({
  children,
  hanging = false,
}: {
  children: ReactNode;
  hanging?: boolean;
}) {
  return (
    <header className={`title-sign ${hanging ? "hanging" : ""}`}>
      <h1 id="page-title" tabIndex={-1}>
        {children}
      </h1>
    </header>
  );
}
function Modal({
  children,
  label,
  onClose,
  feedback = false,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  feedback?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={feedback ? "feedback-modal" : "confirm-modal"}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}
let audio: AudioContext | null = null;
function tone(kind: "good" | "retry" | "piece", muted: boolean) {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const notes =
      kind === "good"
        ? [523, 659, 784]
        : kind === "retry"
          ? [392, 330]
          : [660, 880];
    notes.forEach((frequency, index) => {
      const oscillator = audio!.createOscillator(),
        gain = audio!.createGain(),
        time = audio!.currentTime + index * 0.13;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.045, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      oscillator.connect(gain);
      gain.connect(audio!.destination);
      oscillator.start(time);
      oscillator.stop(time + 0.22);
    });
  } catch {
    /* Written feedback remains available when audio is unavailable. */
  }
}
function readInitial() {
  try {
    return {
      save: decodeSave(localStorage.getItem(STORAGE_KEY)),
      memory: false,
    };
  } catch {
    return { save: freshSave(), memory: true };
  }
}

export default function App() {
  const initial = useRef(readInitial());
  const [save, setSave] = useState<Save>(initial.current.save ?? freshSave());
  const stateRef = useRef(save);
  const [memory, setMemory] = useState(initial.current.memory);
  const [corrupt, setCorrupt] = useState(!initial.current.save);
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  const [toast, setToast] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmExit, setConfirmExit] = useState<string | null>(null);
  const [puzzleDirty, setPuzzleDirty] = useState(false);
  const stageId = (Number(route.match(/^\/stage\/([123])$/)?.[1]) ||
    null) as StageId | null;
  const session = stageId ? save.sessions[stageId] : undefined;
  function commit(next: Save) {
    if (corrupt) return;
    stateRef.current = next;
    setSave(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setMemory(true);
    }
  }
  function navigate(path: string) {
    if (route === "/puzzle" && puzzleDirty && path !== route)
      setConfirmExit(path);
    else location.hash = path;
  }
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = decodeSave(event.newValue);
      if (next) {
        stateRef.current = next;
        setSave(next);
        setToast("Progres diperbarui dari tab lain.");
      } else setCorrupt(true);
    };
    window.addEventListener("hashchange", update);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (
      ![
        "/",
        "/characters",
        "/stages",
        "/puzzle",
        "/about",
        "/complete",
      ].includes(route) &&
      !stageId
    )
      location.hash = "/";
    if (stageId) {
      if (!save.character) location.hash = "/characters";
      else if (!unlocked(save, stageId)) {
        setToast("Selesaikan tahap sebelumnya, ya!");
        location.hash = "/stages";
      } else if (!stateRef.current.sessions[stageId])
        commit(startStage(stateRef.current, stageId));
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }, [route, save.character]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (save.muted && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
  }, [save.muted]);
  function selectCharacter(character: Character) {
    commit({ ...stateRef.current, character });
    navigate("/stages");
  }
  function enterStage(id: StageId) {
    if (!save.character) {
      navigate("/characters");
      return;
    }
    if (!unlocked(save, id)) {
      setToast(`Selesaikan Tahap ${id - 1} terlebih dahulu, ya!`);
      return;
    }
    commit(startStage(stateRef.current, id, save.completed.includes(id)));
    navigate(`/stage/${id}`);
  }
  function answer(id: StageId, option: string) {
    const next = submitAnswer(stateRef.current, id, option);
    if (next === stateRef.current) return;
    commit(next);
    tone(
      next.sessions[id]!.status === "correct" ? "good" : "retry",
      next.muted,
    );
  }
  function nextQuestion(id: StageId) {
    const current = stateRef.current.sessions[id]!;
    if (
      current.status === "correct" &&
      current.index === QUESTIONS[id].length - 1
    )
      navigate(id === 3 ? "/" : "/stages");
    else commit(advance(stateRef.current, id));
  }
  function speak(text: string) {
    if (save.muted) {
      setToast("Aktifkan suara di beranda untuk mendengarkan petunjuk.");
      return;
    }
    if (!("speechSynthesis" in window)) {
      setToast("Suara belum didukung browser ini. Baca petunjuk tertulis, ya.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.85;
    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase().startsWith("id"));
    if (voice) utterance.voice = voice;
    utterance.onerror = () =>
      setToast("Petunjuk suara belum tersedia. Gunakan petunjuk tertulis, ya.");
    window.speechSynthesis.speak(utterance);
  }
  function reset() {
    const next = freshSave();
    stateRef.current = next;
    setSave(next);
    setCorrupt(false);
    setConfirmReset(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setMemory(true);
    }
    location.hash = "/";
  }
  const scene =
    route === "/"
      ? "home"
      : route === "/characters"
        ? "characters"
        : route === "/about"
          ? "about"
          : route === "/puzzle"
            ? "puzzle"
            : stageId === 3
              ? "reading"
              : stageId || route === "/complete"
                ? "map"
                : "stages";
  return (
    <div className="app-shell">
      <main className={`scene scene-${scene}`}>
        <Art
          name={
            scene === "home"
              ? "home-bg"
              : ["characters", "about"].includes(scene)
                ? "office-bg"
                : scene === "map"
                  ? "map-bg"
                  : "paper-bg"
          }
          className="scene-background"
          priority
        />
        {scene !== "home" && (
          <nav aria-label="Navigasi utama">
            <RoundButton
              icon="home"
              label="Kembali ke beranda"
              onClick={() => navigate("/")}
              className="home-control"
            />
          </nav>
        )}
        {route === "/" && (
          <>
            <h1 id="page-title" tabIndex={-1} className="home-logo">
              <Art name="logo" alt="PosiKids" priority />
            </h1>
            <Art
              name="hero"
              alt="Zaa, Zee, dan Mimi, kurir cilik PosiKids"
              className="home-characters"
              priority
            />
            <nav className="home-menu" aria-label="Menu PosiKids">
              <button
                className="menu-button learn"
                onClick={() => navigate("/characters")}
              >
                <span className="menu-symbol">
                  <Icon name="bulb" />
                </span>
                Mulai Belajar
              </button>
              <button
                className="menu-button puzzle"
                onClick={() => navigate("/puzzle")}
              >
                <span className="menu-symbol">
                  <Icon name="puzzle" />
                </span>
                Puzzle
              </button>
              <button
                className="menu-button about"
                onClick={() => navigate("/about")}
              >
                <span className="menu-symbol">
                  <Icon name="book" />
                </span>
                Tentang
              </button>
            </nav>
            <button
              className="round-button sound-control"
              onClick={() =>
                commit({ ...stateRef.current, muted: !save.muted })
              }
              aria-label={save.muted ? "Aktifkan suara" : "Matikan suara"}
              aria-pressed={!save.muted}
            >
              <Icon name={save.muted ? "mute" : "sound"} />
            </button>
          </>
        )}
        {route === "/characters" && (
          <>
            <Sign hanging>Pilih Karakter</Sign>
            <div className="character-choices">
              {(["zaa", "zee"] as Character[]).map((character) => (
                <button
                  key={character}
                  className={`character-choice ${character}`}
                  onClick={() => selectCharacter(character)}
                  aria-label={`Pilih ${character === "zaa" ? "Zaa" : "Zee"}`}
                >
                  <svg
                    className="character-color"
                    viewBox="0 0 260 400"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M35 8C65-8 72 25 111 15S158-3 180 10 216 3 234 31 220 56 230 79 242 105 230 124 244 161 231 183 247 209 233 230 245 268 231 288 242 323 229 349 242 375 214 385 181 374 153 388 117 374 90 388 59 382 35 390 8 359 18 331 5 308 21 283 7 253 17 227 7 200 19 177 7 148 20 121 8 95 20 69 9 48 17 26Z" />
                  </svg>
                  <Art
                    name={`select-${character}`}
                    className="character-portrait"
                    priority
                  />
                  <span className="character-name">
                    {character}
                    <span aria-hidden="true">
                      {character === "zaa" ? "♀" : "♂"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <RoundButton
              icon="back"
              label="Kembali ke beranda"
              onClick={() => navigate("/")}
              className="back-control"
            />
          </>
        )}
        {route === "/stages" && (
          <>
            <Sign>Pilih Tahap</Sign>
            <p className="stage-subtitle">
              Yuk, Selesaikan setiap tahap untuk menjadi kurir hebat!
            </p>
            <Art
              name={save.character ?? "zaa"}
              alt={`Kurir ${save.character === "zee" ? "Zee" : "Zaa"}`}
              className="stage-character"
              priority
            />
            <div className="stage-choices">
              {STAGES.map((stage) => (
                <button
                  className={`stage-choice stage-${stage.id}`}
                  key={stage.id}
                  aria-disabled={!unlocked(save, stage.id)}
                  aria-label={`${stage.title}, ${save.completed.includes(stage.id) ? "selesai, main lagi" : unlocked(save, stage.id) ? "mulai" : "terkunci"}`}
                  onClick={() => enterStage(stage.id)}
                >
                  <StageArtwork id={stage.id} />
                  <span className="stage-title">
                    {stage.id === 1 ? (
                      <>
                        Bentuk
                        <br />
                        dan
                        <br />
                        Warna
                      </>
                    ) : (
                      stage.title
                    )}
                  </span>
                  <span
                    className={`stage-lock ${unlocked(save, stage.id) ? "unlocked" : ""}`}
                  >
                    <Icon
                      name={
                        save.completed.includes(stage.id)
                          ? "check"
                          : unlocked(save, stage.id)
                            ? "unlock"
                            : "lock"
                      }
                    />
                  </span>
                </button>
              ))}
            </div>
            <RoundButton
              icon="back"
              label="Pilih karakter lain"
              onClick={() => navigate("/characters")}
              className="back-control"
            />
          </>
        )}
        {stageId && session && save.character && unlocked(save, stageId) && (
          <>
            <GameScreen
              key={`${stageId}-${session.index}`}
              stageId={stageId}
              question={QUESTIONS[stageId][session.index]}
              character={save.character}
              status={session.status}
              onAnswer={(option) => answer(stageId, option)}
              onSpeak={speak}
            />
            <RoundButton
              icon="back"
              label="Kembali ke pilihan tahap"
              onClick={() => navigate("/stages")}
              className="back-control"
            />
            <RoundButton
              icon="next"
              label="Periksa jawaban untuk melanjutkan"
              className="next-control"
              onClick={() =>
                setToast("Pilih jawaban yang tepat untuk melanjutkan, ya!")
              }
            />
            {session.status !== "answer" && (
              <Feedback
                correct={session.status === "correct"}
                final={
                  stageId === 3 && session.index === QUESTIONS[3].length - 1
                }
                onContinue={() => nextQuestion(stageId)}
              />
            )}
          </>
        )}
        {route === "/puzzle" && (
          <Puzzle
            muted={save.muted}
            onBack={() => navigate("/")}
            onDirty={setPuzzleDirty}
            onComplete={() => {
              commit({ ...stateRef.current, puzzleCompleted: true });
              tone("good", save.muted);
            }}
          />
        )}
        {route === "/about" && (
          <About
            onBack={() => navigate("/")}
            onNext={() => navigate("/characters")}
            onReset={() => setConfirmReset(true)}
          />
        )}
        {route === "/complete" && (
          <>
            <h1 id="page-title" tabIndex={-1} className="sr-only">
              Petualangan PosiKids
            </h1>
            <Feedback
              correct
              final
              onContinue={() =>
                navigate(save.completed.length === 3 ? "/" : "/stages")
              }
            />
          </>
        )}
      </main>
      {memory && (
        <p className="storage-notice" role="status">
          Progres hanya tersimpan selama halaman ini terbuka.
        </p>
      )}
      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
      {confirmReset && (
        <Modal
          label="Hapus progres belajar"
          onClose={() => setConfirmReset(false)}
        >
          <h2>Mulai dari awal?</h2>
          <p>Karakter dan progres belajar pada browser ini akan dihapus.</p>
          <button className="text-button danger" onClick={reset}>
            Ya, hapus progres
          </button>
          <button
            className="text-button"
            onClick={() => setConfirmReset(false)}
          >
            Batal, lanjut bermain
          </button>
        </Modal>
      )}
      {corrupt && (
        <Modal label="Pulihkan progres" onClose={reset}>
          <h2>Progres tidak dapat dibaca</h2>
          <p>Mulai dari awal untuk membuka petualangan lagi.</p>
          <button className="text-button" onClick={reset}>
            Mulai dari awal
          </button>
        </Modal>
      )}
      {confirmExit && (
        <Modal label="Keluar dari puzzle" onClose={() => setConfirmExit(null)}>
          <h2>Tinggalkan puzzle dulu?</h2>
          <p>
            Susunan keping belum disimpan. Kamu akan mulai puzzle baru saat
            kembali.
          </p>
          <button
            className="text-button"
            onClick={() => {
              location.hash = confirmExit;
              setConfirmExit(null);
              setPuzzleDirty(false);
            }}
          >
            Ya, keluar
          </button>
          <button className="text-button" onClick={() => setConfirmExit(null)}>
            Lanjut menyusun
          </button>
        </Modal>
      )}
    </div>
  );
}
function StageArtwork({ id }: { id: StageId }) {
  return (
    <span className={`stage-art stage-art-${id}`} aria-hidden="true">
      {id === 1 ? (
        <>
          <Art name="blue-triangle" />
          <Art name="red-circle" />
          <Art name="yellow-star" />
        </>
      ) : id === 2 ? (
        <Art name="number-2" />
      ) : (
        <>
          <Art name="stage-amar" />
          <Art name="stage-rara" />
          <Art name="stage-mora" />
          <Art name="stage-letter" />
        </>
      )}
    </span>
  );
}
function EnvelopeScroll({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="envelope-scroll vertical">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      <span
        className="envelope-thumb"
        aria-hidden="true"
        style={{ "--scroll": `${value}%` } as CSSProperties}
      >
        <Icon name="mail" />
      </span>
    </div>
  );
}
function GameScreen({
  stageId,
  question,
  character,
  status,
  onAnswer,
  onSpeak,
}: {
  stageId: StageId;
  question: Question;
  character: Character;
  status: string;
  onAnswer: (option: string) => void;
  onSpeak: (text: string) => void;
}) {
  const [scroll, setScroll] = useState(0);
  const reading = stageId === 3,
    instruction = reading
      ? "Siapa penerima surat ini?"
      : `${question.prompt} ${question.emphasis}.`;
  return (
    <>
      <div className="stage-marker">
        <span>
          <Icon name="mail" />
          Tahap {["I", "II", "III"][stageId - 1]}
        </span>
        <strong>
          {stageId === 1 ? "Warna dan Bentuk" : STAGES[stageId - 1].title}
        </strong>
      </div>
      <div className="stage-progress" aria-label={`Tahap ${stageId} dari 3`}>
        {[1, 2, 3].map((id) => (
          <span key={id} className={id <= stageId ? "reached" : ""} />
        ))}
      </div>
      {reading ? (
        <>
          <Art name={character} className="reading-character" priority />
          <div className="letter-bubble">
            <div className="address-letter">
              <span>untuk</span>
              <strong>{question.emphasis}</strong>
              <span className="letter-stamp" />
              <i />
              <i />
            </div>
          </div>
          <header className="reading-instruction">
            <h1 id="page-title" tabIndex={-1}>
              {instruction}
            </h1>
            <p>Baca nama penerima disurat, lalu cari yang sesuai yaa!</p>
          </header>
          <div className="recipient-grid" aria-label="Pilih penerima surat">
            {question.options.map((option) => (
              <button
                key={option.id}
                className="recipient-option"
                onClick={() => onAnswer(option.id)}
                disabled={status !== "answer"}
                aria-label={option.label}
              >
                <Art name={option.asset} alt={option.label} />
              </button>
            ))}
          </div>
          <button
            className="read-instruction"
            onClick={() =>
              onSpeak(
                `${instruction} Surat untuk ${question.emphasis}. ${question.hint}`,
              )
            }
            aria-label="Dengarkan petunjuk"
          >
            <Icon name="mail" />
          </button>
        </>
      ) : (
        <>
          <div className="map-viewport">
            <div
              className={`map-houses houses-stage-${stageId}`}
              style={{ "--map-scroll": `${scroll * -0.2}%` } as CSSProperties}
            >
              {question.options.map((option, index) => (
                <button
                  key={option.id}
                  className={`house-option house-position-${index}`}
                  aria-label={option.label}
                  onClick={() => onAnswer(option.id)}
                  disabled={status !== "answer"}
                >
                  <Art name={option.asset} alt={option.label} />
                </button>
              ))}
            </div>
          </div>
          <div className="mission-dialogue">
            <Art name={`${character}-head`} className="mission-head" />
            <button
              className="mission-text"
              onClick={() => onSpeak(`${instruction} ${question.hint}`)}
              aria-label={`Dengarkan petunjuk: ${instruction}`}
            >
              <h1 id="page-title" tabIndex={-1}>
                {question.prompt} <em>{question.emphasis}.</em>
              </h1>
              <p>
                Perhatikan{" "}
                {stageId === 1 ? "warna dan bentuknya" : "angka pada rumah"}{" "}
                yaa!
              </p>
            </button>
          </div>
          <EnvelopeScroll
            value={scroll}
            onChange={setScroll}
            label="Geser peta rumah"
          />
        </>
      )}
    </>
  );
}
function Feedback({
  correct,
  final = false,
  onContinue,
}: {
  correct: boolean;
  final?: boolean;
  onContinue: () => void;
}) {
  return (
    <Modal
      label={correct ? "Jawaban Benar" : "Jawaban Salah"}
      onClose={onContinue}
      feedback
    >
      <Art
        name={correct ? "mimi-happy" : "mimi-retry"}
        alt={
          correct
            ? "Mimi merayakan jawaban benar"
            : "Mimi mengajak mencoba lagi"
        }
        className="feedback-cat"
        priority
      />
      <h2>{correct ? "Jawaban Benar" : "Jawaban Salah"}</h2>
      <button
        className={`feedback-action ${correct ? "correct" : "wrong"}`}
        onClick={onContinue}
      >
        {correct ? (final ? "Selesai" : "Lanjut") : "Coba Lagi"}
        <Icon name={correct ? (final ? "home" : "next") : "repeat"} />
      </button>
    </Modal>
  );
}
function About({
  onBack,
  onNext,
  onReset,
}: {
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const article = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  function scrollArticle(value: number) {
    const node = article.current;
    if (node)
      node.scrollTop = ((node.scrollHeight - node.clientHeight) * value) / 100;
    setScroll(value);
  }
  return (
    <>
      <Sign hanging>Tentang</Sign>
      <div className="about-friends">
        <Art name="family" alt="Zaa, Mimi, dan Zee" priority />
        <div className="friend-descriptions">
          <p>Kurir cilik yang ceria, penyuka hal baru, dan selalu semangat!</p>
          <p>Kucing kecil teman terbaik Zaa dan Zee</p>
          <p>
            Kurir cilik yang tenang, berpikir logis dan selalu siap membantu!
          </p>
        </div>
      </div>
      <section className="about-panel" aria-label="Tentang PosiKids">
        <div
          className="about-article"
          ref={article}
          tabIndex={0}
          onScroll={() => {
            const node = article.current!;
            setScroll(
              node.scrollHeight === node.clientHeight
                ? 0
                : (node.scrollTop / (node.scrollHeight - node.clientHeight)) *
                    100,
            );
          }}
        >
          <h2>Posikids itu apa?</h2>
          <p>
            PosiKids adalah game edukasi yang mengajak anak belajar sambil
            bermain sebagai kurir cilik. Di dalam permainan, anak akan diajak
            menyelesaikan berbagai misi sederhana seperti mengenal warna,
            bentuk, angka, dan membaca sambil mengantarkan surat atau paket ke
            tujuan yang tepat.
          </p>
          <h2>Tujuan PosiKids</h2>
          <p>
            PosiKids dirancang untuk membantu anak mengenal warna, bentuk,
            angka, dan membaca melalui aktivitas permainan yang menyenangkan.
            Setiap misi dibuat sederhana agar anak dapat belajar mengenali dan
            memahami konsep dasar sambil bermain.
          </p>
          <div className="parent-notes">
            <h2>Untuk pendamping</h2>
            <p>
              Progres belajar disimpan pada browser ini. Tidak ada batas waktu
              atau pengurangan nyawa. Susunan puzzle dimulai ulang saat halaman
              dimuat ulang.
            </p>
            <button className="text-button" onClick={onReset}>
              Hapus progres belajar
            </button>
          </div>
        </div>
        <EnvelopeScroll
          value={scroll}
          onChange={scrollArticle}
          label="Gulir informasi PosiKids"
        />
      </section>
      <RoundButton
        icon="back"
        label="Kembali ke beranda"
        onClick={onBack}
        className="back-control"
      />
      <RoundButton
        icon="next"
        label="Mulai memilih karakter"
        onClick={onNext}
        className="next-control"
      />
    </>
  );
}

const pieceStyle = (id: number): CSSProperties => ({
  backgroundImage: "url(/assets/puzzle.webp)",
  backgroundSize: "300% 300%",
  backgroundPosition: `${(id % 3) * 50}% ${Math.floor(id / 3) * 50}%`,
});
function Puzzle({
  muted,
  onBack,
  onDirty,
  onComplete,
}: {
  muted: boolean;
  onBack: () => void;
  onDirty: (dirty: boolean) => void;
  onComplete: () => void;
}) {
  const [order, setOrder] = useState(() => shuffledPieces()),
    [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null),
    [wrong, setWrong] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false),
    [confirm, setConfirm] = useState(false),
    [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("Pilih keping, lalu ketuk tempatnya.");
  const placedRef = useRef<number[]>([]),
    dragged = useRef<number | null>(null),
    wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      onDirty(false);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
    },
    [],
  );
  function place(piece: number | null, slot: number) {
    const outcome = placePiece(placedRef.current, piece, slot);
    if (outcome.result === "ignored") {
      if (piece === null) setMessage("Pilih satu keping terlebih dahulu, ya!");
      return;
    }
    if (outcome.result === "wrong") {
      setWrong(slot);
      setMessage("Belum pas. Coba tempat yang lain, ya!");
      tone("retry", muted);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrong(null), 700);
      return;
    }
    const next = outcome.placed;
    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    setMessage(`Pas! ${next.length} dari 9 keping terpasang.`);
    tone("piece", muted);
    onDirty(next.length < 9 && next.length > 0);
    if (next.length === 9) {
      setCompleted(true);
      onComplete();
    }
  }
  function restart() {
    placedRef.current = [];
    setPlaced([]);
    setOrder(shuffledPieces());
    setSelected(null);
    setCompleted(false);
    setConfirm(false);
    setWrong(null);
    setMessage("Pilih keping, lalu ketuk tempatnya.");
    onDirty(false);
  }
  return (
    <>
      <Sign hanging>Puzzle</Sign>
      <div className="puzzle-board-wrap">
        <div className="puzzle-board" aria-label="Papan puzzle, 9 tempat">
          {Array.from({ length: 9 }, (_, slot) => (
            <button
              key={slot}
              className={`puzzle-slot ${placed.includes(slot) ? "filled" : ""} ${wrong === slot ? "wrong" : ""} ${selected !== null ? "available" : ""}`}
              aria-label={
                placed.includes(slot)
                  ? `Tempat ${slot + 1}, keping terpasang`
                  : `Letakkan keping di tempat ${slot + 1}`
              }
              disabled={placed.includes(slot)}
              style={placed.includes(slot) ? pieceStyle(slot) : {}}
              onClick={() => place(selected, slot)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                place(dragged.current, slot);
                dragged.current = null;
              }}
            >
              {!placed.includes(slot) && <span>{slot + 1}</span>}
            </button>
          ))}
        </div>
        <p className="puzzle-message" role="status">
          {message}
        </p>
      </div>
      <section className="puzzle-tools" aria-label="Keping puzzle">
        <p className="puzzle-intro">
          Yuk, susun puzzle karakter
          <br />
          kurir hebat kesukaanmu!
        </p>
        <div className="puzzle-toolbar">
          <span>{placed.length} / 9 keping</span>
          <button onClick={() => setPreview(!preview)} aria-pressed={preview}>
            {preview ? "Tutup contoh" : "Lihat contoh"}
          </button>
        </div>
        {preview ? (
          <Art
            name="puzzle"
            alt="Contoh puzzle Zaa, Zee, dan Mimi"
            className="puzzle-preview"
          />
        ) : (
          <div className="pieces-grid">
            {order.map((piece) => (
              <div className="piece-holder" key={piece}>
                {!placed.includes(piece) && (
                  <button
                    className={`puzzle-piece ${selected === piece ? "selected" : ""}`}
                    draggable
                    style={pieceStyle(piece)}
                    aria-label={`Pilih keping ${piece + 1}`}
                    aria-pressed={selected === piece}
                    onClick={() => {
                      setSelected(piece);
                      setMessage(
                        "Keping dipilih. Sekarang pilih tempatnya di papan.",
                      );
                    }}
                    onDragStart={(event) => {
                      dragged.current = piece;
                      setSelected(piece);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(piece));
                    }}
                    onDragEnd={() => {
                      dragged.current = null;
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="puzzle-reset"
          onClick={() => (placed.length ? setConfirm(true) : restart())}
        >
          <Icon name="repeat" />
          Acak ulang
        </button>
      </section>
      <RoundButton
        icon="back"
        label="Kembali ke beranda"
        onClick={onBack}
        className="back-control"
      />
      <RoundButton
        icon="next"
        label="Petunjuk menyusun puzzle"
        onClick={() =>
          setMessage(
            "Seret keping ke papan, atau pilih keping lalu tempatnya. Gunakan Tab dan Enter untuk bermain dengan keyboard.",
          )
        }
        className="next-control"
      />
      {completed && (
        <Modal
          label="Puzzle selesai"
          onClose={() => setCompleted(false)}
          feedback
        >
          <Art name="mimi-happy" alt="Mimi senang" className="feedback-cat" />
          <h2>Puzzle selesai!</h2>
          <button className="feedback-action correct" onClick={onBack}>
            Selesai
            <Icon name="home" />
          </button>
          <button className="feedback-replay" onClick={restart}>
            Main lagi
          </button>
        </Modal>
      )}
      {confirm && (
        <Modal label="Acak ulang puzzle" onClose={() => setConfirm(false)}>
          <h2>Susun dari awal lagi?</h2>
          <p>Keping yang terpasang akan dikembalikan ke baki.</p>
          <button className="text-button" onClick={restart}>
            Ya, acak ulang
          </button>
          <button className="text-button" onClick={() => setConfirm(false)}>
            Lanjut menyusun
          </button>
        </Modal>
      )}
    </>
  );
}
