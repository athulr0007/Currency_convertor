import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronDown } from "lucide-react";
import { useState } from "react";
import { currencySymbols } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatNumber";

interface Props {
  amount: number;
  result: number;
  fromCurrency: string;
  toCurrency: string;
}

const SERVICES = [
  { name: "Bank Transfer", feePercent: 3.5, markup: 1.5, icon: "🏦" },
  { name: "PayPal", feePercent: 3.0, markup: 2.5, icon: "💳" },
  { name: "Wise", feePercent: 0.6, markup: 0.1, icon: "💸" },
  { name: "Western Union", feePercent: 4.0, markup: 2.0, icon: "🟡" },
  { name: "Revolut", feePercent: 0.5, markup: 0.3, icon: "💎" },
];

export function FeeCalculator({ amount, result, fromCurrency, toCurrency }: Props) {
  const [open, setOpen] = useState(false);

  if (!amount || amount <= 0 || !result) return null;

  const toSymbol = currencySymbols[toCurrency] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="w-full max-w-xl mx-auto mt-4"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-3 w-full group"
      >
        <Calculator className="w-4 h-4 text-primary" />
        <span className="font-heading text-sm font-semibold text-foreground">
          Transfer Fee Comparison
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground ml-auto transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {SERVICES.map((service, i) => {
                const fee = amount * (service.feePercent / 100);
                const markupLoss = result * (service.markup / 100);
                const youGet = result - markupLoss;
                const totalCost = fee + markupLoss;

                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{service.icon}</span>
                      <div>
                        <span className="text-sm font-heading font-medium text-foreground">
                          {service.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {service.feePercent}% fee + {service.markup}% markup
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-heading font-semibold text-primary">
                        {toSymbol}{formatCurrency(youGet)}
                      </span>
                      <p className="text-xs text-destructive">
                        -{toSymbol}{formatCurrency(totalCost)} cost
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center italic">
              * Estimates based on typical fees. Actual costs may vary.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
