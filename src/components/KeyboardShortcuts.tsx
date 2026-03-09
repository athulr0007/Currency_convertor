import { useEffect } from "react";

interface Props {
  onSwap: () => void;
  onFocusAmount: () => void;
  onConvert: () => void;
}

export function useKeyboardShortcuts({ onSwap, onFocusAmount, onConvert }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && e.key !== "Enter") return;

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onSwap();
      }
      if (e.key === "/" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        onFocusAmount();
      }
      if (e.key === "Enter") {
        onConvert();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSwap, onFocusAmount, onConvert]);
}
