import { useRef, useEffect, useState } from 'react';

/**
 * Tiny sparkline chart generated from a rolling price buffer.
 * Renders an SVG path — no charting library needed.
 */
export default function MiniChart({ value, positive, width = 60, height = 24, className = '' }) {
  const [points, setPoints] = useState(() => {
    const pts = [];
    let v = value ?? 100;
    for (let i = 0; i < 20; i++) {
      v += (Math.random() - 0.48) * v * 0.005;
      pts.push(v);
    }
    return pts;
  });

  useEffect(() => {
    setPoints((prev) => {
      const next = [...prev.slice(1), value ?? prev[prev.length - 1]];
      return next;
    });
  }, [value]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const color = positive ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className={`shrink-0 ${className}`} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
