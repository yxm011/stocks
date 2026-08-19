import Panel from './ui/Panel';
import ChangeBadge from './ui/ChangeBadge';
import { formatNumber, sign } from '../hooks/useMarketData';

export default function StockHeatmap({ sectors }) {
  if (!sectors || sectors.length === 0) return null;

  const totalCap = sectors.reduce(
    (sum, s) => sum + s.stocks.reduce((c, st) => c + (st.marketCap || 1), 0),
    0
  );

  return (
    <Panel title="Stocks" subtitle="Sector weighted">
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
        {sectors.map((sector) => {
          const sectorCap = sector.stocks.reduce((c, st) => c + (st.marketCap || 1), 0);
          const weight = sectorCap / totalCap;
          return (
            <div key={sector.name} style={{ flex: `${weight} 1 0%` }} className="flex min-h-0 flex-col">
              <div className="mb-0.5 flex flex-none items-center justify-between px-0.5">
                <span className="text-[12px] font-medium text-slate-400">{sector.name}</span>
                <ChangeBadge value={sector.change} size="sm" pill />
              </div>
              <div className="flex flex-1 gap-1 overflow-hidden">
                {sector.stocks.map((stock) => (
                  <Tile key={stock.ticker} stock={stock} sectorCap={sectorCap} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Tile({ stock, sectorCap }) {
  const weight = (stock.marketCap || 1) / sectorCap;
  const change = stock.change ?? 0;
  const intensity = Math.min(0.25 + Math.abs(change) / 5, 0.7);
  const bg = change > 0
    ? `rgba(34, 197, 94, ${intensity})`
    : change < 0
      ? `rgba(239, 68, 68, ${intensity})`
      : 'rgba(71, 85, 105, 0.35)';

  return (
    <div
      style={{ flex: `${weight} 1 0%`, backgroundColor: bg }}
      className="group relative flex min-w-0 flex-col items-start justify-center overflow-hidden rounded-md px-2 py-1 transition-colors duration-500 hover:brightness-125"
    >
      <span className="truncate text-[13px] font-bold leading-tight text-white/90">{stock.ticker}</span>
      <span className="text-[10px] tabular-nums text-white/60">
        {sign(change)}{formatNumber(change)}%
      </span>
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">
        <span className="font-semibold">{stock.name}</span>
        <span className="ml-2 tabular-nums text-slate-300">${formatNumber(stock.price)}</span>
      </div>
    </div>
  );
}
