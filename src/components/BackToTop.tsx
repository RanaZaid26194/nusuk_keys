"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { playHapticSound } from "@/lib/audio";
import { Language } from "@/lib/types";

interface BackToTopProps
{
  lang?: Language;
}

export const BackToTop: React.FC<BackToTopProps> = ({ lang = "en" }) =>
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
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-label={label}
          title={label}
          className="fixed bottom-20 sm:bottom-8 right-4 rtl:right-auto rtl:left-4 z-40 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200/90 dark:border-zinc-700/80 shadow-lg shadow-black/10 dark:shadow-black/40 backdrop-blur-md transition-colors"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
