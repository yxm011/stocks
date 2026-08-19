import Panel from './ui/Panel';
import ChangeBadge from './ui/ChangeBadge';
import MiniChart from './ui/MiniChart';
import { formatNumber } from '../hooks/useMarketData';

const TYPE_BADGE = {
  crypto: { label: 'CRYPTO', color: 'text-orange-400 bg-orange-500/15' },
  stock: { label: 'STOCK', color: 'text-blue-400 bg-blue-500/15' },
  commodity: { label: 'CMDTY', color: 'text-amber-400 bg-amber-500/15' },
  forex: { label: 'FOREX', color: 'text-emerald-400 bg-emerald-500/15' },
};

export default function CombinedWatchlist({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <Panel title="Watchlist" subtitle="Mixed assets">
      <div className="flex flex-1 flex-col gap-1 overflow-auto rounded-xl border border-slate-700/40 bg-slate-800/30 p-2">
        {/* Table header */}
        <div className="flex items-center px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          <span className="flex-1">Asset</span>
          <span className="w-16 text-center">Type</span>
          <span className="w-16 text-right">Price</span>
          <span className="w-16 text-right">Change</span>
          <span className="w-16 text-right">Trend</span>
        </div>

        {items.map((item) => {
          const change = item.change ?? 0;
          const badge = TYPE_BADGE[item.type] || { label: '-', color: 'text-slate-400 bg-slate-700' };
          const rowBg = change > 0
            ? 'hover:bg-emerald-500/8'
            : change < 0
              ? 'hover:bg-red-500/8'
              : 'hover:bg-slate-700/30';

          return (
            <div
              key={item.symbol + item.type}
              className={`flex items-center rounded-lg px-3 py-2 transition-colors ${rowBg}`}
            >
              {/* Symbol + name */}
              <div className="flex flex-1 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-700/60 text-[10px] font-bold text-white/70">
                  {item.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-200">{item.symbol}</p>
                  <p className="text-[10px] text-slate-500">{item.name}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex w-16 justify-center">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Price */}
              <span className="w-16 text-right text-[13px] font-semibold tabular-nums text-slate-100">
                ${formatNumber(item.price)}
              </span>

              {/* Change */}
              <div className="flex w-16 justify-end">
                <ChangeBadge value={change} size="sm" pill />
              </div>

              {/* Sparkline */}
              <div className="flex w-16 justify-end">
                <MiniChart value={item.price} positive={change > 0} width={48} height={18} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
