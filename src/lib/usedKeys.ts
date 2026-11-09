// local history helper for used keys
export const STORAGE_KEY_USED = "nusuk_used_keys_v1";
export const MAX_USED_ENTRIES = 2000;

// normalize key code to upper trimmed
export function normalizeCode(code: string): string
{
  return (code || "").trim().toUpperCase();
}

// read map from local storage safely
export function loadUsedKeys(): Record<string, number>
{
  try
  {
    if (typeof window === "undefined" || !window.localStorage)
      return {};
    const raw = window.localStorage.getItem(STORAGE_KEY_USED);
    if (!raw)
      return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      return parsed;
    return {};
  }
  catch
  {
    return {};
  }
}

// save map and trim oldest entries if exceeding cap
export function saveUsedKeys(map: Record<string, number>): void
{
  try
  {
    if (typeof window === "undefined" || !window.localStorage)
      return;

    const entries = Object.entries(map);
    let finalMap = map;

    // drop oldest when over 2000
    if (entries.length > MAX_USED_ENTRIES)
    {
      entries.sort((a, b) => b[1] - a[1]);
      finalMap = Object.fromEntries(entries.slice(0, MAX_USED_ENTRIES));
    }

    window.localStorage.setItem(STORAGE_KEY_USED, JSON.stringify(finalMap));
  }
  catch
  {
    // quota exceeded or storage disabled
  }
}

// mark a code as used with current timestamp
export function markUsed(code: string): Record<string, number>
{
  const normalized = normalizeCode(code);
  if (!normalized)
    return loadUsedKeys();

  const current = loadUsedKeys();
  const updated = {
    ...current,
    [normalized]: Date.now()
  };

  saveUsedKeys(updated);
  return updated;
}

// unmark code so it returns to main tabs
export function unmarkUsed(code: string): Record<string, number>
{
  const normalized = normalizeCode(code);
  const current = loadUsedKeys();
  if (!current[normalized])
    return current;

  const copy = { ...current };
  delete copy[normalized];

  saveUsedKeys(copy);
  return copy;
}

// wipe all used history
export function clearUsedKeys(): void
{
  try
  {
    if (typeof window !== "undefined" && window.localStorage)
      window.localStorage.removeItem(STORAGE_KEY_USED);
  }
  catch
  {
    // storage disabled
  }
}
