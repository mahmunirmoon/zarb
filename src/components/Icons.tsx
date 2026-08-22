interface IconProps {
  className?: string;
}

const base = (className?: string) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

/* media icons are mirrored for RTL reading direction */

export const PlayIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M16 5.5v13a1 1 0 0 1-1.53.85l-10-6.5a1 1 0 0 1 0-1.7l10-6.5A1 1 0 0 1 16 5.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const PauseIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="13.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="6.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const ResetIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 12a9 9 0 1 0 2.6-6.3" />
    <path d="M3 4v5h5" />
  </svg>
);

export const SkipIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M18 5 8.5 12 18 19V5Z" fill="currentColor" stroke="none" />
    <line x1="6" y1="5" x2="6" y2="19" />
  </svg>
);

export const VolumeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 6a9 9 0 0 1 0 12" />
  </svg>
);

export const MuteIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

export const FlameIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 22c4.4 0 7-2.8 7-6.5 0-2.6-1.4-4.6-2.8-6.1-.5 1-1.2 1.8-2.2 2.1.3-2.8-1-6-3.6-7.5.2 2.4-.7 4.3-2.2 5.9C6.7 11.5 5 13.3 5 15.7 5 19.3 7.6 22 12 22Z" />
    <path d="M12 22c1.9 0 3-1.4 3-3 0-1.4-.9-2.3-1.7-3.2-.5.6-1 .9-1.6 1-.6-.1-1.1-.4-1.6-1-.8.9-1.1 1.8-1.1 3.2 0 1.6 1.1 3 3 3Z" />
  </svg>
);

export const TargetIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const ClockIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 1.8" />
  </svg>
);

export const SlidersIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <circle cx="9" cy="6" r="2" fill="var(--card)" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="15" cy="12" r="2" fill="var(--card)" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="7" cy="18" r="2" fill="var(--card)" />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4.5 12.5 10 18 19.5 7" />
  </svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.8h5.2a2 2 0 0 0 2-1.8L17.5 7" />
    <line x1="10" y1="11" x2="10" y2="16.5" />
    <line x1="14" y1="11" x2="14" y2="16.5" />
  </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </svg>
);

export const KeyboardIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6.5 10h.01M10.2 10h.01M13.9 10h.01M17.6 10h.01M6.5 14h.01M17.6 14h.01M9.5 14h5" />
  </svg>
);

export const TomatoMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <path
      d="M12 8.6c-4.9 0-8.4 3.1-8.4 7 0 4.1 3.8 6.6 8.4 6.6s8.4-2.5 8.4-6.6c0-3.9-3.5-7-8.4-7Z"
      fill="currentColor"
    />
    <path
      d="M12 8.6c-2 0-3.4-.8-4.1-2.5 1.8.3 3-.2 4.1-1.9 1.1 1.7 2.3 2.2 4.1 1.9-.7 1.7-2.1 2.5-4.1 2.5Z"
      fill="currentColor"
      opacity=".5"
    />
    <path d="M12 8.8V6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
