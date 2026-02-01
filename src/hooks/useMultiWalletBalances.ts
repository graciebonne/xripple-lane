import { useState, useEffect, useCallback } from 'react';
import { 
  SUPPORTED_CHAINS, 
  CHAIN_TOKENS, 
  getNativeBalance, 
  getTokenBalance,
  getSolanaBalance,
  getTronBalance,
  getBitcoinBalance 
} from '@/lib/reown';
import { fetchXrpBalance } from './useXrpBalance';
import { usePrices } from './usePrices';

export interface WalletToken {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: number;
  chain: string;
  chainId: string;
  icon: string;
  address?: string;
}

export interface WalletWithAssets {
  id: string;
  name: string;
  xrpAddress: string;
  xrpBalance: string;
  xrpBalanceUSD: number;
  evmAddress?: string;
  solanaAddress?: string;
  tronAddress?: string;
  bitcoinAddress?: string;
  tokens: WalletToken[];
  totalValueUSD: number;
}

interface MultiWalletBalancesResult {
  wallets: WalletWithAssets[];
  totalPortfolioValue: number;
  totalXrpBalance: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Token icons
const TOKEN_ICONS: Record<string, string> = {
  ETH: '⟠',
  USDT: '💵',
  USDC: '🔵',
  WBTC: '🟠',
  MATIC: '🟣',
  BNB: '🔶',
  BUSD: '💛',
  ARB: '🔷',
  OP: '🔴',
  AVAX: '🔺',
  SOL: '◎',
  TRX: '⚡',
  BTC: '₿',
  XRP: '✕',
};

export function useMultiWalletBalances(
  wallets: Array<{
    id: string;
    name: string;
    xrpAddress: string;
    evmAddress?: string;
    solanaAddress?: string;
    tronAddress?: string;
    bitcoinAddress?: string;
  }>
): MultiWalletBalancesResult {
  const [walletsWithAssets, setWalletsWithAssets] = useState<WalletWithAssets[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const { prices } = usePrices();

  // Memoize wallets key to prevent unnecessary re-fetches
  const walletsKey = wallets.map(w => w.id).join(',');

  const getTokenPrice = useCallback((symbol: string): number => {
    const symbolLower = symbol.toLowerCase();
    const priceData = (prices as any)[symbolLower];
    if (priceData && typeof priceData === 'object' && 'usd' in priceData) {
      return priceData.usd;
    }
    if (['usdt', 'usdc', 'busd', 'dai'].includes(symbolLower)) return 1;
    return 0;
  }, [prices]);

  useEffect(() => {
    let cancelled = false;

    const fetchAllBalances = async () => {
      if (!wallets.length) {
        setWalletsWithAssets([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const walletsData: WalletWithAssets[] = await Promise.all(
          wallets.map(async (wallet) => {
            const tokens: WalletToken[] = [];
            let xrpBalance = '0';
            let xrpBalanceUSD = 0;
            const balancePromises: Promise<void>[] = [];
            
            // Fetch XRP balance
            balancePromises.push(
              (async () => {
                xrpBalance = await fetchXrpBalance(wallet.xrpAddress);
                const xrpPrice = getTokenPrice('xrp');
                const xrpBalanceNum = parseFloat(xrpBalance);
                xrpBalanceUSD = xrpBalanceNum * xrpPrice;
              })()
            );

            // Fetch EVM balances if address exists
            if (wallet.evmAddress) {
              for (const [chainKey, chainInfo] of Object.entries(SUPPORTED_CHAINS)) {
                const chainTokens = CHAIN_TOKENS[chainKey as keyof typeof CHAIN_TOKENS] || [];
                
                for (const token of chainTokens) {
                  balancePromises.push(
                    (async () => {
                      try {
                        let balance: string;
                        
                        if (token.address) {
                          // ERC-20 token
                          balance = await getTokenBalance(
                            token.address,
                            wallet.evmAddress!,
                            chainInfo.rpcUrl,
                            token.decimals
                          );
                        } else {
                          // Native token
                          balance = await getNativeBalance(wallet.evmAddress!, chainInfo.rpcUrl);
                        }
                        
                        const balanceNum = parseFloat(balance);
                        if (balanceNum > 0) {
                          const price = getTokenPrice(token.symbol);
                          tokens.push({
                            symbol: token.symbol,
                            name: token.name,
                            balance,
                            balanceUSD: balanceNum * price,
                            chain: chainInfo.name,
                            chainId: chainKey,
                            icon: TOKEN_ICONS[token.symbol] || '🪙',
                            address: token.address,
                          });
                        }
                      } catch (err) {
                        // Silently skip failed token fetches
                      }
                    })()
                  );
                }
              }
            }

            // Fetch Solana balance if address exists
            if (wallet.solanaAddress) {
              balancePromises.push(
                (async () => {
                  try {
                    const solBalance = await getSolanaBalance(wallet.solanaAddress);
                    const balanceNum = parseFloat(solBalance);
                    if (balanceNum > 0) {
                      const price = getTokenPrice('sol');
                      tokens.push({
                        symbol: 'SOL',
                        name: 'Solana',
                        balance: solBalance,
                        balanceUSD: balanceNum * price,
                        chain: 'Solana',
                        chainId: 'solana',
                        icon: TOKEN_ICONS.SOL,
                      });
                    }
                  } catch (err) {
                    // Silently skip
                  }
                })()
              );
            }

            // Fetch TRON balance if address exists
            if (wallet.tronAddress) {
              balancePromises.push(
                (async () => {
                  try {
                    const trxBalance = await getTronBalance(wallet.tronAddress);
                    const balanceNum = parseFloat(trxBalance);
                    if (balanceNum > 0) {
                      const price = getTokenPrice('trx');
                      tokens.push({
                        symbol: 'TRX',
                        name: 'TRON',
                        balance: trxBalance,
                        balanceUSD: balanceNum * price,
                        chain: 'TRON',
                        chainId: 'tron',
                        icon: TOKEN_ICONS.TRX,
                      });
                    }
                  } catch (err) {
                    // Silently skip
                  }
                })()
              );
            }

            // Fetch Bitcoin balance if address exists
            if (wallet.bitcoinAddress) {
              balancePromises.push(
                (async () => {
                  try {
                    const btcBalance = await getBitcoinBalance(wallet.bitcoinAddress);
                    const balanceNum = parseFloat(btcBalance);
                    if (balanceNum > 0) {
                      const price = getTokenPrice('btc');
                      tokens.push({
                        symbol: 'BTC',
                        name: 'Bitcoin',
                        balance: btcBalance,
                        balanceUSD: balanceNum * price,
                        chain: 'Bitcoin',
                        chainId: 'bitcoin',
                        icon: TOKEN_ICONS.BTC,
                      });
                    }
                  } catch (err) {
                    // Silently skip
                  }
                })()
              );
            }

            // Wait for all balance fetches to complete
            await Promise.all(balancePromises);

            const totalTokenValue = tokens.reduce((sum, t) => sum + t.balanceUSD, 0);

            return {
              id: wallet.id,
              name: wallet.name,
              xrpAddress: wallet.xrpAddress,
              xrpBalance,
              xrpBalanceUSD,
              evmAddress: wallet.evmAddress,
              solanaAddress: wallet.solanaAddress,
              tronAddress: wallet.tronAddress,
              bitcoinAddress: wallet.bitcoinAddress,
              tokens,
              totalValueUSD: xrpBalanceUSD + totalTokenValue,
            };
          })
        );

        if (!cancelled) {
          setWalletsWithAssets(walletsData);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch balances');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllBalances();

    return () => {
      cancelled = true;
    };
  }, [walletsKey, fetchTrigger, getTokenPrice]);

  const refetch = useCallback(() => {
    setFetchTrigger(prev => prev + 1);
  }, []);

  const totalPortfolioValue = walletsWithAssets.reduce((sum, w) => sum + w.totalValueUSD, 0);
  const totalXrpBalance = walletsWithAssets.reduce((sum, w) => sum + parseFloat(w.xrpBalance || '0'), 0);

  return {
    wallets: walletsWithAssets,
    totalPortfolioValue,
    totalXrpBalance,
    loading,
    error,
    refetch,
  };
}
