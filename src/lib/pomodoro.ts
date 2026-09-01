export type Mode = "focus" | "short" | "long" | "mobile" | "daily";

export interface Settings {
  focus: number;
  short: number;
  long: number;
  mobile: number;
  daily: number;
  longEvery: number;
  goal: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  sound: boolean;
}

export interface LogEntry {
  id: string;
  mode: Mode;
  minutes: number;
  at: number;
  label?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  short: 5,
  long: 15,
  mobile: 30,
  daily: 20,
  longEvery: 4,
  goal: 6,
  autoStartBreaks: true,
  autoStartFocus: false,
  sound: true,
};

export const MODE_META: Record<
  Mode,
  { label: string; shortLabel: string; next: (s: Settings, focusCount: number) => Mode }
> = {
  focus: {
    label: "تمرکز",
    shortLabel: "تمرکز",
    next: (s, focusCount) => (focusCount % s.longEvery === 0 ? "long" : "short"),
  },
  short: {
    label: "استراحت کوتاه",
    shortLabel: "کوتاه",
    next: () => "focus",
  },
  long: {
    label: "استراحت طولانی",
    shortLabel: "طولانی",
    next: () => "focus",
  },
  mobile: {
    label: "موبایل‌گردی",
    shortLabel: "موبایل",
    next: () => "focus",
  },
  daily: {
    label: "کارهای روزانه",
    shortLabel: "روزانه",
    next: () => "focus",
  },
};

export const durationOf = (mode: Mode, s: Settings): number =>
  mode === "focus"
    ? s.focus
    : mode === "short"
      ? s.short
      : mode === "long"
        ? s.long
        : mode === "mobile"
          ? s.mobile
          : s.daily;

/* ---------------- persistence ---------------- */

const S_KEY = "goje:settings:v2";
const OLD_S_KEY = "goje:settings:v1";
const L_KEY = "goje:log:v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(S_KEY) ?? localStorage.getItem(OLD_S_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(S_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(L_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLog(log: LogEntry[]) {
  try {
    localStorage.setItem(L_KEY, JSON.stringify(log.slice(-1000)));
  } catch {
    /* ignore */
  }
}

/* ---------------- persian helpers ---------------- */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (v: number | string): string =>
  String(v).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

export function faClock(totalSeconds: number): { m: string; s: string } {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return { m: fa(String(m).padStart(2, "0")), s: fa(String(s).padStart(2, "0")) };
}

const timeFmt = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
export const faTimeOfDay = (epoch: number): string => timeFmt.format(new Date(epoch));

const dateFmt = new Intl.DateTimeFormat("fa-IR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
export const faTodayDate = (): string => dateFmt.format(new Date());

const weekdayFmt = new Intl.DateTimeFormat("fa-IR", { weekday: "short" });

/* ---------------- derived stats ---------------- */

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const isToday = (epoch: number): boolean =>
  dayKey(new Date(epoch)) === dayKey(new Date());

export const todayMinutesByMode = (log: LogEntry[], mode: Mode): number =>
  log
    .filter((e) => e.mode === mode && isToday(e.at))
    .reduce((sum, e) => sum + e.minutes, 0);

export const todayFocusCount = (log: LogEntry[]): number =>
  log.filter((e) => e.mode === "focus" && isToday(e.at)).length;

export const todayFocusMinutes = (log: LogEntry[]): number =>
  todayMinutesByMode(log, "focus");

export const todayEntries = (log: LogEntry[]): LogEntry[] =>
  log.filter((e) => isToday(e.at));

export function streakDays(log: LogEntry[]): number {
  const days = new Set(
    log.filter((e) => e.mode === "focus").map((e) => dayKey(new Date(e.at)))
  );
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function last7Days(log: LogEntry[]): { label: string; minutes: number; isToday: boolean }[] {
  const out: { label: string; minutes: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const minutes = log
      .filter((e) => e.mode === "focus" && dayKey(new Date(e.at)) === key)
      .reduce((s, e) => s + e.minutes, 0);
    out.push({ label: weekdayFmt.format(d), minutes, isToday: i === 0 });
  }
  return out;
}

/* ---------------- sound ---------------- */

let audioCtx: AudioContext | null = null;

export function playChime(kind: "focus" | "break") {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = audioCtx ?? new Ctor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const t = audioCtx.currentTime;
    const notes = kind === "focus" ? [523.25, 659.25, 783.99] : [659.25, 493.88];
    notes.forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch {
    /* audio unavailable */
  }
}

export const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
