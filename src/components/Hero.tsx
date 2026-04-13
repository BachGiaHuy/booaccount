"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Search, TicketPercent } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CouponTicker } from "./CouponTicker";
import { BrandTicker } from "./BrandTicker";

const BADGE_TEXTS = [
  "Hệ thống giao tài khoản tự động 24/7",
  "Giao hàng siêu tốc chỉ trong 30 giây",
  "Bảo hành 1 đổi 1 suốt thời gian sử dụng",
  "Hỗ trợ kỹ thuật trực tuyến 24/7"
];

const SERVICES = ["Netflix", "Spotify", "Canva", "CapCut Pro", "YouTube Premium", "Google One"];
const DISCOUNTS = ["25%", "50%", "70%"];

const SEARCH_PLACEHOLDERS = [
  "Tìm Netflix Premium...",
  "Tìm Tài khoản Canva Pro...",
  "Tìm Spotify Family...",
  "Tìm Youtube Premium...",
  "Tìm Google Drive 2TB...",
  "Tìm CapCut Pro giá rẻ...",
  "Tìm ChatGPT Plus..."
];

export function Hero({ onSearch }: { onSearch: (query: string) => void }) {
  const [badgeIndex, setBadgeIndex] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [discountIndex, setDiscountIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const badgeInterval = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % BADGE_TEXTS.length);
    }, 3000);

    const serviceInterval = setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % SERVICES.length);
    }, 2000);

    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2000);

    const discountInterval = setInterval(() => {
      setDiscountIndex((prev) => (prev + 1) % DISCOUNTS.length);
    }, 2000);

    return () => {
      clearInterval(badgeInterval);
      clearInterval(serviceInterval);
      clearInterval(placeholderInterval);
      clearInterval(discountInterval);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden max-w-full min-h-[90vh] flex items-center justify-center">
      {/* Premium Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/hero-bg.png" 
          alt="Premium Background" 
          className="w-full h-full object-cover opacity-20 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-60" />
      </div>

      {/* Subtle Ambient Glows - Wrapped in a clipped container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] anima animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] anima animate-pulse-slow" />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-foreground/5 border border-border text-primary text-[9px] md:text-xs font-bold tracking-widest uppercase mb-8 justify-center max-w-[90vw]"
          >
            <Sparkles size={14} className="shrink-0" />
            <div className="flex items-center overflow-hidden h-5 max-w-full">
              <AnimatePresence mode="wait">
                <motion.span
                  key={badgeIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="whitespace-nowrap truncate max-w-[70vw] sm:max-w-none"
                >
                  {BADGE_TEXTS[badgeIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.2] md:leading-[1.1] tracking-tighter mb-6 md:mb-8 px-2"
          >
            Nâng Tầm <span className="text-primary neon-text">Giải Trí</span> <br /> 
            & Công Việc Của Bạn
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl text-base md:text-xl text-muted-foreground mb-6 md:mb-10 flex flex-col items-center gap-2 px-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-center max-w-full overflow-hidden px-2">
              <span className="text-sm md:text-xl">Sở hữu các tài khoản Premium đỉnh cao:</span>
              <div className="inline-flex items-center h-8">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={serviceIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary font-bold whitespace-nowrap text-sm md:text-xl"
                  >
                    {SERVICES[serviceIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-center max-w-full overflow-hidden px-2 mb-2">
              <span className="text-sm md:text-xl">với giá tiết kiệm đến</span>
              <div className="inline-flex items-center h-8">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={discountIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary font-black whitespace-nowrap text-lg md:text-3xl neon-text"
                  >
                    {DISCOUNTS[discountIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <p className="max-w-2xl text-center">
              Bảo hành <span className="text-primary font-black uppercase tracking-wider">trọn đời</span>, hỗ trợ tức thì.
            </p>
          </motion.div>

          {/* Scrolling Brand Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full"
          >
            <BrandTicker />
          </motion.div>

          {/* New Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="w-full max-w-4xl my-8 md:my-10 relative group"
          >
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute inset-y-0 left-5 md:left-6 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                <Search size={18} className="md:w-5 md:h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 md:h-16 pl-12 md:pl-14 pr-28 md:pr-32 rounded-2xl md:rounded-3xl bg-foreground/5 border border-foreground/10 text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-base md:text-lg font-medium"
              />
              
              {/* Animated Placeholder */}
              {!searchQuery && (
                <div className="absolute inset-y-0 left-12 md:left-14 flex items-center pointer-events-none h-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="text-foreground/30 text-base md:text-lg font-medium whitespace-nowrap"
                    >
                      {SEARCH_PLACEHOLDERS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 md:px-6 rounded-xl md:rounded-2xl bg-primary text-black font-bold hover:scale-105 active:scale-95 transition-all text-xs md:text-sm shadow-lg shadow-primary/20"
              >
                Tìm ngay
              </button>
            </form>
            
            {/* Subtle glow effect on focus */}
            <div className="absolute -inset-1 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-row items-center justify-center gap-2 md:gap-4 w-full px-2"
          >
            <Link
              href="#products"
              className="flex-1 max-w-[180px] flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-primary text-black text-[11px] md:text-base font-black hover:scale-105 transition-transform neon-glow"
            >
              Khám phá <span className="hidden xs:inline">gói cước</span>
              <ArrowRight size={14} className="md:w-[18px] md:h-[18px]" />
            </Link>
            <Link
              href="/policy"
              className="flex-1 max-w-[180px] flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground text-[11px] md:text-base font-bold hover:bg-foreground/10 transition-colors"
            >
              Chính sách
            </Link>
          </motion.div>

          <div className="w-full max-w-4xl mt-6 md:mt-8 mb-2">
            <CouponTicker />
          </div>

          {/* Trust badges */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.5
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16 border-t border-border pt-8 md:pt-10 w-full"
          >
            {[
              { label: "Khách hàng", value: "10K+" },
              { label: "Đơn hàng/ngày", value: "500+" },
              { label: "Thời gian giao", value: "~10s" },
              { label: "Đánh giá 5 sao", value: "99%" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-1 group cursor-default"
              >
                <span className="text-xl md:text-2xl font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors">{stat.value}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest text-center">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
