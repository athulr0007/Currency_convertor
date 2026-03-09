import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { getFlagUrl, currencySymbols, isCrypto, cryptoMeta } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatNumber";

interface Props {
  amount: number;
  fromCurrency: string;
  convert: (amount: number, from: string, to: string) => number | null;
}

const POPULAR_FIAT = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF"];
const POPULAR_CRYPTO = ["BTC", "ETH", "SOL", "BNB", "XRP"];

export function MultiCurrencyView({ amount, fromCurrency, convert }: Props) {
  if (!amount || amount <= 0) return null;

  const fiatTargets = POPULAR_FIAT.filter((c) => c !== fromCurrency).slice(0, 4);
  const cryptoTargets = POPULAR_CRYPTO.filter((c) => c !== fromCurrency).slice(0, 3);
  const allTargets = [...fiatTargets, ...cryptoTargets];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-xl mx-auto mt-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="font-heading text-sm font-semibold text-foreground">
          Quick Compare
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allTargets.map((currency, i) => {
          const result = convert(amount, fromCurrency, currency);
          const crypto = isCrypto(currency);
          const meta = cryptoMeta[currency];
          const displayCode = currency.startsWith("c:") ? currency.slice(2) : currency;
          const change = meta?.change24h;

          return (
            <motion.div
              key={currency}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="glass-card p-3 flex items-center gap-2.5"
            >
              {crypto && meta?.image ? (
                <img
                  src={meta.image}
                  alt={displayCode}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <img
                  src={getFlagUrl(currency)}
                  alt={currency}
                  className="w-6 h-4 rounded-sm object-cover"
                />
              )}

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-heading">
                    {displayCode}
                  </span>
                  {/* Guard: null AND undefined AND isFinite */}
                  {crypto && change != null && isFinite(change) && (
                    <span style={{
                      fontSize: 9,
                      color: change >= 0 ? "#4ade80" : "#f87171",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {change >= 0 ? "▲" : "▼"}{Math.abs(change).toFixed(1)}%
                    </span>
                  )}
                </div>
                <span className="text-sm font-heading font-semibold text-foreground truncate">
                  {currencySymbols[currency] || ""}
                  {result !== null ? formatCurrency(result, currency) : "—"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}