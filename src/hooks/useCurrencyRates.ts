import { useState, useEffect, useCallback } from "react";

interface RatesData {
  [key: string]: number;
}

export function useCurrencyRates() {
  const [rates, setRates] = useState<RatesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to fetch exchange rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
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

  return { rates, loading, error, lastUpdated, fetchRates, convert, getRate, currencies: Object.keys(rates) };
}
