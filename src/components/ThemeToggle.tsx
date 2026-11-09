"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { playHapticSound } from "@/lib/audio";
import {
  ThemeMode,
  ResolvedTheme,
  getStoredThemeMode,
  resolveTheme,
  saveThemeMode,
  applyTheme
} from "@/lib/theme";

interface ThemeToggleProps
{
  isAr?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isAr = false }) =>
{
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState<boolean>(false);

  // setup listener after mount so system preference updates live
  useEffect(() =>
  {
    setMounted(true);
    const stored = getStoredThemeMode();
    setThemeMode(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) =>
    {
      const currentStored = getStoredThemeMode();
      if (currentStored === "system")
      {
        const newResolved: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const handleToggle = () =>
  {
    playHapticSound("click");
    // toggle between light and dark
    const nextTheme: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    setResolvedTheme(nextTheme);
    saveThemeMode(nextTheme);
  };

  const label = isAr
    ? resolvedTheme === "dark"
      ? "تفعيل المظهر الفاتح"
      : "تفعيل المظهر الداكن"
    : resolvedTheme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme";

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors flex items-center justify-center relative overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ rotate: -45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Moon className="w-4 h-4 text-amber-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
