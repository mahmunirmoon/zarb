import { useState } from "react";
import type { ReactNode } from "react";
import type { LogEntry, Mode, Settings } from "../lib/pomodoro";
import { fa, faTimeOfDay } from "../lib/pomodoro";
import {
  ChartIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  SlidersIcon,
  TargetIcon,
  TrashIcon,
} from "./Icons";

const MODE_COLORS: Record<Mode, string> = {
  focus: "#e08a00",
  short: "#2f8a57",
  long: "#b24a5e",
};
const MODE_LABELS: Record<Mode, string> = {
  focus: "تمرکز",
  short: "استراحت کوتاه",
  long: "استراحت طولانی",
};

function Panel({
  icon,
  title,
  aside,
  delay,
  children,
}: {
  icon: ReactNode;
  title: string;
  aside?: ReactNode;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section
      className="fade-up rounded-3xl border border-[var(--card-edge)] bg-[var(--card)] p-5 shadow-[0_24px_60px_-30px_rgba(21,58,104,0.45)] backdrop-blur-sm transition-colors duration-700 sm:p-6"
      style={{ animationDelay: delay }}
    >
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-deep)] text-[var(--accent)]">
          {icon}
        </span>
        <h2 className="text-base font-extrabold text-[var(--ink)]">{title}</h2>
        {aside && <div className="ms-auto">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/* ------------------------------ stats ------------------------------ */

export function StatsPanel({
  focusCount,
  focusMinutes,
  goal,
  streak,
  week,
}: {
  focusCount: number;
  focusMinutes: number;
  goal: number;
  streak: number;
  week: { label: string; minutes: number; isToday: boolean }[];
}) {
  const pct = Math.min(100, Math.round((focusCount / goal) * 100));
  const max = Math.max(...week.map((d) => d.minutes), 1);
  const goalMet = focusCount >= goal;

  return (
    <Panel icon={<TargetIcon className="h-5 w-5" />} title="آمار تمرکز امروز" delay="160ms">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] p-4 transition-colors duration-700">
          <div className="font-display text-[44px] leading-none text-[var(--accent)] tabular-nums">
            {fa(focusCount)}
          </div>
          <div className="mt-2 text-xs font-semibold text-[var(--ink-dim)]">
            پومودورو <span className="opacity-70">از هدف {fa(goal)}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] p-4 transition-colors duration-700">
          <div className="font-display text-[44px] leading-none text-[var(--accent-2)] tabular-nums">
            {fa(focusMinutes)}
          </div>
          <div className="mt-2 text-xs font-semibold text-[var(--ink-dim)]">دقیقهٔ تمرکز عمیق</div>
        </div>
      </div>

      {/* goal progress */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--ink-dim)]">پیشرفت هدف روزانه</span>
          <span className={`font-extrabold tabular-nums ${goalMet ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>
            {goalMet ? (
              <span className="inline-flex items-center gap-1">
                <CheckIcon className="h-3.5 w-3.5" /> کامل شد!
              </span>
            ) : (
              `${fa(pct)}٪`
            )}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--bg)]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${goalMet ? "goal-shimmer" : "bg-[var(--accent)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* streak + week */}
      <div className="mt-5 flex items-stretch gap-3">
        <div className="flex w-[104px] shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] p-3 text-center transition-colors duration-700">
          <FlameIcon className={`h-5 w-5 ${streak > 0 ? "text-[var(--accent-2)]" : "text-[var(--ink-dim)]"}`} />
          <div className="mt-1 font-display text-2xl leading-none text-[var(--ink)] tabular-nums">{fa(streak)}</div>
          <div className="mt-1 text-[10px] font-semibold leading-tight text-[var(--ink-dim)]">
            روز پیاپی
            <br />
            با تمرکز
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] p-3 transition-colors duration-700">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-[var(--ink-dim)]">
            <ChartIcon className="h-3 w-3" /> ۷ روز اخیر
          </div>
          <div className="flex h-14 items-end gap-1.5">
            {week.map((d, i) => (
              <div key={i} className="group flex min-w-0 flex-1 flex-col items-center gap-1" title={`${d.minutes} دقیقه`}>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-full transition-all duration-700 ${
                      d.isToday ? "bg-[var(--accent)]" : "bg-[var(--ink-dim)]/30 group-hover:bg-[var(--ink-dim)]/50"
                    }`}
                    style={{ height: d.minutes > 0 ? `${Math.max(14, (d.minutes / max) * 100)}%` : "3px" }}
                  />
                </div>
                <span className={`text-[9px] font-semibold ${d.isToday ? "text-[var(--accent)]" : "text-[var(--ink-dim)]/70"}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------ settings ------------------------------ */

type NumKey = "focus" | "short" | "long" | "longEvery" | "goal";
type BoolKey = "autoStartBreaks" | "autoStartFocus" | "sound";

const NUM_ROWS: { key: NumKey; label: string; unit: string; min: number; max: number }[] = [
  { key: "focus", label: "مدت تمرکز", unit: "دقیقه", min: 1, max: 90 },
  { key: "short", label: "استراحت کوتاه", unit: "دقیقه", min: 1, max: 30 },
  { key: "long", label: "استراحت طولانی", unit: "دقیقه", min: 5, max: 60 },
  { key: "longEvery", label: "استراحت طولانی بعد از", unit: "جلسه", min: 2, max: 8 },
  { key: "goal", label: "هدف روزانه", unit: "پومودورو", min: 1, max: 12 },
];

const BOOL_ROWS: { key: BoolKey; label: string; hint: string }[] = [
  { key: "autoStartBreaks", label: "شروع خودکار استراحت", hint: "بلافاصله بعد از پایان تمرکز" },
  { key: "autoStartFocus", label: "شروع خودکار تمرکز", hint: "بلافاصله بعد از پایان استراحت" },
  { key: "sound", label: "صدای پایان جلسه", hint: "زنگ کوتاه هنگام اتمام تایمر" },
];

export function SettingsPanel({
  settings,
  onStep,
  onBool,
}: {
  settings: Settings;
  onStep: (key: NumKey, delta: number) => void;
  onBool: (key: BoolKey, value: boolean) => void;
}) {
  return (
    <Panel icon={<SlidersIcon className="h-5 w-5" />} title="مدت‌های سفارشی" delay="240ms">
      <div className="space-y-2">
        {NUM_ROWS.map((row) => {
          const value = settings[row.key];
          const atMin = value <= row.min;
          const atMax = value >= row.max;
          return (
            <div
              key={row.key}
              className="flex items-center justify-between rounded-2xl border border-[var(--card-edge)] bg-[var(--bg)] px-4 py-2.5 transition-colors duration-700"
            >
              <span className="text-sm font-bold text-[var(--ink)]">{row.label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStep(row.key, -1)}
                  disabled={atMin}
                  aria-label={`کاهش ${row.label}`}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--card-edge)] text-lg font-bold text-[var(--ink-dim)] transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-25"
                >
                  −
                </button>
                <span className="w-16 text-center font-display text-xl leading-none text-[var(--accent)] tabular-nums">
                  {fa(value)}
                  <span className="ms-1 text-[10px] font-sans font-semibold text-[var(--ink-dim)]">{row.unit}</span>
                </span>
                <button
                  onClick={() => onStep(row.key, +1)}
                  disabled={atMax}
                  aria-label={`افزایش ${row.label}`}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--card-edge)] text-lg font-bold text-[var(--ink-dim)] transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-25"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5">
        {BOOL_ROWS.map((row) => {
          const on = settings[row.key];
          return (
            <button
              key={row.key}
              onClick={() => onBool(row.key, !on)}
              className="flex w-full items-center justify-between rounded-2xl px-1 py-1 text-start transition-colors hover:bg-[var(--accent-deep)]/40"
            >
              <span>
                <span className="block text-sm font-bold text-[var(--ink)]">{row.label}</span>
                <span className="block text-[11px] text-[var(--ink-dim)]">{row.hint}</span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                  on ? "bg-[var(--accent)]" : "bg-[var(--card-edge)]"
                }`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-[var(--ink)] shadow transition-all duration-300"
                  style={{ insetInlineStart: on ? "calc(100% - 22px)" : "2px" }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

/* ------------------------------ history ------------------------------ */

export function HistoryPanel({
  entries,
  onClear,
}: {
  entries: LogEntry[];
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const list = [...entries].reverse();

  return (
    <Panel
      icon={<ClockIcon className="h-5 w-5" />}
      title="گزارش امروز"
      delay="320ms"
      aside={
        entries.length > 0 &&
        (confirming ? (
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--ink-dim)]">مطمئنی؟</span>
            <button
              onClick={() => {
                onClear();
                setConfirming(false);
              }}
              className="rounded-lg bg-[var(--accent)] px-2.5 py-1 font-bold text-[var(--bg)] transition-colors hover:bg-[var(--accent-strong)]"
            >
              بله
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-[var(--card-edge)] px-2.5 py-1 font-bold text-[var(--ink-dim)] hover:text-[var(--ink)]"
            >
              نه
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--card-edge)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--ink-dim)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            <TrashIcon className="h-3.5 w-3.5" /> پاک کردن
          </button>
        ))
      }
    >
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--card-edge)] px-4 py-6 text-center text-sm text-[var(--ink-dim)]">
          هنوز جلسه‌ای ثبت نشده — اولین تمرکز رو شروع کن!
        </p>
      ) : (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto pe-1">
          {list.map((e) => (
            <li
              key={e.id}
              className="fade-up flex items-center gap-3 rounded-xl border border-[var(--card-edge)]/60 bg-[var(--bg)] px-3.5 py-2.5 transition-colors duration-700"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: MODE_COLORS[e.mode] }} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">
                {MODE_LABELS[e.mode]}
                <span className="ms-1.5 text-xs font-medium text-[var(--ink-dim)]">{fa(e.minutes)} دقیقه</span>
              </span>
              <span className="text-xs font-semibold text-[var(--ink-dim)] tabular-nums">{faTimeOfDay(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
