"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const banners = [
  "/img/slider/banner1.png",
  "/img/slider/banner2.png",
  "/img/slider/banner3.png",
  "/img/slider/banner4.png",
];

export function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.98,
    }),
  };

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = banners.length - 1;
      if (nextIndex >= banners.length) nextIndex = 0;
      return nextIndex;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  // Handle showing 2 images: currently [index, (index + 1) % length]
  const nextItemIndex = (currentIndex + 1) % banners.length;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 mb-8 md:mb-12 group">
      <div className="relative h-[160px] md:h-[260px] w-full overflow-hidden rounded-[2rem] bg-card/10 border border-border">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 40 },
              opacity: { duration: 0.3 }
            }}
            className="absolute inset-0 w-full h-full grid grid-cols-2 gap-4 p-0 md:p-0"
          >
            <div className="relative h-full w-full overflow-hidden group/img">
              <img
                src={banners[currentIndex]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                style={{ 
                  imageRendering: "auto",
                  filter: "brightness(0.85) contrast(1.05)"
                }}
                alt={`Banner ${currentIndex + 1}`}
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-4 group-hover/img:translate-y-0">
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-full bg-primary text-black font-extrabold text-sm shadow-[0_0_25px_rgba(0,255,163,0.5)] hover:scale-110 transition-transform"
                >
                  Mua ngay
                </Link>
              </div>
            </div>
            <div className="relative h-full w-full overflow-hidden group/img">
              <img
                src={banners[nextItemIndex]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                style={{ 
                  imageRendering: "auto",
                  filter: "brightness(0.85) contrast(1.05)"
                }}
                alt={`Banner ${nextItemIndex + 1}`}
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-4 group-hover/img:translate-y-0">
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-full bg-primary text-black font-extrabold text-sm shadow-[0_0_25px_rgba(0,255,163,0.5)] hover:scale-110 transition-transform"
                >
                  Mua ngay
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => paginate(-1)}
            className="w-10 h-10 rounded-full bg-card/40 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-black transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-10 h-10 rounded-full bg-card/40 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-black transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                currentIndex === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="absolute -inset-4 bg-primary/5 blur-[80px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
