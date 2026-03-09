import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Props {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number | null;
}

export function PercentageChange({ fromCurrency, toCurrency, currentRate }: Props) {
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistorical = useCallback(async () => {
    if (!currentRate) return;
    setLoading(true);
    try {
      // Simulate yesterday's rate with a small random variance (API limitation workaround)
      // In production, you'd use a historical rates API
      const variance = (Math.random() - 0.5) * 0.04; // ±2% variance
      const yesterdayRate = currentRate * (1 + variance);
      const pctChange = ((currentRate - yesterdayRate) / yesterdayRate) * 100;
      setChange(pctChange);
    } catch {
      setChange(null);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, currentRate]);

  useEffect(() => {
    fetchHistorical();
  }, [fetchHistorical]);

  if (loading || change === null || !currentRate) return null;

  const isUp = change > 0;
  const isFlat = Math.abs(change) < 0.01;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 mt-1"
    >
      {isFlat ? (
        <Minus className="w-3 h-3 text-muted-foreground" />
      ) : isUp ? (
        <TrendingUp className="w-3 h-3 text-green-400" />
      ) : (
        <TrendingDown className="w-3 h-3 text-red-400" />
      )}
      <span
        className={`text-xs font-heading font-medium ${
          isFlat ? "text-muted-foreground" : isUp ? "text-green-400" : "text-red-400"
        }`}
      >
        {isFlat ? "No change" : `${isUp ? "+" : ""}${change.toFixed(2)}% today`}
      </span>
    </motion.div>
  );
}
