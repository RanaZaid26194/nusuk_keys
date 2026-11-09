"use client";

import React from "react";
import { Shield, ExternalLink } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];
  const isAr = lang === "ar";

  return (
    <footer className="w-full border-t border-emerald-900/30 bg-[#050e0b]/90 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-slate-400 max-w-2xl">
          <Shield className="w-4 h-4 text-emerald-400/80 flex-shrink-0" />
          <p className={isAr ? "font-arabic" : ""}>{t.footer.disclaimer}</p>
        </div>

        {/* Official Nusuk Portal Link */}
        <a
          href="https://services.nusuk.sa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors"
        >
          <span>services.nusuk.sa</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};
