"use client";

import React, { useState, useEffect } from "react";
import { Shield, ExternalLink, Github, Flag, Activity } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const [syncTime, setSyncTime] = useState<string>("Live");
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
            {/* Live Sync Status */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className={isAr ? "font-arabic" : ""}>
                {t.footer.lastSync || "Live sync"}: <span className="font-mono">{syncTime}</span>
              </span>
            </div>

            {/* Report a broken key */}
            <a
              href="mailto:support@nusuk-keys.org?subject=Report%20Broken%20Nusuk%20Key&body=Hello,%20I%20would%20like%20to%20report%20this%20expired/broken%20key:%20NG-"
              className="group flex items-center gap-1 text-xs text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
              title={t.footer.reportBroken || "Report a broken key"}
            >
              <Flag className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-500 transition-colors" />
              <span className={isAr ? "font-arabic" : ""}>{t.footer.reportBroken || "Report broken key"}</span>
            </a>

            {/* GitHub Repo */}
            <a
              href="https://github.com/RanaZaid26194/nusuk_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
              title={t.footer.github || "GitHub Repository"}
            >
              <Github className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              <span>{t.footer.github || "GitHub"}</span>
            </a>

            {/* Official Nusuk Portal Link */}
            <a
              href="https://services.nusuk.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-xs text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
            >
              <span>services.nusuk.sa</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
