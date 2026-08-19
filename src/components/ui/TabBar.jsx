/**
 * Reusable pill-style tab bar.
 * tabs: [{ key, label }]
 */
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex rounded-lg bg-slate-800/80 p-0.5 text-[11px] font-medium">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-md px-3 py-1 transition-all ${
            active === t.key
              ? 'bg-indigo-500/90 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
