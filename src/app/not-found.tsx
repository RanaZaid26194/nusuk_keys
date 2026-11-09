import React from "react";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound()
{
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors">
      {/* Soft emerald and gold ambient radial glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none -z-0 opacity-40 dark:opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, rgba(212, 175, 55, 0.15) 50%, transparent 80%)"
        }}
      />

      {/* Islamic geometric pattern (Rub el Hizb) watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.025] -z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none' stroke='%23d4af37' stroke-width='0.75'%3E%3Crect x='15' y='15' width='18' height='18'/%3E%3Crect x='15' y='15' width='18' height='18' transform='rotate(45 24 24)'/%3E%3Ccircle cx='24' cy='24' r='2' fill='%23d4af37'/%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23d4af37' stroke-dasharray='2 3' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)"
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
        {/* Compass Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
          404 ERROR
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-sm mx-auto">
          The page or challenge key directory you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return to Keys Directory</span>
        </Link>
      </div>
    </div>
  );
}
