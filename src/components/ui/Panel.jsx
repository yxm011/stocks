/**
 * Reusable panel wrapper — every quadrant is wrapped in this.
 * Pass `title` and optional `subtitle` for a consistent header row.
 * Children fill the remaining space.
 */
export default function Panel({ title, subtitle, actions, children, className = '' }) {
  return (
    <section
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/75 p-4 shadow-[0_0_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md ${className}`}
    >
      {title && (
        <div className="mb-3 flex flex-none items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-wide text-slate-100">{title}</h2>
            {subtitle && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                {subtitle}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
