// safe storage wrappers that never throw in ssr or private browsing

export const safeGet = (key: string): string | null =>
{
  try
  {
    if (typeof window === "undefined" || !window.localStorage)
      return null;
    return window.localStorage.getItem(key);
  }
  catch
  {
    return null;
  }
};

export const safeSet = (key: string, value: string): boolean =>
{
  try
  {
    if (typeof window === "undefined" || !window.localStorage)
      return false;
    window.localStorage.setItem(key, value);
    return true;
  }
  catch
  {
    return false;
  }
};

export const safeRemove = (key: string): boolean =>
{
  try
  {
    if (typeof window === "undefined" || !window.localStorage)
      return false;
    window.localStorage.removeItem(key);
    return true;
  }
  catch
  {
    return false;
  }
};
