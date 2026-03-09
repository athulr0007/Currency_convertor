import { motion, AnimatePresence } from "framer-motion";
import { Star, StarOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getFlagUrl, currencySymbols, isCrypto, cryptoMeta } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatNumber";

interface Props {
  amount: number;
  fromCurrency: string;
  convert: (amount: number, from: string, to: string) => number | null;
  onSelectCurrency: (currency: string) => void;
}

export function FavoriteCurrencies({ amount, fromCurrency, convert, onSelectCurrency }: Props) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("favoriteCurrencies") || "[]");
    } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("favoriteCurrencies", JSON.stringify(favorites));
  }, [favorites]);

  const removeFavorite = (currency: string) => {
    setFavorites((prev) => prev.filter((c) => c !== currency));
  };

  const addFavorite = (currency: string) => {
    const upper = currency.toUpperCase();
    if (upper && !favorites.includes(upper)) {
      setFavorites((prev) => [...prev, upper]);
    }
    setInput("");
    setAdding(false);
  };

  if (favorites.length === 0 && !adding) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xl mx-auto mt-4">
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Star className="w-4 h-4" />
          <span className="font-heading">Pin favorite currencies</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full max-w-xl mx-auto mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <span className="font-heading text-sm font-semibold text-foreground">Pinned</span>
        <button onClick={() => setAdding(true)} className="ml-auto text-xs text-primary hover:underline font-heading">
          + Add
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BTC, ETH, EUR…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFavorite(input)}
                className="glass-input px-3 py-2 text-sm flex-1"
                autoFocus
              />
              <button onClick={() => addFavorite(input)} className="premium-btn px-4 py-2 text-xs">Add</button>
              <button onClick={() => { setAdding(false); setInput(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence>
          {favorites.map((currency, i) => {
            const result = amount > 0 ? convert(amount, fromCurrency, currency) : null;
            const crypto = isCrypto(currency);
            const meta = cryptoMeta[currency];
            const displayCode = currency.startsWith("c:") ? currency.slice(2) : currency;

            return (
              <motion.div
                key={currency}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-3 flex items-center gap-2.5 group cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => onSelectCurrency(currency)}
              >
                {crypto && meta?.image ? (
                  <img src={meta.image} alt={displayCode}
                    style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <img src={getFlagUrl(currency)} alt={currency}
                    className="w-6 h-4 rounded-sm object-cover" />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground font-heading">{displayCode}</span>
                    {crypto && (
                      <span style={{
                        fontSize: 8,
                        padding: "1px 4px",
                        borderRadius: 3,
                        background: "rgba(240,180,41,0.1)",
                        border: "1px solid rgba(240,180,41,0.2)",
                        color: "#f0b429",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.08em",
                      }}>₿</span>
                    )}
                  </div>
                  <span className="text-sm font-heading font-semibold text-foreground truncate">
                    {result !== null
                      ? `${currencySymbols[currency] || ""}${formatCurrency(result, currency)}`
                      : "—"}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFavorite(currency); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <StarOff className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}