"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { playHapticSound } from "@/lib/audio";
import { Language } from "@/lib/types";
import { Tooltip } from "./Tooltip";

interface BackToTopProps
{
  lang?: Language;
  hide?: boolean;
}

export const BackToTop: React.FC<BackToTopProps> = ({ lang = "en", hide = false }) =>
{
  const [visible, setVisible] = useState(false);

  useEffect(() =>
  {
    const handleScroll = () =>
    {
      setVisible(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () =>
  {
    playHapticSound("click");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const label = lang === "ar" ? "العودة إلى الأعلى" : "Back to top";

  return (
    <AnimatePresence>
      {visible && !hide && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 rtl:right-auto rtl:left-4 sm:rtl:left-8 z-40 pb-[env(safe-area-inset-bottom)]"
        >
          <Tooltip
            content={label}
            position="top"
            align={lang === "ar" ? "start" : "end"}
            dotColor="emerald"
          >
            <motion.button
              type="button"
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              aria-label={label}
              className="p-3 rounded-full bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700/80 shadow-lg shadow-black/10 dark:shadow-black/50 backdrop-blur-md transition-colors flex items-center justify-center cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
