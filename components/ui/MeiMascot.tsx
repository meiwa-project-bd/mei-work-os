export function MeiMascot({
  compact = false,
  message = "วันนี้ค่อย ๆ เก็บแต้มงานไปด้วยกันนะ",
}: {
  compact?: boolean;
  message?: string;
}) {
  return (
    <div
      className={`pointer-events-none flex items-end gap-3 ${compact ? "scale-90" : ""}`}
      aria-hidden="true"
    >
      <div className="hidden max-w-[13rem] rounded-lg border border-white/70 bg-white/82 px-3 py-2 text-xs font-medium leading-relaxed text-foreground shadow-sm backdrop-blur sm:block">
        {message}
      </div>
      <div className="mei-float relative h-20 w-16">
        <div className="absolute left-2 top-5 h-11 w-12 rounded-[18px] border border-pink-200 bg-gradient-to-b from-white to-pink-100 shadow-lg shadow-pink-200/40" />
        <div className="absolute left-3.5 top-2 h-9 w-9 rounded-full border border-pink-200 bg-gradient-to-br from-pink-100 via-white to-sky-100 shadow-md" />
        <div className="absolute left-5 top-6 h-1.5 w-1.5 rounded-full bg-foreground" />
        <div className="absolute right-5 top-6 h-1.5 w-1.5 rounded-full bg-foreground" />
        <div className="absolute left-7 top-9 h-1.5 w-3 rounded-b-full border-b border-pink-500" />
        <div className="absolute left-1 top-12 h-5 w-3 rotate-[-18deg] rounded-full bg-pink-200" />
        <div className="absolute right-1 top-12 h-5 w-3 rotate-[18deg] rounded-full bg-sky-200" />
        <div className="absolute left-2.5 bottom-1 h-3 w-4 rounded-full bg-primary/80" />
        <div className="absolute right-2.5 bottom-1 h-3 w-4 rounded-full bg-accent/80" />
        <div className="mei-pulse absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-success" />
        <div className="mei-pulse absolute left-0 top-3 h-1.5 w-1.5 rounded-full bg-warning" />
      </div>
    </div>
  );
}
