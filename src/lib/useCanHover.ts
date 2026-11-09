"use client";

import { useEffect, useState } from "react";

// detect whether the user has a true hovering pointer (mouse/trackpad) vs a touch screen
export function useCanHover(): boolean
{
  const [canHover, setCanHover] = useState(false);

  useEffect(() =>
  {
    if (typeof window === "undefined" || !window.matchMedia)
      return;

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);

    const handler = (e: MediaQueryListEvent) =>
    {
      setCanHover(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return canHover;
}
