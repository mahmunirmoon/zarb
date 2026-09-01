import { useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry, Mode, Settings } from "./lib/pomodoro";
import {
  MODE_META,
  durationOf,
  fa,
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
  todayMinutesByMode,
} from "./lib/pomodoro";
import TimerCard from "./components/TimerCard";
import { HistoryPanel, SettingsPanel, StatsPanel } from "./components/SidePanels";
import { CloudShape, KeyboardIcon, MuteIcon, SunMark, VolumeIcon } from "./components/Icons";

const CLOUDS = [
  { id: 1, top: "3%", width: 360, blur: 22, opacity: 0.8, duration: 170, delay: -30 },
  { id: 2, top: "12%", width: 250, blur: 14, opacity: 0.65, duration: 120, delay: -80 },
  { id: 3, top: "24%", width: 430, blur: 26, opacity: 0.7, duration: 200, delay: -140 },
  { id: 4, top: "40%", width: 300, blur: 18, opacity: 0.5, duration: 150, delay: -55 },
  { id: 5, top: "57%", width: 390, blur: 24, opacity: 0.45, duration: 185, delay: -100 },
  { id: 6, top: "71%", width: 260, blur: 15, opacity: 0.5, duration: 130, delay: -20 },
  { id: 7, top: "84%", width: 460, blur: 28, opacity: 0.4, duration: 210, delay: -160 },
];

interface Toast {
  id: number;
  text: string;
}

const minText = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${fa(m)} دقیقه`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${fa(h)} ساعت و ${fa(rest)} دقیقه` : `${fa(h)} ساعت`;
};

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [log, setLog] = useState<LogEntry[]>(loadLog);
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => loadSettings().focus * 60);
  const [totalSeconds, setTotalSeconds] = useState(() => loadSettings().focus * 60);
  const [celebrate, setCelebrate] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [dailyTask, setDailyTask] = useState("حمام");

  const endAtRef = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const stateRef = useRef({ settings, log, mode, dailyTask });
  stateRef.current = { settings, log, mode, dailyTask };

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveLog(log), [log]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  useEffect(() => {
    const { m, s } = faClock(secondsLeft);
    document.title = running
      ? `${m}:${s} • ${MODE_META[mode].label} — اوقات طلایی من`
      : "اوقات طلایی من — تمرکز کن، استراحت کن، دوباره شروع کن.";
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
    const { settings: s, log: l, mode: m, dailyTask: task } = stateRef.current;
    setRunning(false);
    endAtRef.current = null;
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 900);
    if (s.sound) playChime(m === "focus" ? "focus" : "break");

    const entry: LogEntry = {
      id: newId(),
      mode: m,
      minutes: durationOf(m, s),
      at: Date.now(),
      ...(m === "daily" ? { label: task } : {}),
    };
    setLog((prev) => [...prev, entry]);

    if (m === "focus") {
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
    } else if (m === "short" || m === "long") {
      pushToast("استراحت ثبت شد — بریم سراغ تمرکز");
      switchTo("focus", s.autoStartFocus);
    } else if (m === "mobile") {
      pushToast("زمان موبایل‌گردی ثبت شد");
      switchTo("focus", false);
    } else {
      pushToast(`زمان «${task}» ثبت شد`);
      switchTo("focus", false);
    }
  };

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
    const next: Mode =
      m === "focus" ? MODE_META.focus.next(s, todayFocusCount(l)) : "focus";
    switchTo(next, false);
  };

  const changeMode = (m: Mode) => {
    if (m === mode) return;
    switchTo(m, false);
  };

  const stepSetting = (
    key: "focus" | "short" | "long" | "longEvery" | "goal",
    delta: number
  ) => {
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

  const focusCount = useMemo(() => todayFocusCount(log), [log]);
  const focusMinutes = useMemo(() => todayFocusMinutes(log), [log]);
  const shortMinutes = useMemo(() => todayMinutesByMode(log, "short"), [log]);
  const longMinutes = useMemo(() => todayMinutesByMode(log, "long"), [log]);
  const mobileMinutes = useMemo(() => todayMinutesByMode(log, "mobile"), [log]);
  const dailyMinutes = useMemo(() => todayMinutesByMode(log, "daily"), [log]);
  const streak = useMemo(() => streakDays(log), [log]);
  const week = useMemo(() => last7Days(log), [log]);
  const entries = useMemo(() => todayEntries(log), [log]);
  const cycleDone = focusCount % settings.longEvery;
  const nextLabel =
    mode === "focus"
      ? MODE_META[(focusCount + 1) % settings.longEvery === 0 ? "long" : "short"].label
      : MODE_META.focus.label;

  const totalTracked = focusMinutes + shortMinutes + longMinutes + mobileMinutes + dailyMinutes;
  const remaining = Math.max(0, 1440 - totalTracked);
  const focusGoal = settings.goal * settings.focus;
  const focusGoalPct = Math.min(100, focusGoal > 0 ? (focusMinutes / focusGoal) * 100 : 0);
  const mobileGoal = 120;
  const mobileGoalPct = Math.min(100, (mobileMinutes / mobileGoal) * 100);

  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    entries
      .filter((e) => e.mode === "daily")
      .forEach((e) => map.set(e.label ?? "سایر", (map.get(e.label ?? "سایر") ?? 0) + e.minutes));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const parts = [
    { label: "تمرکز", value: focusMinutes, color: "#e08a00" },
    { label: "استراحت کوتاه", value: shortMinutes, color: "#2f8a57" },
    { label: "استراحت طولانی", value: longMinutes, color: "#b24a5e" },
    { label: "موبایل‌گردی", value: mobileMinutes, color: "#6f5bd3" },
    { label: "کارهای روزانه", value: dailyMinutes, color: "#d77a28" },
    { label: "ثبت‌نشده", value: remaining, color: "#dbe4ec" },
  ];
  let cursor = 0;
  const gradientStops = parts
    .map((p) => {
      const start = (cursor / 1440) * 360;
      cursor += p.value;
      const end = (cursor / 1440) * 360;
      return `${p.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-[var(--ink)] transition-colors duration-700">
      <div className="sky-layer" aria-hidden />
      <div className="sun-halo" aria-hidden />
      <div className="sun-mascot" aria-hidden>
        <SunMark className="spin-slow h-full w-full" />
      </div>
      <div className="cloud-layer" aria-hidden>
        {CLOUDS.map((c) => (
          <span
            key={c.id}
            className="cloud"
            style={{ top: c.top, width: c.width, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
          >
            <CloudShape className="w-full" style={{ opacity: c.opacity, filter: `blur(${c.blur}px)` }} />
          </span>
        ))}
      </div>
      <div className="noise-layer" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <header className="fade-up mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-deep)] shadow-[0_12px_35px_-12px_var(--accent-glow)]">
              <SunMark className="h-10 w-10" />
            </span>
            <div>
              <h1 className="font-display text-[32px] leading-none text-[var(--ink)] sm:text-[36px]">
                اوقات طلایی من
              </h1>
              <p className="mt-1.5 text-sm font-extrabold text-[var(--ink)]">
                تمرکز کن، استراحت کن، دوباره شروع کن.
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--ink-dim)]">
                چرخه تمرکز و مدیریت زمان با زهرا
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-[var(--ink-dim)] sm:block">{faTodayDate()}</span>
            <button
              onClick={() => setBool("sound", !settings.sound)}
              title={settings.sound ? "قطع صدا" : "پخش صدا"}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-edge)] bg-[var(--card)] text-[var(--ink-dim)]"
            >
              {settings.sound ? <VolumeIcon className="h-5 w-5" /> : <MuteIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>

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
            dailyTask={dailyTask}
            onDailyTask={setDailyTask}
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

        {/* 24 hour report */}
        <section className="fade-up mt-6 rounded-3xl border border-[var(--card-edge)] bg-[var(--card)] p-5 shadow-[0_24px_60px_-30px_rgba(21,58,104,0.45)] backdrop-blur-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[var(--ink-dim)]">گزارش روزانه</div>
              <h2 className="font-display mt-1 text-3xl text-[var(--ink)]">۲۴ ساعت امروز من</h2>
            </div>
            <div className="text-sm font-bold text-[var(--ink-dim)]">
              زمان ثبت‌شده: <b className="text-[var(--ink)]">{minText(totalTracked)}</b>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center justify-center">
              <div
                className="grid h-52 w-52 place-items-center rounded-full"
                style={{ background: `conic-gradient(${gradientStops})` }}
              >
                <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--card)] text-center shadow-inner">
                  <div>
                    <div className="text-xs font-bold text-[var(--ink-dim)]">باقی‌مانده</div>
                    <div className="font-display mt-1 text-xl text-[var(--ink)]">{minText(remaining)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[var(--ink-dim)]">نمودار ترکیب ۲۴ ساعت</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReportCard title="تمرکز" value={focusMinutes} color="#e08a00" />
              <ReportCard title="استراحت کوتاه" value={shortMinutes} color="#2f8a57" />
              <ReportCard title="استراحت طولانی" value={longMinutes} color="#b24a5e" />
              <ReportCard title="موبایل‌گردی" value={mobileMinutes} color="#6f5bd3" />
              <ReportCard title="کارهای روزانه" value={dailyMinutes} color="#d77a28" />
              <ReportCard title="ثبت‌نشده" value={remaining} color="#8394a6" />
            </div>
          </div>

          {/* goals */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <GoalBar
              title="هدف تمرکز امروز"
              detail={`${minText(focusMinutes)} از ${minText(focusGoal)}`}
              pct={focusGoalPct}
              good={focusMinutes >= focusGoal}
            />
            <GoalBar
              title="کنترل موبایل‌گردی"
              detail={`${minText(mobileMinutes)} از سقف پیشنهادی ۲ ساعت`}
              pct={mobileGoalPct}
              good={mobileMinutes <= mobileGoal}
            />
          </div>

          {dailyBreakdown.length > 0 && (
            <div className="mt-6 rounded-2xl border border-[var(--card-edge)] bg-white/45 p-4">
              <h3 className="font-display text-xl text-[var(--ink)]">ریز کارهای روزانه</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {dailyBreakdown.map(([label, minutes]) => (
                  <span key={label} className="rounded-xl border border-[var(--card-edge)] bg-white/65 px-3 py-2 text-xs font-bold text-[var(--ink-dim)]">
                    {label}: <b className="text-[var(--ink)]">{minText(minutes)}</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 text-xs font-semibold leading-6 text-[var(--ink-dim)]">
            نکته: موبایل‌گردی فقط زمانی ثبت می‌شود که تایمر «موبایل‌گردی» را در همین برنامه اجرا کنی؛
            مرورگر به Screen Time کل گوشی دسترسی مستقیم ندارد.
          </p>
        </section>

        {/* about */}
        <section className="fade-up relative mt-6 overflow-hidden rounded-3xl border border-[var(--accent)]/25 bg-[var(--card)] p-6 shadow-[0_24px_60px_-30px_rgba(21,58,104,0.45)] backdrop-blur-sm sm:p-7">
          <h2 className="font-display text-[22px] leading-none text-[var(--accent)]">درباره ما</h2>
          <p className="mt-3 text-sm font-bold leading-8 text-[var(--ink)]">
            💗 این اولین برنامه <span className="text-[var(--accent)]">زهرا ۱۱ ساله از دبی</span> است که در کلاس
            <span className="text-[var(--accent)]"> خانم دکتر ماه منیر آقایی </span>
            ساخته شده است.
            <br />
            شماره تماس استاد:{" "}
            <a href="tel:00971551544988" dir="ltr" className="font-extrabold text-[var(--accent)] underline underline-offset-4">
              00971551544988
            </a>
          </p>
        </section>

        <footer className="fade-up mt-10 flex flex-col items-center justify-between gap-3 text-[11px] text-[var(--ink-dim)] sm:flex-row">
          <span className="flex items-center gap-2">
            <KeyboardIcon className="h-4 w-4" />
            <span dir="ltr">Space</span> شروع/توقف
            <span className="opacity-40">•</span>
            <span dir="ltr">R</span> از نو
            <span className="opacity-40">•</span>
            <span dir="ltr">S</span> رد کردن
          </span>
          <span>داده‌ها روی همین مرورگر ذخیره می‌شوند — بدون حساب، بدون ابر</span>
        </footer>
      </div>

      {toast && (
        <div key={toast.id} className="toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-2xl border border-[var(--accent)]/35 bg-[var(--card)] px-5 py-3 text-sm font-bold text-[var(--ink)] shadow-xl">
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-edge)] bg-white/55 p-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        <span className="text-xs font-extrabold text-[var(--ink-dim)]">{title}</span>
      </div>
      <div className="font-display mt-2 text-2xl text-[var(--ink)]">{minText(value)}</div>
    </div>
  );
}

function GoalBar({
  title,
  detail,
  pct,
  good,
}: {
  title: string;
  detail: string;
  pct: number;
  good: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--card-edge)] bg-white/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-[var(--ink)]">{title}</span>
        <span className={`text-xs font-bold ${good ? "text-emerald-700" : "text-amber-700"}`}>
          {good ? "خوب پیش رفتی" : "هنوز جا داری"}
        </span>
      </div>
      <div className="mt-2 text-xs font-semibold text-[var(--ink-dim)]">{detail}</div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/5">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
