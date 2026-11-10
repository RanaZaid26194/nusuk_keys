// theme management helper logic
import { safeGet, safeSet } from "@/lib/safeStorage";

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'nusuk_theme_mode';

// check system preference safely
export function getSystemTheme(): ResolvedTheme
{
  if (typeof window === 'undefined')
    return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// read stored mode from localstorage
export function getStoredThemeMode(): ThemeMode
{
  const stored = safeGet(THEME_STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system')
    return stored;
  return 'system';
}

// resolve theme based on mode
export function resolveTheme(mode: ThemeMode): ResolvedTheme
{
  if (mode === 'system')
    return getSystemTheme();
  return mode;
}

// apply theme classes and html attributes
export function applyTheme(resolved: ResolvedTheme): void
{
  if (typeof document === 'undefined')
    return;
  const root = document.documentElement;
  if (resolved === 'dark')
  {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  }
  else
  {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}

// save user choice and update dom
export function saveThemeMode(mode: ThemeMode): ResolvedTheme
{
  safeSet(THEME_STORAGE_KEY, mode);
  const resolved = resolveTheme(mode);
  applyTheme(resolved);
  return resolved;
}
