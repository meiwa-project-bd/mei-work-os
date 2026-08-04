export function MeiMascot({
  compact = false,
  message = "พร้อมช่วยเก็บหลักฐานงานให้แล้ว",
}: {
  compact?: boolean;
  message?: string;
}) {
  const sizeClass = compact ? "h-24 w-24" : "h-40 w-40";

  return (
    <div className="pointer-events-none flex items-center gap-4" aria-hidden="true">
      {!compact && (
        <div className="max-w-[14rem] rounded-lg border border-white/20 bg-[#10275f]/82 px-4 py-3 text-xs font-semibold leading-relaxed text-white shadow-xl backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#65e6d3]">
            Smart Companion
          </p>
          <p className="mt-1">{message}</p>
        </div>
      )}
      <svg
        viewBox="0 0 180 180"
        className={`mei-float shrink-0 drop-shadow-2xl ${sizeClass}`}
        role="img"
      >
        <defs>
          <linearGradient id="mei-ring" x1="18" y1="22" x2="158" y2="160">
            <stop stopColor="#5ee7df" />
            <stop offset="0.55" stopColor="#4f7cff" />
            <stop offset="1" stopColor="#ff5aa5" />
          </linearGradient>
          <linearGradient id="mei-face" x1="55" y1="42" x2="128" y2="138">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#eaf3ff" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r="74" fill="#123374" opacity="0.26" />
        <circle cx="90" cy="88" r="66" fill="url(#mei-ring)" />
        <circle cx="90" cy="88" r="56" fill="#f8fbff" />
        <path
          d="M50 87c8-32 26-49 52-47 22 2 36 19 41 47-13-17-27-25-43-25-19 0-36 8-50 25Z"
          fill="#dbeafe"
        />
        <path
          d="M54 93c9 24 22 36 40 36 17 0 30-12 39-36v16c0 24-17 43-39 43S54 133 54 109V93Z"
          fill="url(#mei-face)"
        />
        <path d="M45 83h-15l15-15v30Z" fill="#78a8ff" />
        <path d="M135 83h15l-15-15v30Z" fill="#78a8ff" />
        <circle cx="75" cy="94" r="5.5" fill="#102348" />
        <circle cx="106" cy="94" r="5.5" fill="#102348" />
        <path d="M80 112c7 7 15 7 22 0" fill="none" stroke="#ff5aa5" strokeLinecap="round" strokeWidth="5" />
        <circle cx="62" cy="106" r="8" fill="#ffb7d6" opacity="0.82" />
        <circle cx="119" cy="106" r="8" fill="#ffb7d6" opacity="0.82" />
        <path d="M80 145h22l-6 15H86l-6-15Z" fill="#f9c74f" />
        <circle className="mei-pulse" cx="136" cy="43" r="18" fill="#ff4d6d" />
        <path d="M136 32v15" stroke="#fff" strokeLinecap="round" strokeWidth="6" />
        <circle cx="136" cy="55" r="3" fill="#fff" />
        <path d="M39 52l6 11 12 3-11 6-3 12-6-11-12-3 11-6 3-12Z" fill="#ffd166" />
      </svg>
    </div>
  );
}
