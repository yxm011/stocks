import { formatNumber, sign } from '../../hooks/useMarketData';

/**
 * Styled change-percentage badge with up/down coloring.
 * size: 'sm' | 'md' | 'lg'
 */
const sizes = {
  sm: 'text-[11px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export default function ChangeBadge({ value, size = 'md', pill = false }) {
  const v = value ?? 0;
  const positive = v > 0;
  const negative = v < 0;
  const bg = positive
    ? 'bg-emerald-500/15 text-emerald-400'
    : negative
      ? 'bg-red-500/15 text-red-400'
      : 'bg-slate-700/50 text-slate-400';
  const radius = pill ? 'rounded-full' : 'rounded';

  return (
    <span className={`inline-flex items-center font-medium tabular-nums ${bg} ${radius} ${sizes[size]}`}>
      {positive && '+'}{formatNumber(v)}%
    </span>
  );
}
