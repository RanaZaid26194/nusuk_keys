"use client";

import React, { ReactNode } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "center" | "start" | "end";

interface TooltipProps
{
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  align?: TooltipAlign;
  icon?: ReactNode;
  className?: string;
  containerClassName?: string;
  dotColor?: "emerald" | "amber" | "rose" | "none";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  align = "center",
  icon,
  className = "",
  containerClassName = "",
  dotColor = "none",
}) =>
{
  if (!content)
    return <>{children}</>;

  // Position classes
  let positionClasses = "";
  let caretClasses = "";
  let transitionOrigin = "";

  if (position === "top")
  {
    positionClasses = "bottom-full mb-2";
    caretClasses = "top-full -mt-1 border-r border-b";
    transitionOrigin = "-translate-y-1 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0";
  }
  else if (position === "bottom")
  {
    positionClasses = "top-full mt-2";
    caretClasses = "bottom-full -mb-1 border-l border-t";
    transitionOrigin = "translate-y-1 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0";
  }
  else if (position === "left")
  {
    positionClasses = "right-full mr-2 top-1/2 -translate-y-1/2";
    caretClasses = "left-full -ml-1 border-t border-r";
    transitionOrigin = "-translate-x-1 group-hover/tooltip:translate-x-0 group-focus-within/tooltip:translate-x-0";
  }
  else if (position === "right")
  {
    positionClasses = "left-full ml-2 top-1/2 -translate-y-1/2";
    caretClasses = "right-full -mr-1 border-b border-l";
    transitionOrigin = "translate-x-1 group-hover/tooltip:translate-x-0 group-focus-within/tooltip:translate-x-0";
  }

  // Alignment classes for top/bottom
  let alignClasses = "";
  let caretAlignClasses = "";

  if (position === "top" || position === "bottom")
  {
    if (align === "center")
    {
      alignClasses = "left-1/2 -translate-x-1/2";
      caretAlignClasses = "left-1/2 -translate-x-1/2";
    }
    else if (align === "start")
    {
      alignClasses = "start-0";
      caretAlignClasses = "start-3.5";
    }
    else if (align === "end")
    {
      alignClasses = "end-0";
      caretAlignClasses = "end-3.5";
    }
  }

  const hasCustomPos = containerClassName.includes("fixed") || containerClassName.includes("absolute");
  const posClass = hasCustomPos ? "" : "relative";

  return (
    <div className={`${posClass} group/tooltip inline-flex ${containerClassName}`}>
      {children}

      <div
        role="tooltip"
        className={`hidden sm:block absolute ${positionClasses} ${alignClasses} z-50 pointer-events-none opacity-0 invisible max-w-[calc(100vw-2rem)] ${transitionOrigin} group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all duration-150 ease-out select-none ${className}`}
      >
        {/* Caret pointing toward target */}
        <div className={`absolute ${caretClasses} ${caretAlignClasses} w-2 h-2 bg-zinc-900 border-zinc-700/80 rotate-45 pointer-events-none`} />

        {/* Floating pill container (protected against viewport overflow on all displays) */}
        <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/95 text-zinc-100 text-[11px] font-medium border border-zinc-700/80 ring-1 ring-emerald-500/20 shadow-xl shadow-black/60 backdrop-blur-md max-w-[calc(100vw-2rem)] w-max max-w-xs whitespace-normal sm:whitespace-nowrap break-words">
          {dotColor === "emerald" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          )}
          {dotColor === "amber" && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          )}
          {dotColor === "rose" && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
          )}
          {icon && <span className="flex-shrink-0 text-emerald-400">{icon}</span>}
          <span>{content}</span>
        </div>
      </div>
    </div>
  );
};
