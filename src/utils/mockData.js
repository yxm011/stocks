export const stockSectors = [
  {
    name: 'Technology',
    change: 1.42,
    stocks: [
      { ticker: 'AAPL', name: 'Apple', price: 182.50, change: 1.20, marketCap: 2800 },
      { ticker: 'MSFT', name: 'Microsoft', price: 415.20, change: 1.85, marketCap: 3100 },
      { ticker: 'NVDA', name: 'NVIDIA', price: 890.10, change: 3.40, marketCap: 2200 },
      { ticker: 'GOOGL', name: 'Alphabet', price: 165.30, change: -0.40, marketCap: 2100 },
      { ticker: 'AMZN', name: 'Amazon', price: 178.90, change: 0.75, marketCap: 1850 },
      { ticker: 'META', name: 'Meta', price: 505.60, change: 2.10, marketCap: 1300 },
      { ticker: 'TSLA', name: 'Tesla', price: 175.40, change: -1.50, marketCap: 560 },
      { ticker: 'AVGO', name: 'Broadcom', price: 1320.00, change: 2.35, marketCap: 610 },
    ],
  },
  {
    name: 'Finance',
    change: -0.35,
    stocks: [
      { ticker: 'BRK.B', name: 'Berkshire', price: 412.00, change: 0.20, marketCap: 880 },
      { ticker: 'JPM', name: 'JPMorgan', price: 198.50, change: -0.60, marketCap: 570 },
      { ticker: 'V', name: 'Visa', price: 278.40, change: 0.45, marketCap: 620 },
      { ticker: 'MA', name: 'Mastercard', price: 470.10, change: 0.30, marketCap: 440 },
      { ticker: 'BAC', name: 'Bank of America', price: 37.20, change: -0.90, marketCap: 290 },
    ],
  },
  {
    name: 'Healthcare',
    change: 0.80,
    stocks: [
      { ticker: 'LLY', name: 'Eli Lilly', price: 740.00, change: 1.10, marketCap: 700 },
      { ticker: 'JNJ', name: 'Johnson & Johnson', price: 147.50, change: 0.25, marketCap: 355 },
      { ticker: 'UNH', name: 'UnitedHealth', price: 480.20, change: -0.80, marketCap: 445 },
      { ticker: 'PFE', name: 'Pfizer', price: 27.80, change: 0.15, marketCap: 155 },
    ],
  },
  {
    name: 'Energy',
    change: -1.20,
    stocks: [
      { ticker: 'XOM', name: 'Exxon', price: 115.40, change: -1.10, marketCap: 460 },
      { ticker: 'CVX', name: 'Chevron', price: 156.30, change: -0.90, marketCap: 290 },
    ],
  },
  {
    name: 'Consumer',
    change: 0.55,
    stocks: [
      { ticker: 'WMT', name: 'Walmart', price: 68.50, change: 0.40, marketCap: 555 },
      { ticker: 'PG', name: 'Procter & Gamble', price: 165.20, change: 0.20, marketCap: 390 },
      { ticker: 'KO', name: 'Coca-Cola', price: 61.40, change: 0.10, marketCap: 265 },
    ],
  },
];

export const preciousMetals = [
  { symbol: 'GOLD', name: 'Gold', price: 2435.80, change: 0.65, unit: 'USD/oz' },
  { symbol: 'SILVER', name: 'Silver', price: 28.45, change: -0.30, unit: 'USD/oz' },
  { symbol: 'PLATINUM', name: 'Platinum', price: 985.40, change: 0.15, unit: 'USD/oz' },
  { symbol: 'PALLADIUM', name: 'Palladium', price: 1055.20, change: -1.10, unit: 'USD/oz' },
  { symbol: 'COPPER', name: 'Copper', price: 4.32, change: 1.25, unit: 'USD/lb' },
];

export const stockExchanges = [
  { name: 'NYSE', region: 'USA', index: 'S&P 500', value: 5450.2, change: 0.65 },
  { name: 'NASDAQ', region: 'USA', index: 'NASDAQ 100', value: 19850.4, change: 1.20 },
  { name: 'LSE', region: 'UK', index: 'FTSE 100', value: 8205.1, change: -0.15 },
  { name: 'TSE', region: 'Japan', index: 'Nikkei 225', value: 36520.3, change: 0.40 },
  { name: 'SSE', region: 'China', index: 'SSE Composite', value: 2870.5, change: -0.80 },
  { name: 'BSE', region: 'India', index: 'Sensex 30', value: 78350.7, change: 1.05 },
];

export const forexPairs = [
  { pair: 'EUR/USD', rate: 1.0845, change: 0.12 },
  { pair: 'GBP/USD', rate: 1.2730, change: -0.08 },
  { pair: 'USD/JPY', rate: 149.85, change: 0.45 },
  { pair: 'USD/CHF', rate: 0.8825, change: -0.20 },
  { pair: 'AUD/USD', rate: 0.6590, change: 0.33 },
  { pair: 'USD/CAD', rate: 1.3520, change: -0.15 },
];

export const combinedWatchlist = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 68500, change: 2.50 },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 3650, change: 1.80 },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 168, change: -3.20 },
  { symbol: 'GOLD', name: 'Gold', type: 'commodity', price: 2435.80, change: 0.65 },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', price: 182.50, change: 1.20 },
  { symbol: 'EUR/USD', name: 'Euro', type: 'forex', price: 1.0845, change: 0.12 },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', price: 890.10, change: 3.40 },
  { symbol: 'OIL', name: 'Crude Oil', type: 'commodity', price: 78.40, change: -1.10 },
];

export function wiggle(value, percent = 0.5) {
  const delta = value * (percent / 100) * (Math.random() - 0.5) * 2;
  return value + delta;
}

export function randomize(base, volatility = 0.3) {
  return base * (1 + (Math.random() - 0.5) * volatility);
}
