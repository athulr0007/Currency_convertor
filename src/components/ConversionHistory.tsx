import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import { ConversionRecord, currencySymbols, isCrypto, cryptoMeta } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatNumber";

interface Props {
  history: ConversionRecord[];
  onClear: () => void;
  onReuse: (record: ConversionRecord) => void;
}

function displayCode(code: string) {
  return code.startsWith("c:") ? code.slice(2) : code;
}

function formatAmount(value: number, currency: string) {
  if (isCrypto(currency)) {
    // Show up to 8 decimals for crypto, strip trailing zeros
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 8,
      minimumFractionDigits: 0,
    });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function CurrencyDisplay({
  value,
  currency,
  gold = false,
}: {
  value: number;
  currency: string;
  gold?: boolean;
}) {
  const crypto = isCrypto(currency);
  const meta = cryptoMeta[currency];
  const code = displayCode(currency);
  // For fiat use symbol (e.g. $, ₹), for crypto just show ticker after number
  const symbol = !crypto ? (currencySymbols[currency] || "") : "";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        fontWeight: 500,
        color: gold ? "#f0b429" : "#f5f0e8",
      }}
    >
      {/* Coin icon for crypto */}
      {crypto && meta?.image && (
        <img
          src={meta.image}
          alt={code}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}
      {/* Fiat symbol before number */}
      {symbol}
      {formatAmount(value, currency)}
      {/* Ticker after number */}
      <span
        style={{
          fontSize: 10,
          color: gold ? "rgba(240,180,41,0.7)" : "rgba(245,240,232,0.4)",
          letterSpacing: "0.06em",
        }}
      >
        {code}
      </span>
    </span>
  );
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
          <span className="font-heading text-sm font-semibold text-foreground">
            Recent Conversions
          </span>
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
              <div className="flex flex-col gap-1">
                <CurrencyDisplay value={record.amount} currency={record.from} />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(245,240,232,0.25)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <CurrencyDisplay
                  value={record.result}
                  currency={record.to}
                  gold
                />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: "rgba(245,240,232,0.2)",
                    letterSpacing: "0.04em",
                  }}
                >
                  @ {record.rate.toFixed(isCrypto(record.to) ? 6 : 4)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}