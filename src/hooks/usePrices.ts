import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol?: number;
  usd_market_cap?: number;
}

interface Prices {
  xrp: PriceData;
  btc: PriceData;
  eth: PriceData;
  sol: PriceData;
  trx: PriceData;
  bnb: PriceData;
  matic: PriceData;
  usdt: PriceData;
  usdc: PriceData;
  busd: PriceData;
  timestamp: number;
  fallback?: boolean;
}

const defaultPrices: Prices = {
  xrp: { usd: 0.52, usd_24h_change: 0, usd_24h_vol: 0, usd_market_cap: 0 },
  btc: { usd: 67000, usd_24h_change: 0 },
  eth: { usd: 3200, usd_24h_change: 0 },
  sol: { usd: 145, usd_24h_change: 0 },
  trx: { usd: 0.12, usd_24h_change: 0 },
  bnb: { usd: 580, usd_24h_change: 0 },
  matic: { usd: 0.85, usd_24h_change: 0 },
  usdt: { usd: 1.00, usd_24h_change: 0 },
  usdc: { usd: 1.00, usd_24h_change: 0 },
  busd: { usd: 1.00, usd_24h_change: 0 },
  timestamp: Date.now(),
};

export function usePrices() {
  const [prices, setPrices] = useState<Prices>(defaultPrices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      // Use CoinGecko API directly for more reliable price data
      const coinIds = ['ripple', 'bitcoin', 'ethereum', 'solana', 'tron', 'binancecoin', 'matic-network', 'tether', 'usd-coin', 'binance-usd', 'avalanche-2', 'arbitrum', 'optimism'];
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices from CoinGecko');
      }
      
      const data = await response.json();
      
      // Map CoinGecko IDs to our price format
      const mappedPrices: Prices = {
        xrp: { usd: data.ripple?.usd || defaultPrices.xrp.usd, usd_24h_change: data.ripple?.usd_24h_change || 0 },
        btc: { usd: data.bitcoin?.usd || defaultPrices.btc.usd, usd_24h_change: data.bitcoin?.usd_24h_change || 0 },
        eth: { usd: data.ethereum?.usd || defaultPrices.eth.usd, usd_24h_change: data.ethereum?.usd_24h_change || 0 },
        sol: { usd: data.solana?.usd || defaultPrices.sol.usd, usd_24h_change: data.solana?.usd_24h_change || 0 },
        trx: { usd: data.tron?.usd || defaultPrices.trx.usd, usd_24h_change: data.tron?.usd_24h_change || 0 },
        bnb: { usd: data.binancecoin?.usd || defaultPrices.bnb.usd, usd_24h_change: data.binancecoin?.usd_24h_change || 0 },
        matic: { usd: data['matic-network']?.usd || defaultPrices.matic.usd, usd_24h_change: data['matic-network']?.usd_24h_change || 0 },
        usdt: { usd: data.tether?.usd || defaultPrices.usdt.usd, usd_24h_change: data.tether?.usd_24h_change || 0 },
        usdc: { usd: data['usd-coin']?.usd || defaultPrices.usdc.usd, usd_24h_change: data['usd-coin']?.usd_24h_change || 0 },
        busd: { usd: data['binance-usd']?.usd || defaultPrices.busd.usd, usd_24h_change: data['binance-usd']?.usd_24h_change || 0 },
        timestamp: Date.now(),
      };
      
      setPrices(mappedPrices);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message);
      // Keep using default/last known prices
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(4);
  }
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
