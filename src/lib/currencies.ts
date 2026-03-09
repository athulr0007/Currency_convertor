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

export function getFlagUrl(currencyCode: string): string {
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
