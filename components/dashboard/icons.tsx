type IconProps = { className?: string };

const base = "h-5 w-5";

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="12" cy="12" r="8.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChecklistIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M9 6h9M9 12h9M9 18h9M4.5 6l.75.75L6.75 5M4.5 12l.75.75 1.5-1.5M4.5 18l.75.75 1.5-1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <rect x="3.75" y="5.25" width="16.5" height="15" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.75 9.75h16.5M8 3v3.5M16 3v3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="12" cy="12" r="8.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 12.25l2.25 2.25 4.75-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M12 9v3.75m-8.34 3.85c-.77 1.34.2 3 1.74 3h13.2c1.54 0 2.51-1.66 1.74-3L13.74 5.4c-.77-1.34-2.71-1.34-3.48 0L2.66 16.6ZM12 16.5h.008v.008H12V16.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FolderIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M3.75 7.5A1.5 1.5 0 015.25 6h4.19a1.5 1.5 0 011.06.44l1.31 1.31a1.5 1.5 0 001.06.44h5.88a1.5 1.5 0 011.5 1.5v8.06a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V7.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
