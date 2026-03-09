import { motion, AnimatePresence } from "framer-motion";
import { Star, StarOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getFlagUrl, currencySymbols } from "@/lib/currencies";
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
    } catch {
      return [];
    }
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
    if (upper && !favorites.includes(upper) && upper.length === 3) {
      setFavorites((prev) => [...prev, upper]);
    }
    setInput("");
    setAdding(false);
  };

  if (favorites.length === 0 && !adding) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl mx-auto mt-4"
      >
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
        <span className="font-heading text-sm font-semibold text-foreground">
          Pinned Currencies
        </span>
        <button
          onClick={() => setAdding(true)}
          className="ml-auto text-xs text-primary hover:underline font-heading"
        >
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFavorite(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="e.g. BTC, EUR..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="glass-input px-3 py-2 text-sm flex-1"
                maxLength={3}
                autoFocus
              />
              <button type="submit" className="premium-btn px-4 py-2 text-xs">
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setInput("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence>
          {favorites.map((currency, i) => {
            const result = amount > 0 ? convert(amount, fromCurrency, currency) : null;
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
                <img
                  src={getFlagUrl(currency)}
                  alt={currency}
                  className="w-6 h-4 rounded-sm object-cover"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground font-heading">{currency}</span>
                  <span className="text-sm font-heading font-semibold text-foreground truncate">
                    {result !== null ? `${currencySymbols[currency] || ""}${formatCurrency(result)}` : "—"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(currency);
                  }}
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
