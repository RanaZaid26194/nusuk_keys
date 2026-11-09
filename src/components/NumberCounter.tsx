"use client";

import React, { useEffect, useState, useRef } from "react";

interface NumberCounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  suffix = "",
  className = "",
  duration = 1100,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startValRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;
    const startVal = startValRef.current;
    const endVal = value;
    startTimeRef.current = null;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = Math.round(startVal + (endVal - startVal) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        startValRef.current = endVal;
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [value, duration]);

  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight tabular-nums ${className}`}>
      <span>{displayValue.toLocaleString()}</span>
      {suffix && <span className="text-emerald-600 dark:text-emerald-400 ml-0.5">{suffix}</span>}
    </span>
  );
};
