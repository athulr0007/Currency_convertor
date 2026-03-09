import { motion } from "framer-motion";
import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { currencySymbols } from "@/lib/currencies";
import { formatCurrency } from "@/lib/formatNumber";

interface Props {
  amount: number;
  result: number;
  fromCurrency: string;
  toCurrency: string;
}

export function CopyShareButtons({ amount, result, fromCurrency, toCurrency }: Props) {
  const [copied, setCopied] = useState(false);

  const fromSymbol = currencySymbols[fromCurrency] || "";
  const toSymbol = currencySymbols[toCurrency] || "";
  const text = `${fromSymbol}${formatCurrency(amount)} ${fromCurrency} = ${toSymbol}${formatCurrency(result)} ${toCurrency}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Currency Conversion",
        text,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 justify-center">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-glass-border text-xs font-heading text-foreground hover:border-primary/40 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-glass-border text-xs font-heading text-foreground hover:border-primary/40 transition-all"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </motion.button>
    </div>
  );
}
