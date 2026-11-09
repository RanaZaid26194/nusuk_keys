"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    // check actual current theme from documentElement to avoid any state desync
    const isCurrentlyDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const nextTheme: ResolvedTheme = isCurrentlyDark ? "light" : "dark";
    setThemeMode(nextTheme);
    setResolvedTheme(nextTheme);
    saveThemeMode(nextTheme);
  };

  const label = isAr
    ? (resolvedTheme === "dark" ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن")
    : (resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme");

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      aria-label={label}
      title={label}
      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors flex items-center justify-center relative overflow-hidden"
    >
      <span className="relative w-4 h-4 flex items-center justify-center pointer-events-none">
        <Sun className="w-4 h-4 text-amber-600 dark:hidden transition-transform duration-200 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
        <Moon className="w-4 h-4 text-amber-300 hidden dark:block transition-transform duration-200 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      </span>
    </motion.button>
  );
};
