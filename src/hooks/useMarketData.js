import { useEffect, useState, useRef } from 'react';
import {
  stockSectors,
  preciousMetals,
  stockExchanges,
  forexPairs,
  combinedWatchlist,
  randomize,
} from '../utils/mockData';

const COINGECKO_COINS =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h';
const COINGECKO_EXCHANGES = 'https://api.coingecko.com/api/v3/exchanges?per_page=20&page=1';
const FOREX_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const METALS_API = 'https://api.metals.live/v1/spot';

function fmt(num, digits = 2) {
  return Number(num).toFixed(digits);
}

function addWiggle(items, priceKey = 'price', changeKey = 'change') {
  return items.map((item) => ({
    ...item,
    [priceKey]: randomize(item[priceKey], 0.004),
    [changeKey]: item[changeKey] + (Math.random() - 0.5) * 0.05,
  }));
}

async function fetchWithFallback(url, fallback, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to fetch ${url}:`, err.message);
    return fallback;
  }
}

export function useMarketData() {
  const [data, setData] = useState({
    stocks: stockSectors,
    metals: preciousMetals,
    exchanges: stockExchanges,
    forex: forexPairs,
    watchlist: combinedWatchlist,
    cryptoCoins: [],
    cryptoExchanges: [],
    loading: true,
    error: null,
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [coinsData, exchangesData, forexData, metalsData] = await Promise.all([
        fetchWithFallback(COINGECKO_COINS, []),
        fetchWithFallback(COINGECKO_EXCHANGES, []),
        fetchWithFallback(FOREX_API, null),
        fetchWithFallback(METALS_API, null),
      ]);

      const cryptoCoins = Array.isArray(coinsData)
        ? coinsData.slice(0, 24).map((coin) => ({
            symbol: coin.symbol?.toUpperCase() || '',
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h ?? 0,
            marketCap: coin.market_cap,
            image: coin.image,
          }))
        : [];

      const cryptoExchanges = Array.isArray(exchangesData)
        ? exchangesData.slice(0, 12).map((ex) => ({
            name: ex.name,
            volume: ex.trade_volume_24h_btc_normalized ?? ex.trade_volume_24h_btc ?? 0,
            volumeUsd: ex.trade_volume_24h_btc_normalized
              ? ex.trade_volume_24h_btc_normalized * 40000
              : 0,
            change: (Math.random() - 0.5) * 4,
          }))
        : [];

      let forex = forexPairs;
      if (forexData && forexData.rates) {
        const rates = forexData.rates;
        forex = [
          { pair: 'EUR/USD', rate: rates.EUR ?? 1.0845, change: (Math.random() - 0.5) * 0.6 },
          { pair: 'GBP/USD', rate: rates.GBP ?? 1.273, change: (Math.random() - 0.5) * 0.6 },
          { pair: 'USD/JPY', rate: rates.JPY ?? 149.85, change: (Math.random() - 0.5) * 0.6 },
          { pair: 'USD/CHF', rate: rates.CHF ?? 0.8825, change: (Math.random() - 0.5) * 0.6 },
          { pair: 'AUD/USD', rate: rates.AUD ?? 0.659, change: (Math.random() - 0.5) * 0.6 },
          { pair: 'USD/CAD', rate: rates.CAD ? 1 / rates.CAD : 1.352, change: (Math.random() - 0.5) * 0.6 },
        ];
      }

      let metals = preciousMetals;
      if (metalsData && typeof metalsData === 'object') {
        const map = {
          GOLD: metalsData.gold ?? metalsData.GOLD,
          SILVER: metalsData.silver ?? metalsData.SILVER,
          PLATINUM: metalsData.platinum ?? metalsData.PLATINUM,
          PALLADIUM: metalsData.palladium ?? metalsData.PALLADIUM,
        };
        metals = preciousMetals.map((m) => ({
          ...m,
          price: map[m.symbol] ? Number(map[m.symbol]) : m.price,
          change: m.change + (Math.random() - 0.5) * 0.1,
        }));
      }

      setData((prev) => ({
        ...prev,
        cryptoCoins,
        cryptoExchanges,
        forex,
        metals,
        loading: false,
      }));
    }

    load();

    intervalRef.current = setInterval(() => {
      setData((prev) => ({
        ...prev,
        stocks: addWiggle(prev.stocks, 'change', 'change').map((sector) => ({
          ...sector,
          stocks: addWiggle(sector.stocks, 'price', 'change'),
        })),
        metals: addWiggle(prev.metals, 'price', 'change'),
        exchanges: addWiggle(prev.exchanges, 'value', 'change'),
        forex: addWiggle(prev.forex, 'rate', 'change'),
        watchlist: addWiggle(prev.watchlist, 'price', 'change'),
        cryptoCoins: prev.cryptoCoins.length
          ? prev.cryptoCoins.map((coin) => ({
              ...coin,
              price: randomize(coin.price, 0.006),
              change: coin.change + (Math.random() - 0.5) * 0.08,
            }))
          : prev.cryptoCoins,
        cryptoExchanges: prev.cryptoExchanges.length
          ? prev.cryptoExchanges.map((ex) => ({
              ...ex,
              volumeUsd: ex.volumeUsd * (1 + (Math.random() - 0.5) * 0.02),
              change: ex.change + (Math.random() - 0.5) * 0.1,
            }))
          : prev.cryptoExchanges,
      }));
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return data;
}

export function formatNumber(value, compact = false) {
  if (value === undefined || value === null) return '-';
  if (compact && Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (compact && Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (compact && Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function signClass(change) {
  return change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-slate-300';
}

export function sign(change) {
  return change > 0 ? '+' : '';
}

export { fmt };
