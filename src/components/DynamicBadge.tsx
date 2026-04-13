"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DynamicBadgeProps {
  items: string[];
  icon: React.ReactNode;
  className?: string;
  duration?: number;
}

export function DynamicBadge({ items, icon, className, duration = 3000 }: DynamicBadgeProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, duration);

    return () => clearInterval(interval);
  }, [items, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-full bg-primary/10 border border-border/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 max-w-full",
        className
      )}
    >
      <div className="shrink-0 scale-90 md:scale-100">
        {icon}
      </div>
      
      <div className="relative h-5 overflow-hidden flex items-center max-w-[calc(100vw-80px)] sm:max-w-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="whitespace-nowrap inline-block truncate"
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
