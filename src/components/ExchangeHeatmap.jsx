import { useState } from 'react';
import Panel from './ui/Panel';
import TabBar from './ui/TabBar';
import ChangeBadge from './ui/ChangeBadge';
import { formatNumber, signClass, sign } from '../hooks/useMarketData';

const TABS = [
  { key: 'crypto', label: 'Crypto' },
  { key: 'forex', label: 'Forex' },
  { key: 'stock', label: 'Indices' },
];

export default function ExchangeHeatmap({ exchanges, forex, cryptoExchanges }) {
  const [tab, setTab] = useState('crypto');

  return (
    <Panel
      title="Exchanges"
      subtitle="All markets"
      actions={<TabBar tabs={TABS} active={tab} onChange={setTab} />}
    >
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/30 p-2">
        {tab === 'crypto' && <CryptoExchanges data={cryptoExchanges} />}
        {tab === 'forex' && <ForexPairs data={forex} />}
        {tab === 'stock' && <StockExchanges data={exchanges} />}
      </div>
    </Panel>
  );
}

function CryptoExchanges({ data }) {
  if (!data || data.length === 0) {
    return <Empty>Crypto exchange data loading...</Empty>;
  }
  const max = Math.max(...data.map((d) => d.volumeUsd || 1));
  return (
    <div className="grid h-full grid-cols-3 gap-1.5 overflow-auto">
      {data.map((ex) => {
        const change = ex.change ?? 0;
        const intensity = Math.min(0.25 + Math.abs(change) / 4, 0.65);
        const bg = change > 0
          ? `rgba(34, 197, 94, ${intensity})`
          : `rgba(239, 68, 68, ${intensity})`;
        return (
          <div
            key={ex.name}
            style={{ backgroundColor: bg }}
            className="flex min-h-[3.5rem] flex-col justify-between rounded-lg p-2.5 transition-colors duration-500"
          >
            <span className="truncate text-[12px] font-semibold text-white">{ex.name}</span>
            <div className="flex items-end justify-between">
              <span className="text-[10px] tabular-nums text-white/60">{formatNumber(ex.volumeUsd, true)}</span>
              <span className={`text-[10px] font-medium tabular-nums ${signClass(change)}`}>
                {sign(change)}{formatNumber(change)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForexPairs({ data }) {
  return (
    <div className="grid h-full grid-cols-3 gap-2 overflow-auto">
      {data.map((fx) => {
        const change = fx.change ?? 0;
        const intensity = Math.min(0.12 + Math.abs(change) / 3, 0.3);
        const bg = change > 0
          ? `rgba(34, 197, 94, ${intensity})`
          : change < 0
            ? `rgba(239, 68, 68, ${intensity})`
            : 'rgba(71, 85, 105, 0.2)';
        return (
          <div
            key={fx.pair}
            style={{ backgroundColor: bg }}
            className="flex flex-col justify-between rounded-lg border border-slate-700/30 p-2.5 transition-colors duration-500"
          >
            <span className="text-[12px] font-semibold text-slate-200">{fx.pair}</span>
            <span className="text-base font-bold tabular-nums text-white">{formatNumber(fx.rate, false)}</span>
            <ChangeBadge value={change} size="sm" pill />
          </div>
        );
      })}
    </div>
  );
}

function StockExchanges({ data }) {
  const max = Math.max(...data.map((d) => d.value || 1));
  return (
    <div className="flex h-full flex-wrap content-start gap-1.5 overflow-auto">
      {data.map((ex) => {
        const change = ex.change ?? 0;
        const size = Math.max(25, (ex.value / max) * 100);
        const intensity = Math.min(0.25 + Math.abs(change) / 2, 0.6);
        const bg = change > 0
          ? `rgba(34, 197, 94, ${intensity})`
          : `rgba(239, 68, 68, ${intensity})`;
        return (
          <div
            key={ex.name}
            style={{ flex: `1 1 ${size}%`, minWidth: '100px', backgroundColor: bg }}
            className="flex flex-col justify-between rounded-lg p-2.5 transition-colors duration-500"
          >
            <span className="text-[12px] font-bold text-white">{ex.name}</span>
            <span className="text-[10px] text-white/50">{ex.index}</span>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-[11px] tabular-nums text-white/80">{formatNumber(ex.value)}</span>
              <ChangeBadge value={change} size="sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
