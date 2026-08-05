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

export function CoinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m12 7 1.45 2.95 3.25.47-2.35 2.29.56 3.24L12 14.42l-2.91 1.53.56-3.24-2.35-2.29 3.25-.47L12 7Z" strokeLinejoin="round" />
    </svg>
  );
}

export function GemIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path d="m4 9 4-5h8l4 5-8 11L4 9Z" strokeLinejoin="round" />
      <path d="m8 4 4 16 4-16M4 9h16" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path d="M13.5 2.75 5.75 13h5l-.25 8.25L18.25 11h-5l.25-8.25Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ChestIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path d="M4 10V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V10M3 10h18v9H3v-9Z" strokeLinejoin="round" />
      <path d="M9.5 10h5v4h-5zM12 5v5" />
    </svg>
  );
}

export function MailIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
    </svg>
  );
}

export function GearIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.65a7 7 0 0 0-.6-1.43l.96-1.88-2.12-2.12-1.88.96A7 7 0 0 0 12 4.8L10.5 3h-3l-.65 2.38a7 7 0 0 0-1.43.6l-1.88-.96-2.12 2.12.96 1.88A7 7 0 0 0 1.8 10.5L0 12l1.8 1.5c.14.5.34.98.6 1.43l-.96 1.88 2.12 2.12 1.88-.96c.45.26.93.46 1.43.6L7.5 21h3l.65-2.38c.5-.14.98-.34 1.43-.6l1.88.96 2.12-2.12-.96-1.88c.26-.45.46-.93.6-1.43L19 13.5Z" transform="translate(2.5 0) scale(.8)" strokeLinejoin="round" />
    </svg>
  );
}
