export type Tone = "primary" | "accent" | "success" | "warning";

export const TONE_CLASSES: Record<Tone, { chip: string; icon: string; bar: string }> = {
  primary: { chip: "bg-primary/10", icon: "text-primary", bar: "bg-primary" },
  accent: { chip: "bg-accent/10", icon: "text-accent", bar: "bg-accent" },
  success: { chip: "bg-success/10", icon: "text-success", bar: "bg-success" },
  warning: { chip: "bg-warning/10", icon: "text-warning", bar: "bg-warning" },
};
