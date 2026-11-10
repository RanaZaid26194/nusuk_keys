"use client";

import React, { ReactNode, useEffect, useId, useRef, useState } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "center" | "start" | "end";

const TAP_DISMISS_MS = 3500;

interface TooltipProps
{
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  align?: TooltipAlign;
  icon?: ReactNode;
  className?: string;
  containerClassName?: string;
  dotColor?: "emerald" | "sky" | "amber" | "rose" | "none";
  toggleOnTap?: boolean;
  wrap?: boolean;
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
  toggleOnTap = false,
  wrap = false,
}) =>
{
  const [isOpen, setIsOpen] = useState(false);
  const [autoDismiss, setAutoDismiss] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wasPointerRef = useRef(false);
  const tooltipId = useId();

  useEffect(() =>
  {
    if (!toggleOnTap || !isOpen)
      return;

    const handleOutsidePointerDown = (e: PointerEvent) =>
    {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target))
      {
        setIsOpen(false);
        setAutoDismiss(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) =>
    {
      if (e.key === "Escape")
      {
        setIsOpen(false);
        setAutoDismiss(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    let timer: ReturnType<typeof setTimeout> | null = null;
    if (autoDismiss)
    {
      timer = setTimeout(() =>
      {
        setIsOpen(false);
        setAutoDismiss(false);
      }, TAP_DISMISS_MS);
    }

    return () =>
    {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      if (timer)
        clearTimeout(timer);
    };
  }, [toggleOnTap, isOpen, autoDismiss]);

  if (!content)
    return <>{children}</>;

  // Position classes
  let positionClasses = "";
  let caretClasses = "";
  let transitionOrigin = "";
  const hoverFocusClasses = toggleOnTap
    ? "group-hover/tooltip:opacity-100 group-hover/tooltip:visible"
    : "group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible";
  const openStateClasses = isOpen
    ? "opacity-100 visible translate-x-0 translate-y-0"
    : "opacity-0 invisible";
  const displayClasses = toggleOnTap ? "block" : "hidden sm:block";
  const hoverTranslate = toggleOnTap ? "" : "group-focus-within/tooltip:translate-y-0";
  const hoverTranslateX = toggleOnTap ? "" : "group-focus-within/tooltip:translate-x-0";

  if (position === "top")
  {
    positionClasses = "bottom-full mb-2";
    caretClasses = "top-full -mt-1 border-r border-b";
    transitionOrigin = isOpen ? "translate-y-0" : `-translate-y-1 group-hover/tooltip:translate-y-0 ${hoverTranslate}`;
  }
  else if (position === "bottom")
  {
    positionClasses = "top-full mt-2";
    caretClasses = "bottom-full -mb-1 border-l border-t";
    transitionOrigin = isOpen ? "translate-y-0" : `translate-y-1 group-hover/tooltip:translate-y-0 ${hoverTranslate}`;
  }
  else if (position === "left")
  {
    positionClasses = "right-full mr-2 top-1/2 -translate-y-1/2";
    caretClasses = "left-full -ml-1 border-t border-r";
    transitionOrigin = isOpen ? "translate-x-0" : `-translate-x-1 group-hover/tooltip:translate-x-0 ${hoverTranslateX}`;
  }
  else if (position === "right")
  {
    positionClasses = "left-full ml-2 top-1/2 -translate-y-1/2";
    caretClasses = "right-full -mr-1 border-b border-l";
    transitionOrigin = isOpen ? "translate-x-0" : `translate-x-1 group-hover/tooltip:translate-x-0 ${hoverTranslateX}`;
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

  const handlePointerDownCapture = () =>
  {
    if (toggleOnTap)
      wasPointerRef.current = true;
  };

  const handleFocusCapture = () =>
  {
    if (!toggleOnTap)
      return;

    if (!wasPointerRef.current)
    {
      setAutoDismiss(false);
      setIsOpen(true);
    }
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) =>
  {
    if (!toggleOnTap)
      return;

    if (!(e.relatedTarget instanceof Node) || !containerRef.current?.contains(e.relatedTarget))
    {
      setIsOpen(false);
      setAutoDismiss(false);
    }
  };

  const handleClickCapture = () =>
  {
    if (!toggleOnTap)
      return;

    const fromPointer = wasPointerRef.current;
    wasPointerRef.current = false;

    if (fromPointer)
    {
      setIsOpen((prev) =>
      {
        const next = !prev;
        setAutoDismiss(next);
        return next;
      });
    }
  };

  const panelWrapClasses = wrap
    ? "max-w-[min(220px,calc(100vw-3rem))] whitespace-normal leading-snug"
    : "max-w-[calc(100vw-2rem)] max-w-xs whitespace-normal sm:whitespace-nowrap";

  return (
    <div
      ref={containerRef}
      onPointerDownCapture={handlePointerDownCapture}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onClickCapture={handleClickCapture}
      className={`${posClass} group/tooltip inline-flex ${containerClassName}`}
    >
      {children}

      <div
        id={tooltipId}
        role="tooltip"
        aria-hidden={toggleOnTap ? !isOpen : undefined}
        className={`${displayClasses} absolute ${positionClasses} ${alignClasses} z-50 pointer-events-none max-w-[calc(100vw-2rem)] ${transitionOrigin} ${openStateClasses} ${hoverFocusClasses} transition-all duration-150 ease-out select-none ${className}`}
      >
        {/* Caret pointing toward target */}
        <div className={`absolute ${caretClasses} ${caretAlignClasses} w-2 h-2 bg-zinc-900 border-zinc-700/80 rotate-45 pointer-events-none`} />

        {/* Floating pill container (protected against viewport overflow on all displays) */}
        <div className={`relative flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 text-zinc-100 text-[11px] font-medium border border-zinc-700/80 ring-1 ring-emerald-500/20 shadow-xl shadow-black/60 backdrop-blur-md w-max break-words ${panelWrapClasses}`}>
          {dotColor === "emerald" && (
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          )}
          {dotColor === "sky" && (
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
          )}
          {dotColor === "amber" && (
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          )}
          {dotColor === "rose" && (
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
          )}
          {icon && <span className="mt-0.5 flex-shrink-0">{icon}</span>}
          <span>{content}</span>
        </div>
      </div>
    </div>
  );
};
