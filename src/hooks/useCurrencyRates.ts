import { useState, useEffect, useCallback, useRef } from "react";
import { registerCrypto, CoinGeckoCoin } from "@/lib/currencies";

interface RatesData {
  [key: string]: number;
}

export function useCurrencyRates() {
  const [rates, setRates] = useState<RatesData>({});
  const [cryptoCoins, setCryptoCoins] = useState<CoinGeckoCoin[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchRates = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);
    try {
      // Fetch fiat rates
      const fiatRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const fiatData = await fiatRes.json();
      const fiatRates: RatesData = fiatData.rates;

      let allCoins: CoinGeckoCoin[] = [];
      try {
        // Fetch only page 1 (250 coins) to avoid rate limiting
        // Add delay between pages if fetching multiple
        const page1Res = await fetch(
          `/coingecko/api/v3/coins/markets` +
          `?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
          { headers: { "Accept": "application/json" } }
        );

        if (page1Res.status === 429) {
          throw new Error("Rate limited");
        }

        if (page1Res.ok) {
          const page1Data = await page1Res.json();
          allCoins = page1Data.filter(
            (c: CoinGeckoCoin) => c && c.current_price != null
          );

          // Fetch page 2 with a delay to avoid 429
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const page2Res = await fetch(
            `/coingecko/api/v3/coins/markets` +
            `?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&sparkline=false`,
            { headers: { "Accept": "application/json" } }
          );

          if (page2Res.ok) {
            const page2Data = await page2Res.json();
            allCoins = [
              ...allCoins,
              ...page2Data.filter(
                (c: CoinGeckoCoin) => c && c.current_price != null
              ),
            ];
          }
        }
      } catch (cryptoErr) {
        console.warn("Crypto rates unavailable:", cryptoErr);
      }

      if (allCoins.length > 0) {
        registerCrypto(allCoins, fiatRates);
      }

      const cryptoRates: RatesData = {};
      allCoins.forEach((coin) => {
        if (coin.current_price && coin.current_price > 0) {
          const code = coin.symbol.toUpperCase();
          const key = fiatRates[code] !== undefined ? `c:${code}` : code;
          cryptoRates[key] = 1 / coin.current_price;
        }
      });

      const mergedRates = { ...fiatRates, ...cryptoRates };
      setRates(mergedRates);
      setCryptoCoins(allCoins);

      // ✅ Only update currencies list if keys actually changed
      // This prevents dropdown from blinking on every refresh
      setCurrencies((prev) => {
        const next = Object.keys(mergedRates);
        if (
          prev.length === next.length &&
          next.every((k, i) => k === prev[i])
        ) {
          return prev; // same reference = no re-render
        }
        return next;
      });

      setLastUpdated(new Date());
    } catch {
      setError("Failed to fetch rates. Showing cached data.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Refresh every 2 minutes instead of 30s to avoid 429
    intervalRef.current = setInterval(fetchRates, 120_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number | null => {
      if (!rates[from] || !rates[to]) return null;
      return (amount * rates[to]) / rates[from];
    },
    [rates]
  );

  const getRate = useCallback(
    (from: string, to: string): number | null => {
      if (!rates[from] || !rates[to]) return null;
      return rates[to] / rates[from];
    },
    [rates]
  );

  return {
    rates,
    cryptoCoins,
    loading,
    error,
    lastUpdated,
    fetchRates,
    convert,
    getRate,
    currencies, // now stable — only changes when keys actually differ
  };
}