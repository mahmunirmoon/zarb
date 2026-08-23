import { useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry, Mode, Settings } from "./lib/pomodoro";
import {
  MODE_META,
  durationOf,
  faClock,
  faTodayDate,
  isToday,
  last7Days,
  loadLog,
  loadSettings,
  newId,
  playChime,
  saveLog,
  saveSettings,
  streakDays,
  todayEntries,
  todayFocusCount,
  todayFocusMinutes,
} from "./lib/pomodoro";
import TimerCard from "./components/TimerCard";
import { HistoryPanel, SettingsPanel, StatsPanel } from "./components/SidePanels";
import { KeyboardIcon, MuteIcon, TomatoMark, VolumeIcon } from "./components/Icons";

interface Toast {
  id: number;
  text: string;
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [log, setLog] = useState<LogEntry[]>(loadLog);
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => loadSettings().focus * 60);
  const [totalSeconds, setTotalSeconds] = useState(() => loadSettings().focus * 60);
  const [celebrate, setCelebrate] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const endAtRef = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const stateRef = useRef({ settings, log, mode });
  stateRef.current = { settings, log, mode };

  /* persistence */
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveLog(log), [log]);

  /* mode theming on <html> */
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  /* document title */
  useEffect(() => {
    const { m, s } = faClock(secondsLeft);
    document.title = running
      ? `${m}:${s} • ${MODE_META[mode].label} — گوجه`
      : "گوجه — تایمر پومودورو";
  }, [secondsLeft, running, mode]);

  const pushToast = (text: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  const switchTo = (next: Mode, autoStart: boolean) => {
    const dur = durationOf(next, stateRef.current.settings) * 60;
    setMode(next);
    setSecondsLeft(dur);
    setTotalSeconds(dur);
    if (autoStart) {
      endAtRef.current = Date.now() + dur * 1000;
      setRunning(true);
    } else {
      endAtRef.current = null;
      setRunning(false);
    }
  };

  const complete = () => {
    const { settings: s, log: l, mode: m } = stateRef.current;
    setRunning(false);
    endAtRef.current = null;
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 900);
    if (s.sound) playChime(m === "focus" ? "focus" : "break");

    if (m === "focus") {
      const entry: LogEntry = { id: newId(), mode: "focus", minutes: s.focus, at: Date.now() };
      setLog((prev) => [...prev, entry]);
      const count = todayFocusCount(l) + 1;
      const next: Mode = count % s.longEvery === 0 ? "long" : "short";
      pushToast(
        count === s.goal
          ? "هدف امروز کامل شد — دمت گرم!"
          : next === "long"
            ? "یه دور کامل تمام شد — استراحت طولانی می‌چسبه"
            : "جلسهٔ تمرکز ثبت شد — وقت استراحته"
      );
      switchTo(next, s.autoStartBreaks);
    } else {
      pushToast("استراحت تمام شد — بریم سراغ تمرکز");
      switchTo("focus", s.autoStartFocus);
    }
  };

  /* tick loop — timestamp based, no drift */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round(((endAtRef.current ?? Date.now()) - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        complete();
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const toggle = () => {
    if (running) {
      const left = Math.max(0, Math.round(((endAtRef.current ?? Date.now()) - Date.now()) / 1000));
      setSecondsLeft(left);
      setRunning(false);
      endAtRef.current = null;
    } else {
      const base = secondsLeft > 0 ? secondsLeft : totalSeconds;
      setSecondsLeft(base);
      endAtRef.current = Date.now() + base * 1000;
      setRunning(true);
    }
  };

  const reset = () => {
    const dur = durationOf(stateRef.current.mode, stateRef.current.settings) * 60;
    setRunning(false);
    endAtRef.current = null;
    setSecondsLeft(dur);
    setTotalSeconds(dur);
  };

  const skip = () => {
    const { settings: s, log: l, mode: m } = stateRef.current;
    const next: Mode = m === "focus" ? MODE_META.focus.next(s, todayFocusCount(l)) : "focus";
    switchTo(next, false);
  };

  const changeMode = (m: Mode) => {
    if (m === mode) return;
    switchTo(m, false);
  };

  const stepSetting = (key: "focus" | "short" | "long" | "longEvery" | "goal", delta: number) => {
    const bounds: Record<typeof key, [number, number]> = {
      focus: [1, 90],
      short: [1, 30],
      long: [5, 60],
      longEvery: [2, 8],
      goal: [1, 12],
    };
    const [min, max] = bounds[key];
    const value = Math.min(max, Math.max(min, settings[key] + delta));
    if (value === settings[key]) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (!running && key === mode) {
      setSecondsLeft(value * 60);
      setTotalSeconds(value * 60);
    }
  };

  const setBool = (key: "autoStartBreaks" | "autoStartFocus" | "sound", value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "sound" && value) playChime("break");
  };

  const clearToday = () => {
    setLog((prev) => prev.filter((e) => !isToday(e.at)));
    pushToast("آمار امروز پاک شد");
  };

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "KeyR") reset();
      else if (e.code === "KeyS") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, secondsLeft, totalSeconds, mode]);

  /* derived stats */
  const focusCount = useMemo(() => todayFocusCount(log), [log]);
  const focusMinutes = useMemo(() => todayFocusMinutes(log), [log]);
  const streak = useMemo(() => streakDays(log), [log]);
  const week = useMemo(() => last7Days(log), [log]);
  const entries = useMemo(() => todayEntries(log), [log]);
  const cycleDone = focusCount % settings.longEvery;
  const nextLabel =
    mode === "focus"
      ? MODE_META[(focusCount + 1) % settings.longEvery === 0 ? "long" : "short"].label
      : MODE_META.focus.label;

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-[var(--ink)] transition-colors duration-700">
      {/* ambient background */}
      <div
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={{
          backgroundImage:
            "radial-gradient(1100px 700px at 85% -10%, var(--accent-deep), transparent 62%), radial-gradient(900px 650px at 8% 112%, var(--accent-deep), transparent 60%)",
        }}
      />
      <div className="orb orb-a -top-44 -left-44 h-[480px] w-[480px] bg-[var(--accent)] opacity-[0.13]" />
      <div className="orb orb-b -bottom-44 -right-36 h-[440px] w-[440px] bg-[var(--accent-2)] opacity-[0.10]" />
      <div className="noise-layer" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {/* header */}
        <header className="fade-up mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-deep)] text-[var(--accent)] transition-colors duration-700">
              <TomatoMark className="h-8 w-8" />
            </span>
            <div>
              <h1 className="font-display text-[28px] leading-none text-[var(--ink)]">گوجه</h1>
              <p className="mt-1 text-xs font-semibold text-[var(--ink-dim)]">تایمر پومودورو برای تمرکز عمیق</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-[var(--ink-dim)] sm:block">{faTodayDate()}</span>
            <button
              onClick={() => setBool("sound", !settings.sound)}
              title={settings.sound ? "قطع صدا" : "پخش صدا"}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-edge)] bg-[var(--card)] text-[var(--ink-dim)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
            >
              {settings.sound ? <VolumeIcon className="h-5 w-5" /> : <MuteIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* main grid */}
        <main className="grid items-start gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <TimerCard
            mode={mode}
            onMode={changeMode}
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            running={running}
            onToggle={toggle}
            onReset={reset}
            onSkip={skip}
            cycleDone={cycleDone}
            cycleLen={settings.longEvery}
            celebrate={celebrate}
            nextLabel={nextLabel}
          />

          <div className="space-y-6">
            <StatsPanel
              focusCount={focusCount}
              focusMinutes={focusMinutes}
              goal={settings.goal}
              streak={streak}
              week={week}
            />
            <SettingsPanel settings={settings} onStep={stepSetting} onBool={setBool} />
            <HistoryPanel entries={entries} onClear={clearToday} />
          </div>
        </main>

        {/* footer */}
        <footer className="fade-up mt-10 flex flex-col items-center justify-between gap-3 text-[11px] text-[var(--ink-dim)] sm:flex-row" style={{ animationDelay: "400ms" }}>
          <span className="flex items-center gap-2">
            <KeyboardIcon className="h-4 w-4" />
            <span dir="ltr" className="tabular-nums">Space</span> شروع/توقف
            <span className="opacity-40">•</span>
            <span dir="ltr">R</span> از نو
            <span className="opacity-40">•</span>
            <span dir="ltr">S</span> رد کردن
          </span>
          <span>داده‌ها روی همین مرورگر ذخیره می‌شوند — بدون حساب، بدون ابر</span>
        </footer>
      </div>

      {/* toast */}
      {toast && (
        <div key={toast.id} className="toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--card)] px-5 py-3 text-sm font-bold text-[var(--ink)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
