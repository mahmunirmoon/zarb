import type { Mode } from "../lib/pomodoro";
import { MODE_META, faClock } from "../lib/pomodoro";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "./Icons";

const MODES: Mode[] = ["focus", "short", "long", "mobile", "daily"];
const R = 152;
const C = 2 * Math.PI * R;

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  secondsLeft: number;
  totalSeconds: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  cycleDone: number;
  cycleLen: number;
  celebrate: boolean;
  nextLabel: string;
  dailyTask: string;
  onDailyTask: (task: string) => void;
}

const DAILY_TASKS = ["حمام", "سرویس بهداشتی", "غذا خوردن", "تلفن", "نظافت اتاق", "سایر"];

export default function TimerCard({
  mode,
  onMode,
  secondsLeft,
  totalSeconds,
  running,
  onToggle,
  onReset,
  onSkip,
  cycleDone,
  cycleLen,
  celebrate,
  nextLabel,
  dailyTask,
  onDailyTask,
}: Props) {
  const frac = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const { m, s } = faClock(secondsLeft);
  const isLongBreak = mode === "long";
  const isClassic = mode === "focus" || mode === "short" || mode === "long";
  const filledDots = isLongBreak ? cycleLen : cycleDone;

  return (
    <section
      className="fade-up relative flex flex-col items-center rounded-[28px] border border-[var(--card-edge)] bg-[var(--card)] px-5 pb-8 pt-6 shadow-[0_28px_70px_-32px_rgba(21,58,104,0.5)] backdrop-blur-sm transition-colors duration-700 sm:px-10"
      style={{ animationDelay: "80ms" }}
    >
      {/* five mode tabs */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-2 rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] p-2 sm:grid-cols-5">
        {MODES.map((mm) => (
          <button
            key={mm}
            onClick={() => onMode(mm)}
            className={`rounded-xl px-2 py-2.5 text-xs font-extrabold transition-all duration-300 sm:text-[13px] ${
              mm === mode
                ? "border border-[var(--accent)]/35 bg-[var(--accent-deep)] text-[var(--accent-strong)] shadow-sm"
                : "text-[var(--ink-dim)] hover:bg-white/35 hover:text-[var(--ink)]"
            }`}
          >
            {MODE_META[mm].label}
          </button>
        ))}
      </div>

      {mode === "daily" && (
        <div className="mt-4 w-full max-w-2xl rounded-2xl border border-[var(--card-edge)] bg-white/45 p-3">
          <div className="mb-2 text-xs font-extrabold text-[var(--ink-dim)]">نوع کار روزانه</div>
          <div className="flex flex-wrap gap-2">
            {DAILY_TASKS.map((task) => (
              <button
                key={task}
                onClick={() => onDailyTask(task)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                  dailyTask === task
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "border border-[var(--card-edge)] bg-white/60 text-[var(--ink-dim)]"
                }`}
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ring */}
      <div className={`relative mt-8 ${celebrate ? "ring-pop" : ""}`}>
        <div
          className={`absolute inset-6 rounded-full bg-[var(--accent-glow)] blur-3xl transition-opacity duration-1000 ${
            running ? "breathing" : "opacity-0"
          }`}
        />
        <svg viewBox="0 0 360 360" className="relative w-[300px] sm:w-[340px]" style={{ transform: "scaleX(-1)" }}>
          <g opacity="0.28">
            {Array.from({ length: 60 }, (_, i) => {
              const long = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1="180"
                  y1={long ? 14 : 17}
                  x2="180"
                  y2={long ? 26 : 23}
                  stroke="var(--ink-dim)"
                  strokeWidth={long ? 2.4 : 1.4}
                  strokeLinecap="round"
                  transform={`rotate(${i * 6} 180 180)`}
                />
              );
            })}
          </g>
          <circle cx="180" cy="180" r={R} stroke="var(--ring-track)" strokeWidth="14" fill="none" />
          <circle
            className="ring-progress"
            cx="180"
            cy="180"
            r={R}
            stroke="var(--accent)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
            transform="rotate(-90 180 180)"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            dir="ltr"
            className="font-display leading-none text-[var(--ink)] tabular-nums"
            style={{ fontSize: "clamp(64px, 17vw, 92px)", textShadow: "0 6px 40px var(--accent-glow)" }}
          >
            {m}
            <span className={running ? "colon-blink" : ""}>:</span>
            {s}
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--ink-dim)]">
            {MODE_META[mode].label}
            <span className="mx-2 opacity-40">•</span>
            <span className="text-[var(--accent-2)]">بعدی: {nextLabel}</span>
          </p>
        </div>
      </div>

      {isClassic && (
        <div className="mt-7 flex items-center gap-2.5" aria-label="پیشرفت چرخه">
          {Array.from({ length: cycleLen }, (_, i) => {
            const filled = i < filledDots;
            return (
              <span
                key={`${i}-${filled}`}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  filled ? "dot-pop w-6 bg-[var(--accent)]" : "w-2.5 bg-[var(--card-edge)]"
                }`}
              />
            );
          })}
          <span className="ms-2 text-xs text-[var(--ink-dim)]">
            {isLongBreak ? "چرخه کامل شد" : `جلسهٔ ${filledDots} از ${cycleLen}`}
          </span>
        </div>
      )}

      <div className="mt-8 flex w-full max-w-md items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={onReset}
          title="بازنشانی (R)"
          className="group flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] px-5 py-3.5 text-[var(--ink-dim)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:text-[var(--ink)]"
        >
          <ResetIcon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-180" />
          <span className="text-[11px] font-bold">از نو</span>
        </button>

        <button
          onClick={onToggle}
          className="flex min-w-[168px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--accent)] px-8 py-4 text-lg font-extrabold text-[var(--on-accent)] shadow-[0_16px_44px_-14px_var(--accent-glow)] transition-all duration-300 hover:bg-[var(--accent-strong)]"
        >
          {running ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
          {running ? "توقف" : secondsLeft < totalSeconds ? "ادامه" : "شروع"}
        </button>

        <button
          onClick={onSkip}
          title="رد کردن (S)"
          className="group flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] px-5 py-3.5 text-[var(--ink-dim)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:text-[var(--ink)]"
        >
          <SkipIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-[11px] font-bold">رد کردن</span>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-[var(--ink-dim)]">
        <span className={`relative flex h-2 w-2 ${running ? "" : "opacity-40"}`}>
          {running && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${running ? "bg-[var(--accent)]" : "bg-[var(--ink-dim)]"}`} />
        </span>
        {running
          ? mode === "focus"
            ? "در حال تمرکز — حواست رو جمع کن"
            : mode === "short"
              ? "استراحت کوتاه — یه نفس تازه کن"
              : mode === "long"
                ? "استراحت طولانی — زمان بازیابی"
                : mode === "mobile"
                  ? "موبایل‌گردی در حال شمارش است"
                  : `در حال ${dailyTask}`
          : "آمادهٔ شروع — هر وقت خواستی بزن بریم"}
      </div>
    </section>
  );
}
