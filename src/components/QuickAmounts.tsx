import { motion } from "framer-motion";

interface Props {
  onSelect: (amount: string) => void;
  fromCurrency: string;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

export function QuickAmounts({ onSelect, fromCurrency }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {QUICK_AMOUNTS.map((amt, i) => (
        <motion.button
          key={amt}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(String(amt))}
          className="px-3 py-1 rounded-full bg-muted/50 border border-glass-border text-xs font-heading text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
        >
          {amt.toLocaleString()}
        </motion.button>
      ))}
    </div>
  );
}
