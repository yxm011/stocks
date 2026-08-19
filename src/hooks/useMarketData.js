import { useEffect, useState, useRef, useCallback } from 'react';

// --- API endpoints ---
const YAHOO_CHART = '/api/yahoo/v8/finance/chart';
const COINGECKO_COINS =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h';
const COINGECKO_EXCHANGES = 'https://api.coingecko.com/api/v3/exchanges?per_page=15&page=1';
const FOREX_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const METALS_SPOT_API = 'https://api.gold-api.com/price';

// --- Refresh intervals ---
const METALS_INTERVAL = 1000;  // 1 second — lightweight single-field JSON
const STOCKS_INTERVAL = 10000; // 10 seconds — Yahoo Finance
const CRYPTO_INTERVAL = 15000; // 15 seconds — CoinGecko rate limit
const FOREX_INTERVAL = 60000;  // 60 seconds — exchangerate-api daily rates

// --- Ticker definitions ---
const STOCK_SECTORS = [
  { name: 'Technology', tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO'] },
  { name: 'Finance', tickers: ['BRK-B', 'JPM', 'V', 'MA', 'BAC'] },
  { name: 'Healthcare', tickers: ['LLY', 'JNJ', 'UNH', 'PFE'] },
  { name: 'Energy', tickers: ['XOM', 'CVX', 'COP'] },
  { name: 'Consumer', tickers: ['WMT', 'PG', 'KO', 'COST'] },
];

const METAL_SYMBOLS = [
  { api: 'XAU', yahoo: 'GC=F', symbol: 'GOLD', name: 'Gold', unit: 'USD/oz' },
  { api: 'XAG', yahoo: 'SI=F', symbol: 'SILVER', name: 'Silver', unit: 'USD/oz' },
  { api: 'XPT', yahoo: 'PL=F', symbol: 'PLATINUM', name: 'Platinum', unit: 'USD/oz' },
  { api: 'XPD', yahoo: 'PA=F', symbol: 'PALLADIUM', name: 'Palladium', unit: 'USD/oz' },
  { api: 'HG', yahoo: 'HG=F', symbol: 'COPPER', name: 'Copper', unit: 'USD/lb' },
];

const INDEX_SYMBOLS = [
  { yahoo: '^GSPC', name: 'NYSE', index: 'S&P 500', region: 'USA' },
  { yahoo: '^IXIC', name: 'NASDAQ', index: 'NASDAQ Comp', region: 'USA' },
  { yahoo: '^FTSE', name: 'LSE', index: 'FTSE 100', region: 'UK' },
  { yahoo: '^N225', name: 'TSE', index: 'Nikkei 225', region: 'Japan' },
  { yahoo: '000001.SS', name: 'SSE', index: 'SSE Composite', region: 'China' },
  { yahoo: '^BSESN', name: 'BSE', index: 'Sensex 30', region: 'India' },
];

// --- Fetch helpers ---
async function fetchJSON(url, timeout = 12000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchYahooChart(symbol) {
  try {
    const data = await fetchJSON(`${YAHOO_CHART}/${encodeURIComponent(symbol)}?interval=1d&range=5d`);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    return { symbol, price, prevClose, change };
  } catch {
    return null;
  }
}

async function fetchYahooBatch(symbols, batchSize = 6) {
  const results = {};
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchYahooChart));
    batchResults.forEach((r) => { if (r) results[r.symbol] = r; });
    if (i + batchSize < symbols.length) await new Promise((r) => setTimeout(r, 200));
  }
  return results;
}

// Fetch ALL metal spot prices from gold-api.com
async function fetchMetalsSpot() {
  const results = {};
  const fetches = await Promise.all(
    METAL_SYMBOLS.filter((m) => m.api).map(async (m) => {
      try {
        const data = await fetchJSON(`${METALS_SPOT_API}/${m.api}`, 5000);
        return { symbol: m.symbol, price: data.price };
      } catch {
        return null;
      }
    })
  );
  fetches.forEach((r) => { if (r && r.price) results[r.symbol] = r.price; });
  return results;
}

// --- Main hook ---
export function useMarketData() {
  const [data, setData] = useState({
    stocks: [],
    metals: [],
    exchanges: [],
    forex: [],
    watchlist: [],
    cryptoExchanges: [],
    loading: true,
    lastUpdated: null,
  });

  const prevForexRef = useRef(null);
  const prevMetalPricesRef = useRef({});
  const yahooMapRef = useRef({});
  const cryptoRef = useRef({ coins: [], exchanges: [] });

  // --- METALS: fetches every 1 second ---
  const fetchMetals = useCallback(async () => {
    try {
      const spotPrices = await fetchMetalsSpot();
      if (Object.keys(spotPrices).length === 0) return;

      const prevPrices = prevMetalPricesRef.current;

      const metals = METAL_SYMBOLS.map((m) => {
        const price = spotPrices[m.symbol] ?? prevPrices[m.symbol] ?? 0;
        const prev = prevPrices[m.symbol] ?? price;
        const change = prev ? ((price - prev) / prev) * 100 : 0;
        return { symbol: m.symbol, name: m.name, unit: m.unit, price, change };
      });

      // Store first-fetch prices as baseline for % change
      if (Object.keys(prevMetalPricesRef.current).length === 0) {
        METAL_SYMBOLS.forEach((m) => {
          if (spotPrices[m.symbol]) prevMetalPricesRef.current[m.symbol] = spotPrices[m.symbol];
        });
      }

      setData((prev) => ({
        ...prev,
        metals,
        loading: false,
        lastUpdated: new Date(),
        // Update gold in watchlist too
        watchlist: prev.watchlist.map((w) =>
          w.symbol === 'GOLD' && spotPrices.GOLD
            ? { ...w, price: spotPrices.GOLD, change: metals[0]?.change || w.change }
            : w
        ),
      }));
    } catch (err) {
      console.warn('Metals fetch error:', err.message);
    }
  }, []);

  // --- STOCKS + INDICES: fetches every 10 seconds ---
  const fetchStocks = useCallback(async () => {
    try {
      const allYahooSymbols = [
        ...STOCK_SECTORS.flatMap((s) => s.tickers),
        ...INDEX_SYMBOLS.map((idx) => idx.yahoo),
        'CL=F',
      ];
      const yahooMap = await fetchYahooBatch(allYahooSymbols);
      yahooMapRef.current = { ...yahooMapRef.current, ...yahooMap };

      const stocks = STOCK_SECTORS.map((sector) => {
        const sectorStocks = sector.tickers.map((ticker) => {
          const q = yahooMap[ticker];
          return {
            ticker: ticker.replace('-', '.'),
            name: ticker.replace('-', '.'),
            price: q?.price ?? 0,
            change: q?.change ?? 0,
            marketCap: q?.price ? q.price * 10 : 100,
          };
        });
        const validStocks = sectorStocks.filter((s) => s.price > 0);
        const avgChange = validStocks.length
          ? validStocks.reduce((s, st) => s + st.change, 0) / validStocks.length
          : 0;
        return { name: sector.name, change: avgChange, stocks: sectorStocks };
      });

      const exchanges = INDEX_SYMBOLS.map((idx) => {
        const q = yahooMap[idx.yahoo];
        return {
          name: idx.name,
          region: idx.region,
          index: idx.index,
          value: q?.price ?? 0,
          change: q?.change ?? 0,
        };
      });

      const oilData = yahooMap['CL=F'];

      setData((prev) => ({
        ...prev,
        stocks,
        exchanges,
        loading: false,
        watchlist: prev.watchlist.map((w) => {
          if (w.symbol === 'OIL' && oilData) return { ...w, price: oilData.price, change: oilData.change };
          const stockMatch = stocks.flatMap((s) => s.stocks).find((st) => st.ticker === w.symbol);
          if (stockMatch && w.type === 'stock') return { ...w, price: stockMatch.price, change: stockMatch.change };
          return w;
        }),
      }));
    } catch (err) {
      console.warn('Stocks fetch error:', err.message);
    }
  }, []);

  // --- CRYPTO: fetches every 15 seconds ---
  const fetchCrypto = useCallback(async () => {
    try {
      const [coinsData, exchangesData] = await Promise.all([
        fetchJSON(COINGECKO_COINS).catch(() => []),
        fetchJSON(COINGECKO_EXCHANGES).catch(() => []),
      ]);

      const cryptoCoins = Array.isArray(coinsData) ? coinsData.slice(0, 5) : [];
      const btcPrice = cryptoCoins.find((c) => c.symbol === 'btc')?.current_price || 60000;

      const cryptoExchanges = Array.isArray(exchangesData)
        ? exchangesData.slice(0, 12).map((ex) => ({
            name: ex.name,
            volume: ex.trade_volume_24h_btc_normalized ?? ex.trade_volume_24h_btc ?? 0,
            volumeUsd: (ex.trade_volume_24h_btc_normalized ?? ex.trade_volume_24h_btc ?? 0) * btcPrice,
            change: 0,
          }))
        : [];

      cryptoRef.current = { coins: cryptoCoins, exchanges: cryptoExchanges };

      const watchlistCrypto = cryptoCoins.slice(0, 4).map((c) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        type: 'crypto',
        price: c.current_price,
        change: c.price_change_percentage_24h ?? 0,
      }));

      setData((prev) => ({
        ...prev,
        cryptoExchanges,
        loading: false,
        watchlist: [
          ...watchlistCrypto,
          ...prev.watchlist.filter((w) => w.type !== 'crypto'),
        ],
      }));
    } catch (err) {
      console.warn('Crypto fetch error:', err.message);
    }
  }, []);

  // --- FOREX: fetches every 60 seconds ---
  const fetchForex = useCallback(async () => {
    try {
      const forexData = await fetchJSON(FOREX_API);
      if (!forexData?.rates) return;

      const r = forexData.rates;
      let forex = [
        { pair: 'EUR/USD', rate: 1 / r.EUR },
        { pair: 'GBP/USD', rate: 1 / r.GBP },
        { pair: 'USD/JPY', rate: r.JPY },
        { pair: 'USD/CHF', rate: r.CHF },
        { pair: 'AUD/USD', rate: 1 / r.AUD },
        { pair: 'USD/CAD', rate: r.CAD },
      ];

      const prev = prevForexRef.current;
      forex = forex.map((fx, i) => ({
        ...fx,
        change: prev?.[i]?.rate ? ((fx.rate - prev[i].rate) / prev[i].rate) * 100 : 0,
      }));
      prevForexRef.current = forex;

      setData((prev) => ({ ...prev, forex }));
    } catch (err) {
      console.warn('Forex fetch error:', err.message);
    }
  }, []);

  // --- Bootstrap: initial load of everything ---
  const bootstrap = useCallback(async () => {
    await Promise.all([fetchMetals(), fetchStocks(), fetchCrypto(), fetchForex()]);

    // Build initial watchlist
    setData((prev) => {
      const oilData = yahooMapRef.current['CL=F'];
      const goldItem = prev.metals.find((m) => m.symbol === 'GOLD');
      const watchlistBase = prev.watchlist.length
        ? prev.watchlist
        : [
            ...(cryptoRef.current.coins.slice(0, 4).map((c) => ({
              symbol: c.symbol.toUpperCase(),
              name: c.name,
              type: 'crypto',
              price: c.current_price,
              change: c.price_change_percentage_24h ?? 0,
            }))),
            { symbol: 'GOLD', name: 'Gold', type: 'commodity', price: goldItem?.price || 0, change: goldItem?.change || 0 },
            { symbol: 'OIL', name: 'Crude Oil', type: 'commodity', price: oilData?.price || 0, change: oilData?.change || 0 },
            ...(prev.stocks[0]?.stocks?.slice(0, 2).filter((s) => s.price > 0).map((s) => ({
              symbol: s.ticker, name: s.name, type: 'stock', price: s.price, change: s.change,
            })) || []),
          ];
      return { ...prev, watchlist: watchlistBase.filter((w) => w.price > 0), loading: false };
    });
  }, [fetchMetals, fetchStocks, fetchCrypto, fetchForex]);

  // --- Setup intervals ---
  useEffect(() => {
    bootstrap();

    const metalsId = setInterval(fetchMetals, METALS_INTERVAL);
    const stocksId = setInterval(fetchStocks, STOCKS_INTERVAL);
    const cryptoId = setInterval(fetchCrypto, CRYPTO_INTERVAL);
    const forexId = setInterval(fetchForex, FOREX_INTERVAL);

    return () => {
      clearInterval(metalsId);
      clearInterval(stocksId);
      clearInterval(cryptoId);
      clearInterval(forexId);
    };
  }, [bootstrap, fetchMetals, fetchStocks, fetchCrypto, fetchForex]);

  return data;
}

// --- Formatting utilities ---
export function formatNumber(value, compact = false) {
  if (value === undefined || value === null || value === 0) return '-';
  if (compact && Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (compact && Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (compact && Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function signClass(change) {
  return change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-slate-400';
}

export function sign(change) {
  return change > 0 ? '+' : '';
}

export function fmt(num, digits = 2) {
  return Number(num).toFixed(digits);
}
