export function EmptyPanel({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-pink-200 bg-pink-50/60 px-4 py-8 text-center">
      <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-primary/30" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    </div>
  );
}
