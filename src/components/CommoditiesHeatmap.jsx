import Panel from './ui/Panel';
import ChangeBadge from './ui/ChangeBadge';
import { formatNumber, sign } from '../hooks/useMarketData';

export default function CommoditiesHeatmap({ sectors }) {
  if (!sectors || sectors.length === 0) return null;

  return (
    <Panel title="Commodities" subtitle="Futures">
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        {sectors.map((sector) => (
          <div key={sector.name} className="flex min-h-0 flex-1 flex-col">
            <div className="mb-1 flex flex-none items-center justify-between px-0.5">
              <span className="text-[12px] font-medium text-slate-400">{sector.name}</span>
              <ChangeBadge value={sector.change} size="sm" pill />
            </div>
            <div className="flex flex-1 gap-1.5 overflow-hidden">
              {sector.commodities.map((item) => (
                <Tile key={item.symbol} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Tile({ item }) {
  const change = item.change ?? 0;
  const intensity = Math.min(0.25 + Math.abs(change) / 5, 0.7);
  const bg = change > 0
    ? `rgba(34, 197, 94, ${intensity})`
    : change < 0
      ? `rgba(239, 68, 68, ${intensity})`
      : 'rgba(71, 85, 105, 0.35)';

  return (
    <div
      style={{ flex: '1 1 0%', backgroundColor: bg }}
      className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2.5 transition-colors duration-500 hover:brightness-125"
    >
      <div>
        <span className="block truncate text-[13px] font-bold leading-tight text-white/90">{item.symbol}</span>
        <span className="block truncate text-[10px] text-white/50">{item.name}</span>
      </div>
      <div className="mt-1">
        <span className="block text-sm font-semibold tabular-nums text-white">
          ${formatNumber(item.price)}
        </span>
        <span className="text-[10px] tabular-nums text-white/60">
          {sign(change)}{formatNumber(change)}%
        </span>
      </div>
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">
        <span className="font-semibold">{item.name}</span>
        <span className="ml-2 text-slate-400">{item.unit}</span>
      </div>
    </div>
  );
}
