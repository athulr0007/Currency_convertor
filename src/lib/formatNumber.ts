import { isCrypto } from "@/lib/currencies";

export function formatCurrency(value: number, currency?: string): string {
  const abs = Math.abs(value);

  // Crypto: needs more precision
  if (currency && isCrypto(currency)) {
    if (abs < 0.000001) return value.toFixed(10).replace(/\.?0+$/, "");
    if (abs < 0.001)    return value.toFixed(8);
    if (abs < 1)        return value.toFixed(6);
    if (abs < 1000)     return value.toFixed(4);
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  // Fiat formatting
  if (abs >= 1_000_000_000_000) {
    return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  if (abs >= 1_000_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  if (abs < 0.01 && abs > 0) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 6, minimumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function getResultFontSize(formattedValue: string): string {
  const len = formattedValue.length;
  if (len > 20) return "text-lg sm:text-xl";
  if (len > 14) return "text-xl sm:text-2xl";
  return "text-2xl sm:text-3xl";
}