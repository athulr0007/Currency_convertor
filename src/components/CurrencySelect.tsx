import { currencyNames, cryptoMeta, isCrypto, getFlagUrl } from "@/lib/currencies";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Coins, Globe } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";

interface CurrencySelectProps {
  value: string;
  currencies: string[];
  onChange: (value: string) => void;
  label: string;
}

type Filter = "all" | "fiat" | "crypto";

export const CurrencySelect = memo(function CurrencySelect({
  value,
  currencies,
  onChange,
  label,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // ✅ on plain div, not motion.div

const updatePos = useCallback(() => {
  if (triggerRef.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.max(rect.width, 260);
    const viewportWidth = window.innerWidth;

    // Default: align to left edge of trigger
    let left = rect.left + window.scrollX;

    // If dropdown would overflow right edge, align to right edge of trigger instead
    if (rect.left + dropdownWidth > viewportWidth - 8) {
      left = rect.right + window.scrollX - dropdownWidth;
    }

    // Never go off left edge either
    left = Math.max(8 + window.scrollX, left);

    setDropdownPos({
      top: rect.bottom + window.scrollY + 6,
      left,
      width: rect.width,
    });
  }
}, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch("");
        setFilter("all");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onUpdate = () => updatePos();
    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
    };
  }, [open, updatePos]);

  const { fiatList, cryptoList } = useMemo(() => {
    const lower = search.toLowerCase();
    const match = (c: string) =>
      c.toLowerCase().includes(lower) ||
      (currencyNames[c] || "").toLowerCase().includes(lower);

    const fiat = currencies.filter((c) => !isCrypto(c) && match(c));
    const crypto = currencies
      .filter((c) => isCrypto(c) && match(c))
      .sort((a, b) => (cryptoMeta[a]?.rank || 9999) - (cryptoMeta[b]?.rank || 9999));

    return { fiatList: fiat, cryptoList: crypto };
  }, [currencies, search]);

  const displayFiat = filter !== "crypto" ? fiatList : [];
  const displayCrypto = filter !== "fiat" ? cryptoList : [];
  const totalResults = displayFiat.length + displayCrypto.length;
  const isCurrentCrypto = isCrypto(value);

  const closeDropdown = useCallback((selected: string) => {
    onChange(selected);
    setOpen(false);
    setSearch("");
    setFilter("all");
  }, [onChange]);

  const dropdown = (
    <AnimatePresence>
      {open && (
        // ✅ plain div holds the ref — motion.div handles animation only
        <div ref={dropdownRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 99999 }}>
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: Math.max(dropdownPos.width, 260),
              background: "rgba(14,14,18,0.99)",
              border: "1px solid rgba(240,180,41,0.18)",
              borderRadius: 14,
              boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04) inset",
              backdropFilter: "blur(28px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "min(380px, calc(100vh - 120px))",
            }}
          >
            {/* Search + filter pills */}
            <div style={{
              padding: "10px 10px 8px",
              borderBottom: "1px solid rgba(240,180,41,0.08)",
              flexShrink: 0,
            }}>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{
                  position: "absolute", left: 10, top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(245,240,232,0.3)", pointerEvents: "none",
                }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search currency or coin…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(240,180,41,0.14)",
                    borderRadius: 8,
                    padding: "8px 10px 8px 28px",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 12,
                    color: "#f5f0e8",
                    outline: "none",
                  }}
                />
              </div>

              {/* Filter pills */}
              <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                {(["all", "fiat", "crypto"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 100,
                      border: `1px solid ${filter === f ? "rgba(240,180,41,0.45)" : "rgba(240,180,41,0.1)"}`,
                      background: filter === f ? "rgba(240,180,41,0.12)" : "transparent",
                      color: filter === f ? "#f0b429" : "rgba(245,240,232,0.35)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10, letterSpacing: "0.08em",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {f === "crypto" && <Coins size={9} />}
                    {f === "fiat" && <Globe size={9} />}
                    {f.toUpperCase()}
                  </button>
                ))}
                <span style={{
                  marginLeft: "auto",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9, color: "rgba(245,240,232,0.2)",
                }}>
                  {totalResults}
                </span>
              </div>
            </div>

            {/* Scrollable list */}
            <div style={{ overflowY: "auto", padding: "6px", flex: 1 }}>
              {displayCrypto.length > 0 && (
                <>
                  <GroupHeader icon={<Coins size={9} />} label="CRYPTO" count={displayCrypto.length} gold />
                  {displayCrypto.map((c) => (
                    <CurrencyRow key={c} code={c} isSelected={c === value} isCryptoItem onChange={closeDropdown} />
                  ))}
                </>
              )}
              {displayFiat.length > 0 && (
                <>
                  <GroupHeader icon={<Globe size={9} />} label="FIAT" count={displayFiat.length} gold={false} />
                  {displayFiat.map((c) => (
                    <CurrencyRow key={c} code={c} isSelected={c === value} isCryptoItem={false} onChange={closeDropdown} />
                  ))}
                </>
              )}
              {totalResults === 0 && (
                <div style={{
                  padding: "24px 0", textAlign: "center",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11, color: "rgba(245,240,232,0.2)",
                }}>
                  No results for "{search}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col gap-1.5 flex-1" ref={ref} style={{ position: "relative" }}>
      {/* Label */}
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "9.5px", fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "rgba(245,240,232,0.28)",
      }}>
        {label}
      </span>

      
{/* Trigger button */}
<button
  ref={triggerRef}
  type="button"
  onClick={() => { updatePos(); setOpen((prev) => !prev); }}
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 10px",
    background: open ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${open ? "rgba(240,180,41,0.4)" : "rgba(240,180,41,0.15)"}`,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left" as const,
    overflow: "hidden", // ← prevent button itself from overflowing
    minWidth: 0,
  }}
>
  {/* Icon — fixed size, never shrinks */}
  <div style={{ flexShrink: 0 }}>
    {isCurrentCrypto && cryptoMeta[value]?.image ? (
      <img
        src={cryptoMeta[value].image}
        alt={value}
        style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    ) : (
      <img
        src={getFlagUrl(value)}
        alt={value}
        style={{ width: 22, height: 16, borderRadius: 3, objectFit: "cover", display: "block" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    )}
  </div>

  {/* Text — takes remaining space, truncates */}
  <div style={{
    display: "flex",
    flexDirection: "column",
    minWidth: 0,   // ← critical
    flex: 1,
    overflow: "hidden",
  }}>
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      fontWeight: 500,
      color: "#f5f0e8",
      letterSpacing: "0.04em",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}>
      {value.startsWith("c:") ? value.slice(2) : value}
    </span>
    <span style={{
      fontSize: 9,
      color: "rgba(245,240,232,0.35)",
      fontFamily: "'Outfit', sans-serif",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}>
      {currencyNames[value] || ""}
    </span>
  </div>

  {/* CRYPTO badge — hidden on very narrow, fixed width */}
  {isCurrentCrypto && (
    <span style={{
      fontSize: 8,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.06em",
      padding: "2px 4px",
      borderRadius: 3,
      background: "rgba(240,180,41,0.12)",
      border: "1px solid rgba(240,180,41,0.22)",
      color: "#f0b429",
      flexShrink: 0,
      whiteSpace: "nowrap",
    }}>
      CRYPTO
    </span>
  )}

  {/* Chevron — fixed, never shrinks */}
  <ChevronDown
    size={12}
    style={{
      color: "rgba(245,240,232,0.3)",
      flexShrink: 0,
      transition: "transform 0.2s",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
  />
</button>

      {/* Portal — renders into document.body, escapes all overflow/clip */}
      {createPortal(dropdown, document.body)}
    </div>
  );
});

// ── Group header ──────────────────────────────────────────────────────────────
function GroupHeader({ icon, label, count, gold }: {
  icon: React.ReactNode; label: string; count: number; gold: boolean;
}) {
  return (
    <div style={{
      padding: "6px 10px 4px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 9, letterSpacing: "0.14em",
      color: gold ? "#f0b429" : "rgba(245,240,232,0.3)",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {icon}{label} · {count}
    </div>
  );
}

// ── Currency row ──────────────────────────────────────────────────────────────
const CurrencyRow = memo(function CurrencyRow({ code, isSelected, isCryptoItem, onChange }: {
  code: string;
  isSelected: boolean;
  isCryptoItem: boolean;
  onChange: (c: string) => void;
}) {
  const displayCode = code.startsWith("c:") ? code.slice(2) : code;
  const meta = cryptoMeta[code];
  const rawChange = meta?.change24h;
  const change = rawChange != null && isFinite(rawChange) ? rawChange : undefined;

  return (
    <button
      type="button"
      onClick={() => onChange(code)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "7px 10px", borderRadius: 8,
        background: isSelected ? "rgba(240,180,41,0.1)" : "transparent",
        border: "none", cursor: "pointer",
        transition: "background 0.12s",
        textAlign: "left" as const,
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {isCryptoItem && meta?.image ? (
        <img src={meta.image} alt={displayCode}
          style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <img src={getFlagUrl(code)} alt={displayCode}
          style={{ width: 22, height: 15, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12, fontWeight: 500,
            color: isSelected ? "#f0b429" : "#f5f0e8",
            letterSpacing: "0.04em",
          }}>
            {displayCode}
          </span>
          {isCryptoItem && meta?.rank && (
            <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "rgba(240,180,41,0.45)" }}>
              #{meta.rank}
            </span>
          )}
        </div>
        <div style={{
          fontSize: 10, fontFamily: "'Outfit', sans-serif",
          color: "rgba(245,240,232,0.3)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {currencyNames[code] || ""}
        </div>
      </div>

      {isCryptoItem && change !== undefined && (
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: change >= 0 ? "#4ade80" : "#f87171",
          flexShrink: 0,
        }}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
      )}
    </button>
  );
});