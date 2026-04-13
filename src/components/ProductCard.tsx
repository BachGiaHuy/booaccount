"use client";

import { motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { brandConfig, FALLBACK_FEATURES } from "@/lib/constants";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  brand: string;
  iconUrl?: string | null;
  features?: string[];
  isAvailable?: boolean;
}

const defaultBrand = { color: "#ffffff", border: "border-white/10", glow: "rgba(255, 255, 255, 0.1)" };

export function ProductCard({ id, slug, name, price, originalPrice, category, brand, iconUrl, features = [], isAvailable = true }: ProductCardProps) {
  const config = brandConfig[brand.toLowerCase()] || defaultBrand;
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Parse price string like "65.000đ" to 65000
    const numericPrice = parseInt(price.replace(/\D/g, ""));
    addToCart({ id, name, price: numericPrice, brand, iconUrl });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group h-full cursor-pointer relative"
    >
      <div className={cn(
        "relative rounded-3xl p-px bg-gradient-to-b from-border to-transparent h-full",
        "transition-all duration-500",
        config.border && `group-hover:${config.border}`
      )}>
        <div className="relative rounded-3xl bg-card p-5 md:p-8 overflow-hidden h-full flex flex-col shadow-theme">
          {/* Main Card Link Overlay */}
          <Link href={`/products/${slug}`} className="absolute inset-0 z-0" />

          {/* Subtle Ambient Glow - added pointer-events-none */}
          <div 
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-500 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 pointer-events-none"
            style={{ backgroundColor: config.color }}
          />

          <div className="relative z-10 flex flex-col h-full pointer-events-none">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-grow">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">
                  {category}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {name}
                </h3>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0",
                !iconUrl && "bg-card border border-border text-foreground group-hover:bg-primary group-hover:text-black",
                iconUrl && "bg-white p-1.5 shadow-lg",
                "transition-all duration-300"
              )}>
                {iconUrl ? (
                  <img src={iconUrl} alt={brand} className="w-full h-full object-contain" />
                ) : (
                  <div className="font-black uppercase text-xl">{brand[0]}</div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">Chỉ từ</span>
                  <span className="text-2xl md:text-3xl font-bold text-foreground">{price}</span>
                </div>
                {originalPrice && (
                  <span className="text-xs md:text-sm text-muted-foreground line-through decoration-primary/50 self-end mb-1">
                    {originalPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isAvailable ? "● Sẵn sàng giao ngay" : "○ Hết hàng"}
              </p>
            </div>

            <div className="flex-grow min-h-[160px]">
              <ul className="space-y-4 mb-8">
                {(features.length > 0 ? features : (FALLBACK_FEATURES[brand.toLowerCase()] || ["Bảo hành uy tín", "Hỗ trợ 24/7", "Giao hàng tự động", "Giá rẻ nhất"])).slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative z-20 flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="p-4 rounded-xl bg-card border border-border text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center group/btn pointer-events-auto"
              title="Thêm vào giỏ"
            >
              <ShoppingCart size={20} className="group-hover/btn:text-primary transition-colors" />
            </button>
            <Link
              href={`/checkout/${slug}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex-grow py-4 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300",
                "bg-primary text-black hover:scale-[1.02] neon-glow pointer-events-auto"
              )}
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
