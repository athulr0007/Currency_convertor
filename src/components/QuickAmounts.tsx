import { motion } from "framer-motion";
import { isCrypto } from "@/lib/currencies";

interface Props {
  onSelect: (amount: string) => void;
  fromCurrency: string;
}

const FIAT_AMOUNTS = [100, 500, 1000, 5000, 10000];
const CRYPTO_AMOUNTS = [0.001, 0.01, 0.1, 0.5, 1];

export function QuickAmounts({ onSelect, fromCurrency }: Props) {
  const amounts = isCrypto(fromCurrency) ? CRYPTO_AMOUNTS : FIAT_AMOUNTS;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {amounts.map((amt, i) => (
        <motion.button
          key={amt}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(String(amt))}
          className="px-3 py-1 rounded-full bg-muted/50 border border-glass-border text-xs font-heading text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
        >
          {isCrypto(fromCurrency) ? amt : amt.toLocaleString()}
        </motion.button>
      ))}
    </div>
  );
}