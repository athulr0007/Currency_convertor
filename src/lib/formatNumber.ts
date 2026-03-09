/**
 * Smart number formatting that handles very large and very small numbers
 */
export function formatCurrency(value: number, currency?: string): string {
  const abs = Math.abs(value);

  // For very large numbers, use compact notation
  if (abs >= 1_000_000_000_000) {
    return value.toLocaleString(undefined, {
      notation: "compact",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  // For large numbers, limit decimals
  if (abs >= 1_000_000) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  // For small numbers, show more precision
  if (abs < 0.01 && abs > 0) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2,
    });
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

/**
 * Get font size class based on result length
 */
export function getResultFontSize(formattedValue: string): string {
  const len = formattedValue.length;
  if (len > 20) return "text-lg sm:text-xl";
  if (len > 14) return "text-xl sm:text-2xl";
  return "text-2xl sm:text-3xl";
}
