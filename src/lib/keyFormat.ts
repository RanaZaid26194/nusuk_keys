// strict key format constants and validation helpers
export const KEY_PREFIX = "NG-";
export const KEY_BODY_LENGTH = 8;
export const KEY_TOTAL_LENGTH = KEY_PREFIX.length + KEY_BODY_LENGTH; // 11
export const KEY_REGEX = new RegExp(`^${KEY_PREFIX}[A-Za-z0-9]{${KEY_BODY_LENGTH}}$`);

// convert Eastern Arabic & Persian numerals (٠-٩ and ۰-۹) to standard 0-9 digits
export function normalizeNumerals(str?: string | null): string
{
  if (!str || typeof str !== "string")
    return "";

  return str
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
}

// check if a code matches NG- followed by exactly 8 alphanumeric characters
export function isValidKey(code?: string | null): boolean
{
  if (!code || typeof code !== "string")
    return false;

  const normalized = normalizeNumerals(code.trim());
  return KEY_REGEX.test(normalized);
}

// sanitize input: keep NG- prefix, strip non-alphanumeric body characters, cap at 8, preserve case
export function sanitizeKeyInput(raw?: string | null): string
{
  if (!raw || typeof raw !== "string")
    return KEY_PREFIX;

  // 1. strip zero width chars, invisible unicode, newlines and outer whitespace
  const clean = raw.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "").trim();

  // 2. convert Arabic-Indic and Persian numerals to ASCII digits
  const withAsciiDigits = normalizeNumerals(clean);

  // 3. check if string contains an explicit 8-character NG- key anywhere (e.g. inside a URL or WhatsApp message)
  const ng8Match = withAsciiDigits.match(/\bng-([A-Za-z0-9]{8})\b/i);
  if (ng8Match)
    return KEY_PREFIX + ng8Match[1];

  // 4. check for nusuk deep-link query parameter ?id=... or &id=...
  const urlParamMatch = withAsciiDigits.match(/[?&]id=(?:ng-)?([A-Za-z0-9]{8})\b/i);
  if (urlParamMatch)
    return KEY_PREFIX + urlParamMatch[1];

  // 5. if input is a URL or full sentence with multiple words, only accept if an explicit ng- is present
  const isMultiWordOrUrl = withAsciiDigits.includes("http") || withAsciiDigits.includes("://") || /\s/.test(withAsciiDigits);
  if (isMultiWordOrUrl)
  {
    const anyNgMatch = withAsciiDigits.match(/ng-([A-Za-z0-9]{1,8})/i);
    if (anyNgMatch)
      return KEY_PREFIX + anyNgMatch[1];
    // Pasted random text without any NG- prefix: do not convert garbage into a fake key!
    return KEY_PREFIX;
  }

  // 6. standard typing/paste: strip single leading ng- prefix only once so body starting with ng is preserved
  let bodyOnly = withAsciiDigits;
  if (/^ng-/i.test(bodyOnly))
    bodyOnly = bodyOnly.slice(3);

  // 7. keep only letters and numbers, cap at exactly 8 chars, preserving case
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
