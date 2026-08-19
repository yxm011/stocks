/**
 * Dashboard configuration — edit this file to customize
 * the layout, data sources, refresh rate, and appearance.
 */

export const config = {
  title: 'Market Heatmap',
  refreshInterval: 30000, // ms between API refreshes (30s to respect rate limits)

  // Which quadrants to show and in what order.
  // Options: 'commodities' | 'metals' | 'exchanges' | 'watchlist'
  quadrants: ['commodities', 'metals', 'exchanges', 'watchlist'],

  // TV frame dimensions (CSS pixels, scaled to fit viewport)
  frame: { width: 1920, height: 1080 },

  // Color palette — override any key to re-theme
  colors: {
    bg: '#060a13',
    panelBg: 'rgba(15, 23, 42, 0.75)',
    panelBorder: 'rgba(51, 65, 85, 0.5)',
    headerBg: 'rgba(15, 23, 42, 0.9)',
    up: '#22c55e',
    upBg: 'rgba(34, 197, 94, <alpha>)',
    down: '#ef4444',
    downBg: 'rgba(239, 68, 68, <alpha>)',
    neutral: '#64748b',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    textDim: '#64748b',
    accent: '#6366f1',
    gold: '#fbbf24',
  },
};

export default config;
