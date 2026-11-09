// strict key format constants and validation helpers
export const KEY_PREFIX = "NG-";
export const KEY_BODY_LENGTH = 8;
export const KEY_TOTAL_LENGTH = KEY_PREFIX.length + KEY_BODY_LENGTH; // 11
export const KEY_REGEX = new RegExp(`^${KEY_PREFIX}[A-Za-z0-9]{${KEY_BODY_LENGTH}}$`);

// check if a code matches NG- followed by exactly 8 alphanumeric characters
export function isValidKey(code?: string | null): boolean
{
  if (!code || typeof code !== "string")
    return false;

  return KEY_REGEX.test(code.trim());
}

// sanitize input: keep NG- prefix, strip non-alphanumeric body characters, cap at 8, preserve case
export function sanitizeKeyInput(raw?: string | null): string
{
  if (!raw || typeof raw !== "string")
    return KEY_PREFIX;

  // strip zero width chars, invisible unicode, newlines and outer whitespace
  const clean = raw.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "").trim();

  // strip any existing ng- or ng prefix case-insensitively
  const bodyOnly = clean.replace(/^ng-?/i, "");

  // keep only letters and numbers, cap at exactly 8 chars, preserving case
  const sanitizedBody = bodyOnly.replace(/[^A-Za-z0-9]/g, "").slice(0, KEY_BODY_LENGTH);

  return KEY_PREFIX + sanitizedBody;
}

// count how many valid body characters have been entered so far
export function getBodyCharCount(code?: string | null): number
{
  if (!code || typeof code !== "string" || !code.startsWith(KEY_PREFIX))
    return 0;

  return Math.min(code.slice(KEY_PREFIX.length).length, KEY_BODY_LENGTH);
}
