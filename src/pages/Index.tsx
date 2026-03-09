import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Zap, Loader2, Keyboard, TrendingUp } from "lucide-react";
import { CurrencySelect } from "@/components/CurrencySelect";
import { ConversionHistory } from "@/components/ConversionHistory";
import { MultiCurrencyView } from "@/components/MultiCurrencyView";
import { FloatingParticles } from "@/components/FloatingParticles";
import { FeeCalculator } from "@/components/FeeCalculator";
import { FavoriteCurrencies } from "@/components/FavoriteCurrencies";
import { CopyShareButtons } from "@/components/CopyShareButtons";
import { PercentageChange } from "@/components/PercentageChange";
import { QuickAmounts } from "@/components/QuickAmounts";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { detectUserCurrency, currencySymbols, ConversionRecord } from "@/lib/currencies";
import { formatCurrency, getResultFontSize } from "@/lib/formatNumber";

const Index = () => {
  const { currencies, loading, error, lastUpdated, fetchRates, convert, getRate } =
    useCurrencyRates();

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [swapAnim, setSwapAnim] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [history, setHistory] = useState<ConversionRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("conversionHistory") || "[]");
    } catch {
      return [];
    }
  });

  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userCurrency = detectUserCurrency();
    setFromCurrency(userCurrency);
    setToCurrency(userCurrency === "USD" ? "INR" : "USD");
  }, []);

  useEffect(() => {
    localStorage.setItem("conversionHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const amt = parseFloat(amount);
    if (!isNaN(amt) && amt > 0) {
      const converted = convert(amt, fromCurrency, toCurrency);
      setResult(converted);
      setShowResult(true);
    } else {
      setShowResult(false);
      setResult(null);
    }
  }, [amount, fromCurrency, toCurrency, convert]);

  const handleConvert = useCallback(() => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || result === null) return;
    const rate = getRate(fromCurrency, toCurrency);
    const record: ConversionRecord = {
      id: crypto.randomUUID(),
      from: fromCurrency,
      to: toCurrency,
      amount: amt,
      result,
      rate: rate || 0,
      timestamp: Date.now(),
    };
    setHistory((prev) => [record, ...prev].slice(0, 20));
  }, [amount, fromCurrency, toCurrency, result, getRate]);

  const handleSwap = useCallback(() => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 400);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  const handleReuse = (record: ConversionRecord) => {
    setFromCurrency(record.from);
    setToCurrency(record.to);
    setAmount(String(record.amount));
  };

  useKeyboardShortcuts({
    onSwap: handleSwap,
    onFocusAmount: () => amountRef.current?.focus(),
    onConvert: handleConvert,
  });

  const rate = getRate(fromCurrency, toCurrency);
  const amt = parseFloat(amount);
  const formattedResult = result !== null ? formatCurrency(result) : "";
  const resultFontSize = getResultFontSize(formattedResult);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --gold-100: #fef9ec;
          --gold-200: #fdefc7;
          --gold-300: #f9d97a;
          --gold-400: #f0b429;
          --gold-500: #c88a00;
          --gold-600: #9a6600;
          --obsidian: #0a0a0c;
          --obsidian-2: #111116;
          --obsidian-3: #18181f;
          --obsidian-4: #22222c;
          --obsidian-5: #2e2e3a;
          --glass-border: rgba(240, 180, 41, 0.12);
          --glass-bg: rgba(255, 255, 255, 0.028);
          --text-primary: #f5f0e8;
          --text-secondary: rgba(245, 240, 232, 0.5);
          --text-tertiary: rgba(245, 240, 232, 0.28);
        }

        * { box-sizing: border-box; }

        .premium-page {
          min-height: 100vh;
          background: var(--obsidian);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 48px 16px 80px;
          position: relative;
          overflow-x: hidden;
          font-family: 'Outfit', sans-serif;
        }

        /* ── BACKGROUND ── */
        .bg-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .bg-aurora {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 15% 30%, rgba(200,138,0,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 15%, rgba(240,180,41,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 60% 70% at 50% 90%, rgba(10,10,12,0.95) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 70% 55%, rgba(100,60,200,0.04) 0%, transparent 50%);
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(240,180,41,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,180,41,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 40%, transparent 100%);
        }
        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 100% 100% at 50% 0%, transparent 40%, rgba(10,10,12,0.8) 100%);
        }

        /* ── HEADER ── */
        .page-header {
          text-align: center;
          margin-bottom: 36px;
          position: relative;
          z-index: 10;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          background: linear-gradient(135deg, rgba(240,180,41,0.12), rgba(200,138,0,0.06));
          border: 1px solid rgba(240,180,41,0.25);
          margin-bottom: 18px;
          backdrop-filter: blur(8px);
        }
        .live-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold-400);
          box-shadow: 0 0 6px var(--gold-400), 0 0 12px rgba(240,180,41,0.4);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        .live-badge-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: var(--gold-400);
          text-transform: uppercase;
        }
        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.6rem, 6vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1;
          background: linear-gradient(135deg, var(--gold-300) 0%, var(--gold-400) 45%, var(--gold-300) 70%, #fff8e8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          filter: drop-shadow(0 2px 24px rgba(240,180,41,0.15));
        }
        .page-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          font-weight: 300;
        }

        /* ── MAIN CARD ── */
        .converter-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.018) 100%);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 64px rgba(0,0,0,0.5),
            0 0 80px rgba(240,180,41,0.04);
          position: relative;
          overflow: hidden;
        }
        .converter-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(240,180,41,0.4), transparent);
        }

        /* ── SECTION LABEL ── */
        .field-label {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
          display: block;
        }

        /* ── AMOUNT INPUT ── */
        .amount-wrapper {
          position: relative;
          margin-bottom: 8px;
        }
        .amount-symbol {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--gold-400);
          pointer-events: none;
          line-height: 1;
        }
        .amount-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(240,180,41,0.15);
          border-radius: 12px;
          padding: 16px 16px 16px 44px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -moz-appearance: textfield;
        }
        .amount-input::-webkit-outer-spin-button,
        .amount-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .amount-input::placeholder { color: rgba(245,240,232,0.18); }
        .amount-input:focus {
          border-color: rgba(240,180,41,0.4);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 0 3px rgba(240,180,41,0.06), 0 0 20px rgba(240,180,41,0.06);
        }

        /* ── QUICK AMOUNTS ── */
        .quick-amounts {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .quick-chip {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid rgba(240,180,41,0.15);
          background: rgba(240,180,41,0.04);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.04em;
        }
        .quick-chip:hover {
          border-color: rgba(240,180,41,0.4);
          color: var(--gold-300);
          background: rgba(240,180,41,0.09);
        }

        /* ── CURRENCY ROW ── */
        .currency-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-bottom: 24px;
        }
        .currency-row > *:not(.swap-btn-wrap) { flex: 1; }

        /* ── SWAP BUTTON ── */
        .swap-btn-wrap {
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .swap-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(240,180,41,0.12), rgba(200,138,0,0.06));
          border: 1px solid rgba(240,180,41,0.25);
          color: var(--gold-400);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .swap-btn:hover {
          background: linear-gradient(135deg, rgba(240,180,41,0.22), rgba(200,138,0,0.14));
          border-color: rgba(240,180,41,0.5);
          box-shadow: 0 0 16px rgba(240,180,41,0.15);
        }

        /* ── CONVERT BUTTON ── */
        .convert-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--gold-500) 0%, var(--gold-400) 50%, #e8a800 100%);
          border: none;
          color: var(--obsidian);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(240,180,41,0.25), 0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .convert-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .convert-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(240,180,41,0.35), 0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .convert-btn:active:not(:disabled) { transform: translateY(0); }
        .convert-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── RESULT CARD ── */
        .result-panel {
          margin-top: 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(240,180,41,0.06) 0%, rgba(200,138,0,0.03) 100%);
          border: 1px solid rgba(240,180,41,0.2);
          padding: 20px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .result-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(240,180,41,0.5), transparent);
        }
        .result-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--gold-300), var(--gold-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 6px;
        }
        .result-currency-code {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: var(--text-tertiary);
          letter-spacing: 0.1em;
          margin-left: 8px;
          -webkit-text-fill-color: unset;
        }
        .result-rate {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--text-tertiary);
          letter-spacing: 0.06em;
          margin-top: 4px;
        }

        /* ── DIVIDER ── */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(240,180,41,0.1), transparent);
          margin: 28px 0;
        }

        /* ── FOOTER ── */
        .page-footer {
          text-align: center;
          margin-top: 24px;
        }
        .footer-timestamp {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text-tertiary);
          letter-spacing: 0.08em;
        }
        .shortcuts-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.15s;
          margin-bottom: 8px;
        }
        .shortcuts-toggle:hover { color: var(--gold-400); background: rgba(240,180,41,0.05); }
        .shortcuts-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(240,180,41,0.1);
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .shortcut-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .shortcut-key {
          background: rgba(240,180,41,0.08);
          border: 1px solid rgba(240,180,41,0.2);
          border-radius: 5px;
          padding: 2px 8px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--gold-300);
          letter-spacing: 0.04em;
        }

        /* ── ERROR ── */
        .error-box {
          margin-top: 16px;
          text-align: center;
        }
        .error-text {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: #f87171;
          margin-bottom: 6px;
        }
        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--gold-400);
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.05em;
          padding: 0;
          transition: opacity 0.15s;
        }
        .retry-btn:hover { opacity: 0.7; }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(240,180,41,0.2); border-radius: 4px; }
      `}</style>

      <div className="premium-page">
        {/* Background layers */}
        <div className="bg-layer">
          <div className="bg-aurora" />
          <div className="bg-grid" />
          <div className="bg-vignette" />
        </div>

        <FloatingParticles />
        <OfflineIndicator />

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 520 }}
        >
          {/* Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <div className="live-badge">
              <div className="live-badge-dot" />
              <span className="live-badge-text">Live Rates</span>
            </div>
            <h1 className="page-title">Currency Converter</h1>
            <p className="page-subtitle">Real-time exchange rates · 150+ currencies</p>
          </motion.div>

          {/* Converter Card */}
          <motion.div
            className="converter-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {/* Amount */}
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Amount</label>
              <div className="amount-wrapper">
                <span className="amount-symbol">
                  {currencySymbols[fromCurrency] || fromCurrency}
                </span>
                <input
                  ref={amountRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
              <div className="quick-amounts">
                {[100, 500, 1000, 5000, 10000].map((v) => (
                  <button key={v} className="quick-chip" onClick={() => setAmount(String(v))}>
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency selectors */}
            <div className="currency-row">
              <CurrencySelect
                label="From"
                value={fromCurrency}
                currencies={currencies}
                onChange={setFromCurrency}
              />
              <div className="swap-btn-wrap">
                <motion.button
                  className="swap-btn"
                  onClick={handleSwap}
                  animate={{ rotate: swapAnim ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  title="Swap currencies (S)"
                >
                  <ArrowLeftRight size={16} />
                </motion.button>
              </div>
              <CurrencySelect
                label="To"
                value={toCurrency}
                currencies={currencies}
                onChange={setToCurrency}
              />
            </div>

            {/* Convert Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              disabled={loading || !amount}
              className="convert-btn"
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Loading rates…
                </span>
              ) : (
                "Convert & Save"
              )}
            </motion.button>

            {/* Result */}
            <AnimatePresence>
              {showResult && result !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="result-panel">
                    <motion.p
                      key={result}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="result-amount"
                    >
                      {currencySymbols[toCurrency] || ""}
                      {formattedResult}
                      <span className="result-currency-code">{toCurrency}</span>
                    </motion.p>
                    {rate && (
                      <p className="result-rate">
                        1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
                      </p>
                    )}
                    <PercentageChange
                      fromCurrency={fromCurrency}
                      toCurrency={toCurrency}
                      currentRate={rate}
                    />
                    <CopyShareButtons
                      amount={amt}
                      result={result}
                      fromCurrency={fromCurrency}
                      toCurrency={toCurrency}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">
                <p className="error-text">{error}</p>
                <button onClick={fetchRates} className="retry-btn">
                  <RefreshCw size={10} /> Retry
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Below-card sections */}
          <FavoriteCurrencies
            amount={amt || 0}
            fromCurrency={fromCurrency}
            convert={convert}
            onSelectCurrency={(c) => setToCurrency(c)}
          />

          {!isNaN(amt) && amt > 0 && result !== null && (
            <FeeCalculator
              amount={amt}
              result={result}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
            />
          )}

          {!isNaN(amt) && amt > 0 && (
            <MultiCurrencyView amount={amt} fromCurrency={fromCurrency} convert={convert} />
          )}

          <ConversionHistory
            history={history}
            onClear={() => setHistory([])}
            onReuse={handleReuse}
          />

          {/* Footer */}
          <div className="page-footer">
            <div>
              <button className="shortcuts-toggle" onClick={() => setShowShortcuts(!showShortcuts)}>
                <Keyboard size={11} />
                Keyboard shortcuts
              </button>
            </div>

            <AnimatePresence>
              {showShortcuts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: 16, overflow: "hidden" }}
                >
                  <div className="shortcuts-panel">
                    {[
                      { key: "S", label: "Swap currencies" },
                      { key: "A", label: "Focus amount field" },
                      { key: "↵", label: "Convert & save" },
                    ].map(({ key, label }) => (
                      <div className="shortcut-row" key={key}>
                        <span>{label}</span>
                        <kbd className="shortcut-key">{key}</kbd>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {lastUpdated && (
              <p className="footer-timestamp">
                Rates updated · {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Index;