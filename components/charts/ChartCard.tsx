type ChartCardProps = {
  title: string;
  description: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  empty?: boolean;
};

export function ChartCard({
  title,
  description,
  summary,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {summary && <div className="mb-3 flex flex-wrap gap-2">{summary}</div>}
      {children}
    </div>
  );
}
