"use client";

import React from "react";
import { motion } from "framer-motion";
import { TicketPercent } from "lucide-react";

const coupons = [
  { code: "BOO20%", desc: "Giảm 20% đơn hàng đầu" },
  { code: "BOO10%", desc: "Giảm 10% gói YouTube" },
  { code: "BOO15%", desc: "Giảm 15% gói gia đình" },
  { code: "WELCOME", desc: "Tặng 10k cho user mới" },
];

export function CouponTicker() {
  // Triple the coupons to ensure seamless infinite scroll
  const displayCoupons = [...coupons, ...coupons, ...coupons];

  return (
    <div className="w-full py-2 overflow-hidden">
      <div className="max-w-4xl mx-auto flex items-center">
        <motion.div
          className="flex whitespace-nowrap gap-12"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {displayCoupons.map((coupon, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                <TicketPercent size={14} className="text-primary" />
                <span className="text-primary font-black tracking-tighter text-sm">
                  {coupon.code}
                </span>
              </div>
              <span className="text-foreground/60 text-sm font-medium">
                {coupon.desc}
              </span>
              <span className="text-foreground/20 ml-8">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
