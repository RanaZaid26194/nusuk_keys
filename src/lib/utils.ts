import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateNusukCode(rawCode: string): { isValid: boolean; errorKey?: 'errorPrefix' | 'errorLength' } {
  const code = rawCode.trim().toUpperCase();
  if (!code.startsWith("NG-")) {
    return { isValid: false, errorKey: "errorPrefix" };
  }
  if (code.length < 5) {
    return { isValid: false, errorKey: "errorLength" };
  }
  return { isValid: true };
}

export function getNusukDeepLink(code: string): string {
  const cleanCode = code.trim();
  return `https://services.nusuk.sa/app?p=27&id=${encodeURIComponent(cleanCode)}`;
}

export function calculateSuccessRate(upvotes?: number | null, downvotes?: number | null): number
{
  const safeUp = Math.max(0, Number(upvotes) || 0);
  const safeDown = Math.max(0, Number(downvotes) || 0);
  const total = safeUp + safeDown;
  if (total <= 0)
    return 100;
  return Math.round((safeUp / total) * 100);
}

export function formatTimeAgo(dateString?: string | null, lang?: Language): string
{
  if (!dateString)
    return lang === 'ar' ? 'الآن' : 'Just now';

  try
  {
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
      return lang === 'ar' ? 'الآن' : 'Just now';

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    // handles future clock skews gracefully
    if (diffSec < 60)
      return lang === 'ar' ? 'الآن' : 'Just now';

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60)
      return lang === 'ar' ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24)
      return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  }
  catch
  {
    return lang === 'ar' ? 'حديثاً' : 'Recently';
  }
}
