import type { Mode } from "../lib/pomodoro";
import { MODE_META, faClock } from "../lib/pomodoro";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "./Icons";

const MODES: Mode[] = ["focus", "short", "long"];
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
}

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
}: Props) {
  const frac = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const { m, s } = faClock(secondsLeft);
  const activeIndex = MODES.indexOf(mode);
  const isLongBreak = mode === "long";
  const filledDots = isLongBreak ? cycleLen : cycleDone;

  return (
    <section
      className="fade-up relative flex flex-col items-center rounded-[28px] border border-[var(--card-edge)] bg-[var(--card)] px-5 pb-8 pt-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] transition-colors duration-700 sm:px-10"
      style={{ animationDelay: "80ms" }}
    >
      {/* mode tabs */}
      <div className="relative grid w-full max-w-md grid-cols-3 rounded-full border border-[var(--card-edge)] bg-[var(--bg)] p-1.5">
        <span
          className="absolute bottom-1.5 top-1.5 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-deep)] transition-all duration-300 ease-out"
          style={{
            insetInlineStart: `calc(${activeIndex} * (100% - 12px) / 3 + 6px)`,
            width: "calc((100% - 12px) / 3)",
          }}
        />
        {MODES.map((mm) => (
          <button
            key={mm}
            onClick={() => onMode(mm)}
            className={`relative z-10 rounded-full px-2 py-2 text-xs font-bold transition-colors duration-300 sm:text-sm ${
              mm === mode ? "text-[var(--accent-strong)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
            }`}
          >
            {MODE_META[mm].label}
          </button>
        ))}
      </div>

      {/* ring */}
      <div className={`relative mt-8 ${celebrate ? "ring-pop" : ""}`}>
        <div
          className={`absolute inset-6 rounded-full bg-[var(--accent-glow)] blur-3xl transition-opacity duration-1000 ${
            running ? "breathing" : "opacity-0"
          }`}
        />
        <svg viewBox="0 0 360 360" className="relative w-[300px] sm:w-[340px]" style={{ transform: "scaleX(-1)" }}>
          {/* tick marks */}
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
          <circle cx="180" cy="180" r={R} stroke="var(--bg)" strokeWidth="14" fill="none" />
          <circle cx="180" cy="180" r={R} stroke="var(--card-edge)" strokeWidth="14" fill="none" />
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

        {/* center readout */}
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

      {/* cycle dots */}
      <div className="mt-7 flex items-center gap-2.5" aria-label="پیشرفت چرخه">
        {Array.from({ length: cycleLen }, (_, i) => {
          const filled = i < filledDots;
          return (
            <span
              key={`${i}-${filled}`}
              className={`h-2.5 rounded-full transition-all duration-500 ${filled ? "dot-pop w-6 bg-[var(--accent)]" : "w-2.5 bg-[var(--card-edge)]"}`}
            />
          );
        })}
        <span className="ms-2 text-xs text-[var(--ink-dim)]">
          {isLongBreak ? "چرخه کامل شد" : `${"جلسهٔ"} ${filledDots} از ${cycleLen}`}
        </span>
      </div>

      {/* controls */}
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
          className="flex min-w-[168px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--accent)] px-8 py-4 text-lg font-extrabold text-[var(--bg)] shadow-[0_16px_50px_-12px_var(--accent-glow)] transition-all duration-300 hover:bg-[var(--accent-strong)] hover:shadow-[0_20px_60px_-10px_var(--accent-glow)]"
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

      {/* status line */}
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
            : "در حال استراحت — یه نفس عمیق بکش"
          : "آمادهٔ شروع — هر وقت خواستی بزن بریم"}
      </div>
    </section>
  );
}
