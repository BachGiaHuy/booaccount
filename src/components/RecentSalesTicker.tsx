"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRecentSalesAction } from "@/app/actions/sales";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface SaleItem {
  id: string;
  email: string;
  productName: string;
  time: string;
}

export function RecentSalesTicker() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      const res = await getRecentSalesAction();
      if (res.success && res.data) {
        setSales(res.data);
      }
      setIsLoading(false);
    }
    fetchSales();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSales, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  // Duplicate items to ensure enough content for smooth loop
  const tripledSales = [...sales, ...sales, ...sales];

  return (
    <section className="py-12 bg-card/40 border-t border-border overflow-hidden relative group/ticker">
      {/* Decorative gradients for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      
      <div className="container mx-auto px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em]">Hoạt động mua hàng thời gian thực</h2>
        </div>
        <div className="text-[10px] font-medium text-foreground/20 italic group-hover/ticker:text-primary/40 transition-colors">
          Đã xác thực bởi hệ thống
        </div>
      </div>

      <div className="flex select-none">
        <motion.div 
          className="flex gap-4 flex-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {tripledSales.map((sale, idx) => (
            <div 
              key={`${sale.id}-${idx}`}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border shadow-theme group hover:border-primary/30 transition-all pointer-events-auto shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart size={14} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold text-sm tracking-tight">{sale.email}</span>
                  <span className="text-[10px] text-foreground/40 font-medium">đã mua</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-black text-xs uppercase">{sale.productName}</span>
                  <span className="text-[9px] text-foreground/20 bg-foreground/10 px-2 py-0.5 rounded-lg">
                    {formatRelativeTime(sale.time)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
