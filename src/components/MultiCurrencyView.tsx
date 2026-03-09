import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { getFlagUrl, currencySymbols } from "@/lib/currencies";

interface Props {
  amount: number;
  fromCurrency: string;
  convert: (amount: number, from: string, to: string) => number | null;
}

const POPULAR = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF"];

export function MultiCurrencyView({ amount, fromCurrency, convert }: Props) {
  if (!amount || amount <= 0) return null;

  const targets = POPULAR.filter((c) => c !== fromCurrency).slice(0, 6);

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
        {targets.map((currency, i) => {
          const result = convert(amount, fromCurrency, currency);
          return (
            <motion.div
              key={currency}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card p-3 flex items-center gap-2.5"
            >
              <img
                src={getFlagUrl(currency)}
                alt={currency}
                className="w-6 h-4 rounded-sm object-cover"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground font-heading">{currency}</span>
                <span className="text-sm font-heading font-semibold text-foreground truncate">
                  {currencySymbols[currency] || ""}
                  {result?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "—"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
