import { calculateSuccessRate } from "@/lib/utils";
import type { ChallengeKey } from "@/lib/types";

// Thresholds live here so badge UI and Verified tab never drift apart
export const VERIFIED_MIN_UPVOTES = 2;
export const VERIFIED_MIN_RATE = 75;
export const EXPIRED_DOWNVOTE_MARGIN = 3;
export const LIKELY_MIN_COPIES = 10;
// 0 = zero downvotes allowed, 0.1 = allow downvotes up to 10% of copies
export const LIKELY_MAX_DOWNVOTE_RATIO = 0;

export type KeyStatus = "expired" | "verified" | "likely" | "needs";

type KeyCounts = Pick<ChallengeKey, "upvotes" | "downvotes" | "copies_count"> |
{
  upvotes?: number | null;
  downvotes?: number | null;
  copies_count?: number | null;
};

function sanitizeCount(value?: number | null): number
{
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    return 0;

  return Math.floor(parsed);
}

// Single source of truth for card badges and the Verified Working tab
export function getKeyStatus(key: KeyCounts): KeyStatus
{
  const upvotes = sanitizeCount(key.upvotes);
  const downvotes = sanitizeCount(key.downvotes);
  const copies = sanitizeCount(key.copies_count);

  if (downvotes > upvotes + EXPIRED_DOWNVOTE_MARGIN)
    return "expired";

  const successRate = calculateSuccessRate(upvotes, downvotes);
  if (successRate >= VERIFIED_MIN_RATE && upvotes >= VERIFIED_MIN_UPVOTES)
    return "verified";

  if (copies >= LIKELY_MIN_COPIES && downvotes <= Math.floor(copies * LIKELY_MAX_DOWNVOTE_RATIO))
    return "likely";

  return "needs";
}
