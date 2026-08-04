export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mei-card mb-6 rounded-lg p-5">
      <div className="h-1 w-14 rounded-full bg-primary/40" />
      <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
    </div>
  );
}
