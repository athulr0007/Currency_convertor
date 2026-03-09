import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import { ConversionRecord, currencySymbols } from "@/lib/currencies";

interface Props {
  history: ConversionRecord[];
  onClear: () => void;
  onReuse: (record: ConversionRecord) => void;
}

export function ConversionHistory({ history, onClear, onReuse }: Props) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-xl mx-auto mt-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-heading text-sm font-semibold text-foreground">Recent Conversions</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {history.slice(0, 5).map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="history-item flex items-center justify-between"
              onClick={() => onReuse(record)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-heading font-medium text-foreground">
                  {currencySymbols[record.from] || ""}{record.amount.toLocaleString()} {record.from}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-heading font-semibold text-primary">
                  {currencySymbols[record.to] || ""}{record.result.toLocaleString(undefined, { maximumFractionDigits: 2 })} {record.to}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
