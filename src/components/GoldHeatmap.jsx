import Panel from './ui/Panel';
import ChangeBadge from './ui/ChangeBadge';
import MiniChart from './ui/MiniChart';
import { formatNumber } from '../hooks/useMarketData';

export default function GoldHeatmap({ metals }) {
  if (!metals || metals.length === 0) return null;

  return (
    <Panel title="Precious Metals" subtitle="Spot prices">
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden">
        {metals.map((metal) => {
          const isGold = metal.symbol === 'GOLD';
          const change = metal.change ?? 0;
          return (
            <div
              key={metal.symbol}
              className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 transition-colors duration-500 ${
                isGold
                  ? 'col-span-2 border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent'
                  : 'border-slate-700/50 bg-slate-800/40'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${isGold ? 'text-base text-amber-300' : 'text-sm text-slate-200'}`}>
                    {metal.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{metal.unit}</p>
                </div>
                <ChangeBadge value={change} size={isGold ? 'lg' : 'md'} pill />
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <p className={`font-bold tabular-nums ${isGold ? 'text-3xl text-white' : 'text-xl text-slate-100'}`}>
                  ${formatNumber(metal.price)}
                </p>
                <MiniChart
                  value={metal.price}
                  positive={change > 0}
                  width={isGold ? 80 : 50}
                  height={isGold ? 28 : 20}
                  className="opacity-60"
                />
              </div>

              {/* Subtle glow on gold */}
              {isGold && (
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
