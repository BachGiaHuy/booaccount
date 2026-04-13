"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShoppingCart, ArrowLeft, Ticket, X, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { validateCouponAction } from "@/app/actions/coupons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    totalItems, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    discountAmount,
    finalPrice 
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError(null);

    const result = await validateCouponAction(couponCode);
    setIsApplying(false);

    if (result.success) {
      applyCoupon(result.coupon);
      setCouponCode("");
    } else {
      setCouponError(result.error || "Mã không hợp lệ.");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại tất cả sản phẩm</span>
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              Giỏ hàng <span className="text-primary">của bạn</span>
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={14} /> Bạn đang có {totalItems} sản phẩm trong giỏ
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center rounded-[3rem] bg-white/5 border border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-8">Bạn chưa chọn dịch vụ nào. Hãy khám phá ngay nhé!</p>
            <Link 
              href="/products"
              className="px-8 py-4 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all inline-block"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* List Items */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg flex-shrink-0">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black font-black text-2xl uppercase">
                          {item.brand[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-xl font-bold text-white mb-0.5">{item.name}</h3>
                      <p className="text-xs text-primary font-bold mb-2 uppercase tracking-widest">
                        {item.durationLabel}
                      </p>
                      <p className="text-sm text-foreground/60">
                        {item.price.toLocaleString()}đ / gói
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.duration)}
                        className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1, item.duration)}
                        className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                       <p className="text-lg font-black text-white">{(item.price * item.quantity).toLocaleString()}đ</p>
                       <button 
                        onClick={() => removeFromCart(item.id, item.duration)}
                        className="text-red-500 hover:text-red-400 p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl space-y-8">
                <h3 className="text-2xl font-bold text-white">Tổng cộng</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString()}đ</span>
                  </div>
                  
                  {/* Coupon Input Area */}
                  <div className="py-4 border-y border-white/5 space-y-3">
                    <p className="text-xs font-bold text-white uppercase tracking-widest px-1">Mã giảm giá</p>
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <input
                            type="text"
                            placeholder="Nhập mã của bạn..."
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all uppercase"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={isApplying || !couponCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-primary text-black text-[10px] font-black hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                          >
                            {isApplying ? <Loader2 size={14} className="animate-spin" /> : "ÁP DỤNG"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1">
                            <X size={10} /> {couponError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-primary" />
                          <div>
                            <p className="text-xs font-black text-white uppercase">{appliedCoupon.code}</p>
                            <p className="text-[10px] text-primary font-bold">
                              Đã giảm {appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : `${appliedCoupon.value.toLocaleString()}đ`}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={removeCoupon}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Giảm giá</span>
                    <span className="text-primary font-bold">
                      {discountAmount > 0 ? `-${discountAmount.toLocaleString()}đ` : "0đ"}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-white font-bold">Thành tiền</span>
                    <div className="text-right">
                       <p className="text-3xl font-black text-primary">{finalPrice.toLocaleString()}đ</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Đã bao gồm VAT</p>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full py-5 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] neon-glow transition-all group"
                >
                  Thanh toán ngay
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-widest leading-relaxed">
                  Bằng cách nhấn thanh toán, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
