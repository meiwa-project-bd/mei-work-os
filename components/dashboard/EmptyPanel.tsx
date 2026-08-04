export function EmptyPanel({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl bg-background px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    </div>
  );
}
