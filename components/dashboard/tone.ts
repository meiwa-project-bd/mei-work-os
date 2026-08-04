export type Tone = "primary" | "accent" | "success" | "warning";

export const TONE_CLASSES: Record<Tone, { chip: string; icon: string; bar: string }> = {
  primary: { chip: "bg-pink-100", icon: "text-primary", bar: "bg-primary" },
  accent: { chip: "bg-sky-100", icon: "text-accent", bar: "bg-accent" },
  success: { chip: "bg-teal-100", icon: "text-success", bar: "bg-success" },
  warning: { chip: "bg-amber-100", icon: "text-warning", bar: "bg-warning" },
};
