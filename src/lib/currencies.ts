// ── FIAT MAPS ──────────────────────────────────────────────────────────────
export const currencyToCountry: Record<string, string> = {
  USD: "us", INR: "in", GBP: "gb", EUR: "eu", JPY: "jp",
  CAD: "ca", AUD: "au", CNY: "cn", SGD: "sg", AED: "ae",
  CHF: "ch", SEK: "se", NZD: "nz", ZAR: "za", BRL: "br",
  KRW: "kr", MXN: "mx", THB: "th", MYR: "my", PHP: "ph",
  IDR: "id", TRY: "tr", RUB: "ru", PLN: "pl", HKD: "hk",
  TWD: "tw", NOK: "no", DKK: "dk", CZK: "cz", HUF: "hu",
  ILS: "il", CLP: "cl", ARS: "ar", COP: "co", PEN: "pe",
  EGP: "eg", NGN: "ng", KES: "ke", PKR: "pk", BDT: "bd",
  VND: "vn", SAR: "sa", QAR: "qa", KWD: "kw", BHD: "bh",
  OMR: "om", JOD: "jo", LKR: "lk", MMK: "mm", NPR: "np",
};

export const countryCurrencyMap: Record<string, string> = {
  US: "USD", IN: "INR", GB: "GBP", EU: "EUR", JP: "JPY",
  CA: "CAD", AU: "AUD", CN: "CNY", SG: "SGD", AE: "AED",
};

export const currencyNames: Record<string, string> = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
  INR: "Indian Rupee", CAD: "Canadian Dollar", AUD: "Australian Dollar",
  CHF: "Swiss Franc", CNY: "Chinese Yuan", SGD: "Singapore Dollar",
  AED: "UAE Dirham", BRL: "Brazilian Real", KRW: "South Korean Won",
  MXN: "Mexican Peso", THB: "Thai Baht", SEK: "Swedish Krona",
  NZD: "New Zealand Dollar", ZAR: "South African Rand",
  TRY: "Turkish Lira", PLN: "Polish Zloty", HKD: "Hong Kong Dollar",
  NOK: "Norwegian Krone", DKK: "Danish Krone", MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso", IDR: "Indonesian Rupiah", RUB: "Russian Ruble",
};

export const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
  CAD: "C$", AUD: "A$", CHF: "CHF", CNY: "¥", SGD: "S$",
  AED: "د.إ", BRL: "R$", KRW: "₩", MXN: "MX$", THB: "฿",
  SEK: "kr", NZD: "NZ$", ZAR: "R", TRY: "₺", PLN: "zł",
};

// ── CRYPTO DYNAMIC REGISTRY ────────────────────────────────────────────────
export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h?: number;
}

export const cryptoCurrencies = new Set<string>();
export const cryptoMeta: Record<string, { name: string; image: string; rank: number; change24h?: number }> = {};

// Called once after CoinGecko fetch — populates crypto sets at runtime
export function registerCrypto(coins: CoinGeckoCoin[], fiatRates: Record<string, number>) {
  // Clear previous to avoid stale data on refresh
  cryptoCurrencies.clear();
  Object.keys(cryptoMeta).forEach((k) => delete cryptoMeta[k]);

  coins.forEach((coin) => {
    const rawCode = coin.symbol.toUpperCase();
    // Prefix with "c:" if code clashes with a real fiat currency
    const code = fiatRates[rawCode] !== undefined ? `c:${rawCode}` : rawCode;

    cryptoCurrencies.add(code);
    cryptoMeta[code] = {
      name: coin.name,
      image: coin.image,
      rank: coin.market_cap_rank,
      change24h: coin.price_change_percentage_24h,
    };

    // Also expose symbol for display
    currencySymbols[code] = rawCode; // show ticker as symbol fallback
    currencyNames[code] = coin.name;
  });
}

export function isCrypto(code: string): boolean {
  return cryptoCurrencies.has(code);
}

export function getFlagUrl(currencyCode: string): string {
  if (isCrypto(currencyCode)) return ""; // handled separately via cryptoMeta image
  const country = currencyToCountry[currencyCode] || currencyCode.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/24x18/${country}.png`;
}

export function detectUserCurrency(): string {
  try {
    const locale = Intl.NumberFormat().resolvedOptions().locale;
    const region = new Intl.Locale(locale).region || "US";
    return countryCurrencyMap[region] || "USD";
  } catch {
    return "USD";
  }
}

export interface ConversionRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}