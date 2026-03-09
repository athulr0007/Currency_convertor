import { getFlagUrl, currencyNames } from "@/lib/currencies";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CurrencySelectProps {
  value: string;
  currencies: string[];
  onChange: (value: string) => void;
  label: string;
}

export function CurrencySelect({ value, currencies, onChange, label }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = currencies.filter(
    (c) =>
      c.toLowerCase().includes(search.toLowerCase()) ||
      (currencyNames[c] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5 flex-1" ref={ref}>
      <span className="text-xs font-heading text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input flex items-center gap-3 px-4 py-3.5 text-left relative"
      >
        <img
          src={getFlagUrl(value)}
          alt={value}
          className="w-7 h-5 rounded-sm object-cover"
        />
        <span className="font-heading font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {currencyNames[value] || ""}
        </span>
        <ChevronDown
          className={`ml-auto w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          className="absolute z-50 mt-[72px] w-full max-w-[280px] glass-card p-2 max-h-64 overflow-hidden flex flex-col"
        >
          <input
            type="text"
            placeholder="Search currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input px-3 py-2 text-sm mb-2"
            autoFocus
          />
          <div className="overflow-y-auto space-y-0.5 scrollbar-thin">
            {filtered.map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => {
                  onChange(currency);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  currency === value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <img
                  src={getFlagUrl(currency)}
                  alt={currency}
                  className="w-6 h-4 rounded-sm object-cover"
                />
                <span className="font-heading font-medium">{currency}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {currencyNames[currency] || ""}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
