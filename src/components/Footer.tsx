"use client";

import React, { useState, useEffect } from "react";
import { Shield, ExternalLink, Github, Flag } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { checkReportRateLimit, recordReportRateLimit } from "@/lib/security";
import { playHapticSound } from "@/lib/audio";
import { Tooltip } from "./Tooltip";

interface FooterProps {
  lang: Language;
}

const FooterComponent: React.FC<FooterProps> = ({ lang }) =>
{
  const [syncTime, setSyncTime] = useState<string>("Live");
  const [cooldown, setCooldown] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const t = translations[lang];
  const isAr = lang === "ar";

  useEffect(() =>
  {
    const updateTime = () =>
    {
      const now = new Date();
      setSyncTime(now.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [isAr]);

  // Sync remaining cooldown on mount
  useEffect(() =>
  {
    const rateCheck = checkReportRateLimit();
    if (!rateCheck.allowed && rateCheck.waitSeconds)
      setCooldown(rateCheck.waitSeconds);
  }, []);

  // Cooldown countdown interval
  useEffect(() =>
  {
    if (cooldown <= 0)
      return;
    const timer = setInterval(() =>
    {
      setCooldown((prev) =>
      {
        if (prev <= 1)
        {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleReportClick = (e: React.MouseEvent) =>
  {
    e.preventDefault();
    playHapticSound('click');
    if (typeof window !== "undefined")
    {
      window.dispatchEvent(new CustomEvent("open-report-modal"));
    }
  };

  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto transition-colors pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:pb-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Disclaimer */}
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500 max-w-2xl">
            <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <p className={isAr ? "font-arabic" : ""}>{t.footer.disclaimer}</p>
          </div>

          {/* Quick Actions & Live Sync Indicator */}
          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-xs">
            {/* Live Sync Status with custom tooltip */}
            <Tooltip
              content={isAr ? "تزامن مباشر مع قاعدة بيانات Supabase" : "Real-time updates via Supabase"}
              position="top"
              align={isAr ? "end" : "start"}
              dotColor="emerald"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className={isAr ? "font-arabic" : ""}>
                  {t.footer.lastSync || "Live sync"}: <span className="font-mono">{syncTime}</span>
                </span>
              </div>
            </Tooltip>

            {/* Report a broken key with rate-limit protection and theme tooltip */}
            <div className="relative inline-flex items-center">
              <Tooltip
                content={
                  cooldown > 0
                    ? (t.footer.reportCooldown || "Please wait {s}s before reporting another key.").replace("{s}", cooldown.toString())
                    : (isAr ? "الإبلاغ عن رمز منتهي أو غير صالح للدعم" : "Report an expired or invalid key")
                }
                position="top"
                align={isAr ? "start" : "end"}
                dotColor={cooldown > 0 ? "amber" : "none"}
              >
                <button
                  type="button"
                  onPointerDown={(e) => {
                    if (e.pointerType === 'touch') {
                      handleReportClick(e);
                    }
                  }}
                  onClick={handleReportClick}
                  className={`group flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                    cooldown > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
                  }`}
                  aria-label={t.footer.reportBroken || "Report a broken key"}
                >
                  <Flag className={`w-3.5 h-3.5 transition-colors ${cooldown > 0 ? "text-amber-500 animate-pulse" : "text-zinc-400 group-hover:text-rose-500"}`} />
                  <span className={isAr ? "font-arabic" : ""}>
                    {cooldown > 0
                      ? (isAr ? `انتظر ${cooldown} ث` : `Wait ${cooldown}s`)
                      : (t.footer.reportBroken || "Report broken key")}
                  </span>
                </button>
              </Tooltip>

              {/* Toast warning on attempted spam/rate-limit hit - viewport safe, no screen overflow */}
              {showWarning && (
                <div
                  role="alert"
                  className="absolute bottom-full mb-2 right-0 sm:left-1/2 sm:-translate-x-1/2 rtl:left-0 rtl:right-auto sm:rtl:left-1/2 sm:rtl:-translate-x-1/2 z-30 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-zinc-900 dark:bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-xl max-w-[calc(100vw-2rem)] w-max max-w-xs text-center animate-in fade-in slide-in-from-bottom-1"
                >
                  {t.footer.reportCooldown?.replace("{s}", cooldown.toString()) || `Wait ${cooldown}s (anti-spam)`}
                </div>
              )}
            </div>

            {/* GitHub Repo */}
            <Tooltip
              content={isAr ? "استعراض الكود المصدري على GitHub" : "View source code on GitHub"}
              position="top"
              align={isAr ? "start" : "end"}
            >
              <a
                href="https://github.com/RanaZaid26194/nusuk_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                aria-label={t.footer.github || "GitHub Repository"}
              >
                <Github className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
                <span>{t.footer.github || "GitHub"}</span>
              </a>
            </Tooltip>

            {/* Official Nusuk Portal Link */}
            <Tooltip
              content={isAr ? "بوابة منصة خدمات نسك الرسمية" : "Official Saudi Nusuk Platform Portal"}
              position="top"
              align={isAr ? "start" : "end"}
              dotColor="emerald"
            >
              <a
                href="https://services.nusuk.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 text-xs text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                aria-label="services.nusuk.sa"
              >
                <span>services.nusuk.sa</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);
Footer.displayName = "Footer";
