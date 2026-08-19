import { useEffect, useState } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { useClock } from './hooks/useClock';
import config from './config/dashboard';
import CommoditiesHeatmap from './components/CommoditiesHeatmap';
import GoldHeatmap from './components/GoldHeatmap';
import ExchangeHeatmap from './components/ExchangeHeatmap';
import CombinedWatchlist from './components/CombinedWatchlist';

const QUADRANT_MAP = {
  commodities: (data) => <CommoditiesHeatmap sectors={data.commodities} />,
  metals: (data) => <GoldHeatmap metals={data.metals} />,
  exchanges: (data) => (
    <ExchangeHeatmap
      exchanges={data.exchanges}
      forex={data.forex}
      cryptoExchanges={data.cryptoExchanges}
    />
  ),
  watchlist: (data) => <CombinedWatchlist items={data.watchlist} />,
};

export default function App() {
  const data = useMarketData();
  const now = useClock();

  if (data.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#060a13]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
          <p className="text-sm tracking-wide text-slate-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#060a13]">
      <TVFrame>
        {/* Header */}
        <header className="mb-4 flex flex-none items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/90 px-5 py-2.5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 8h2v13H9zM15 11h2v10h-2zM21 4h2v17h-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">{config.title}</h1>
              <p className="text-[11px] text-slate-500">{date}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                Positive
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                Negative
              </span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <span className="font-mono text-sm tabular-nums text-slate-300">{time}</span>
          </div>
        </header>

        {/* Quadrant grid */}
        <main className="grid flex-1 grid-cols-2 grid-rows-[1fr_1fr] gap-3 overflow-hidden">
          {config.quadrants.map((key) => (
            <div key={key} className="min-h-0 min-w-0 overflow-hidden">{QUADRANT_MAP[key]?.(data)}</div>
          ))}
        </main>

        {/* Ticker strip */}
        <TickerStrip data={data} />
      </TVFrame>
    </div>
  );
}

function TickerStrip({ data }) {
  const items = [
    ...(data.watchlist || []).map((w) => ({ label: w.symbol, change: w.change })),
    ...(data.metals || []).map((m) => ({ label: m.symbol, change: m.change })),
    ...(data.commodities || []).flatMap((s) => s.commodities.map((c) => ({ label: c.symbol, change: c.change }))),
  ];

  return (
    <div className="mt-3 flex flex-none items-center gap-6 overflow-hidden rounded-lg border border-slate-700/30 bg-slate-900/60 px-4 py-1.5 text-[11px]">
      <span className="shrink-0 font-medium text-slate-500">LIVE</span>
      <div className="flex animate-[scroll_30s_linear_infinite] gap-6">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-1.5">
            <span className="font-medium text-slate-300">{item.label}</span>
            <span className={item.change > 0 ? 'text-emerald-400' : item.change < 0 ? 'text-red-400' : 'text-slate-400'}>
              {item.change > 0 ? '+' : ''}{Number(item.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TVFrame({ children }) {
  const [scale, setScale] = useState(1);
  const { width: W, height: H } = config.frame;

  useEffect(() => {
    function resize() {
      setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [W, H]);

  return (
    <div
      className="relative origin-center overflow-hidden bg-[#060a13]"
      style={{ width: `${W}px`, height: `${H}px`, transform: `scale(${scale})` }}
    >
      <div className="flex h-full w-full flex-col p-5">{children}</div>
    </div>
  );
}
