import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

export function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground text-xs font-heading font-medium backdrop-blur-sm"
        >
          <WifiOff className="w-3.5 h-3.5" />
          Offline — Using cached rates
        </motion.div>
      )}
      {showReconnect && online && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/90 text-foreground text-xs font-heading font-medium backdrop-blur-sm"
        >
          <Wifi className="w-3.5 h-3.5" />
          Back online — Rates refreshed
        </motion.div>
      )}
    </AnimatePresence>
  );
}
