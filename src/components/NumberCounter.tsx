"use client";

import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface NumberCounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  suffix = "",
  className = "",
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 75,
    damping: 18,
  });

  const display = useTransform(springVal, (current) => {
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <motion.span>{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
