// Client & server-side rate limiting and input sanitization helpers

const RATE_LIMIT_KEY = "nusuk_submit_timestamps_v1";
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_BETWEEN_SUBMITS_MS = 15 * 1000; // 15 seconds cooldown

export interface ValidationResult {
  isValid: boolean;
  sanitizedCode?: string;
  errorMessage?: string;
}

// Strict sanitizer: strips any harmful chars, enforces standard NG code format
export function sanitizeAndValidateCode(rawInput: string): ValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { isValid: false, errorMessage: "Code is required" };
  }

  // Remove whitespace and convert to uppercase
  let code = rawInput.trim().toUpperCase();

  // Strip potential XSS or injection characters
  code = code.replace(/[<>'"`/\\;()&$]/g, "");

  // Must begin with NG-
  if (!code.startsWith("NG-")) {
    return { isValid: false, errorMessage: "Code must begin with 'NG-'" };
  }

  // Check format: NG- followed by 3 to 20 alphanumeric characters, hyphens, or underscores
  const codeRegex = /^NG-[A-Z0-9_-]{3,20}$/;
  if (!codeRegex.test(code)) {
    return {
      isValid: false,
      errorMessage: "Invalid code format (allowed: letters, numbers, hyphens)",
    };
  }

  return { isValid: true, sanitizedCode: code };
}

// Check local rate limits
export function checkSubmissionRateLimit(): { allowed: boolean; waitSeconds?: number } {
  if (typeof window === "undefined") return { allowed: true };

  try {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter out timestamps older than the window
    const activeTimestamps = timestamps.filter(t => now - t < WINDOW_DURATION_MS);

    // Check cooldown from the most recent submission
    if (activeTimestamps.length > 0) {
      const lastSubmit = Math.max(...activeTimestamps);
      const elapsedSinceLast = now - lastSubmit;
      if (elapsedSinceLast < COOLDOWN_BETWEEN_SUBMITS_MS) {
        const waitSeconds = Math.ceil((COOLDOWN_BETWEEN_SUBMITS_MS - elapsedSinceLast) / 1000);
        return { allowed: false, waitSeconds };
      }
    }

    // Check window limit
    if (activeTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      const oldest = Math.min(...activeTimestamps);
      const waitSeconds = Math.ceil((WINDOW_DURATION_MS - (now - oldest)) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

// Record a successful submission for rate limiting
export function recordSubmissionRateLimit() {
  if (typeof window === "undefined") return;

  try {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const updated = [...timestamps.filter(t => now - t < WINDOW_DURATION_MS), now];
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}
