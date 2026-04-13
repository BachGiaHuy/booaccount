"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VietQR } from "@/components/VietQR";
import { ChevronLeft, ShieldCheck, Zap, HeartHandshake, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import { completeOrderAction } from "../../actions/checkout";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackCustomerAction } from "../../actions/admin";
import { validateCouponAction, incrementCouponUsageAction } from "../../actions/coupons";
import { Ticket, Check, RefreshCw } from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Tất cả các Hooks phải ở trên cùng
  const unwrappedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [product, setProduct] = useState<any>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shouldSaveInfo, setShouldSaveInfo] = useState(true);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // 2. Sau đó mới đến các biến thông thường
  const productId = unwrappedParams.id;
  const selectedDuration = parseInt(searchParams.get("duration") || "1");

  useEffect(() => {
    const loadProduct = async () => {
      setIsProductLoading(true);
      setError(null);

      try {
        // Regex chuẩn cho UUID (8-4-4-4-12)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        let data = null;

        // 1. Thử tìm theo ID nếu khớp định dạng UUID
        if (isUUID) {
          const { data: idData } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .maybeSingle();
          data = idData;
        }

        // 2. Nếu không tìm thấy (hoặc không phải UUID), thử tìm theo SLUG
        if (!data) {
          const { data: slugData } = await supabase
            .from("products")
            .select("*")
            .eq("slug", productId)
            .maybeSingle();
          data = slugData;
        }

        if (data) {
          setProduct(data);
        } else {
          console.error("Không tìm thấy sản phẩm:", productId);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setIsProductLoading(false);
      }
    };

    loadProduct();

    // Tạo mã đơn hàng ngẫu nhiên cho phiên này
    setOrderId(`BOO${Math.random().toString(36).substring(7).toUpperCase()}`);
    
    // Tải thông tin đã lưu từ lần trước
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("boo-user-email");
      const savedName = localStorage.getItem("boo-user-name");
      const savedPhone = localStorage.getItem("boo-user-phone");
      const savedAddress = localStorage.getItem("boo-user-address");
      
      if (savedEmail) setEmail(savedEmail);
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
    }
  }, [productId]);

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Đang tải thông tin sản phẩm...</h1>
          <Loader2 className="animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Không tìm thấy sản phẩm này.</p>
          <Link href="/" className="text-primary hover:underline">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }



  const calculatePrice = (basePrice: number, months: number) => {
    if (months === 999) return basePrice * 10; // Canva Lifetime logic
    if (months <= 1) return basePrice;
    return basePrice + (months - 1) * (basePrice * 0.5);
  };

  const getDurationLabel = (months: number) => {
    if (months === 999) return "Vĩnh viễn";
    if (months >= 12 && months % 12 === 0) return `${months / 12} Năm`;
    return `${months} Tháng`;
  };

  const basePrice = product ? calculatePrice(product.price, selectedDuration) : 0;
  
  // Calculate discount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return (basePrice * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const discountAmount = getDiscountAmount();
  const currentPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    setCouponError(null);
    
    const result = await validateCouponAction(couponCode);
    
    if (result.success) {
      setAppliedCoupon(result.coupon);
      setCouponCode(""); // Clear after apply
    } else {
      setCouponError(result.error || "Mã không hợp lệ.");
      setAppliedCoupon(null);
    }
    setIsValidatingCoupon(false);
  };

  const handleConfirmPayment = async () => {
    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập email chính xác để nhận tài khoản.");
      return;
    }
    if (!name || !phone) {
      setError("Vui lòng nhập họ tên và số điện thoại để chúng tôi hỗ trợ bạn tốt nhất.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const items = [{
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: currentPrice,
      duration: selectedDuration,
      durationLabel: getDurationLabel(selectedDuration)
    }];

    const result = await completeOrderAction(
      items, 
      email, 
      orderId, 
      {
        name,
        phone,
        address
      },
      appliedCoupon ? {
        amount: discountAmount,
        couponCode: appliedCoupon.code
      } : undefined
    );

    if (result.success) {
      if (typeof window !== "undefined") {
        if (shouldSaveInfo) {
          localStorage.setItem("boo-user-email", email);
          localStorage.setItem("boo-user-name", name);
          localStorage.setItem("boo-user-phone", phone);
          localStorage.setItem("boo-user-address", address);
        } else {
          localStorage.setItem("boo-user-email", email);
        }
      }
      
      trackCustomerAction(email, name, phone);

      // Increment coupon usage if applied
      if (appliedCoupon) {
        incrementCouponUsageAction(appliedCoupon.id);
      }

      setTimeout(() => {
        router.push("/dashboard?new_order=true");
      }, 1500);
    } else {
      setError(result.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-24 max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8 md:mb-12">
          <ChevronLeft size={18} />
          Quay lại sản phẩm
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Order Summary */}
          <div className="lg:col-span-7">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-8">
              Xác nhận <span className="text-primary">Thanh toán</span>
            </h1>

            <div className="space-y-8">
              <div className="p-5 md:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
                  Thông tin cá nhân
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Họ và tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="0912 345 678"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Địa chỉ (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="Số 1, Đường ABC, Quận XYZ, TP..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-sm font-bold text-white mb-3 block">Email nhận tài khoản</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex items-center gap-2 mt-4">
                    <input 
                      type="checkbox" 
                      id="saveInfo"
                      checked={shouldSaveInfo}
                      onChange={(e) => setShouldSaveInfo(e.target.checked)}
                      className="accent-primary"
                    />
                    <label htmlFor="saveInfo" className="text-xs text-muted-foreground cursor-pointer">Lưu thông tin cho lần mua sau</label>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-8 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                      {product.brand === 'netflix' ? '📺' : product.brand === 'spotify' ? '🎵' : product.brand === 'google' ? '☁️' : '🎬'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Gói Premium {getDurationLabel(selectedDuration)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {appliedCoupon ? (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground line-through block">{basePrice.toLocaleString()}đ</span>
                        <span className="text-xl font-bold text-primary">{currentPrice.toLocaleString()}đ</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-white">{currentPrice.toLocaleString()}đ</span>
                    )}
                  </div>
                </div>

                {/* Voucher Input Area */}
                <div className="pt-6 border-t border-white/5">
                  {!appliedCoupon ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <input 
                            type="text" 
                            placeholder="Nhập mã giảm giá (nếu có)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                        </div>
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="px-6 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isValidatingCoupon ? <RefreshCw size={16} className="animate-spin" /> : "Áp dụng"}
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-red-400 ml-1 flex items-center gap-1.5"><AlertCircle size={12} /> {couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Check size={16} />
                        Mã "{appliedCoupon.code}" đã được áp dụng
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs text-white/40 hover:text-white transition-colors underline"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="text-white">{basePrice.toLocaleString()}đ</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">Giảm giá:</span>
                      <span className="text-primary font-bold">-{discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="text-white font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phương thức:</span>
                    <span className="text-white">VietQR / Chuyển khoản nội địa</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/5">
                    <span className="text-white">Tổng cộng:</span>
                    <span className="text-primary">{currentPrice.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Zap size={20} className="text-primary" />, title: "Tức thì", desc: "Giao ngay sau khi quét" },
                  { icon: <ShieldCheck size={20} className="text-primary" />, title: "Bảo mật", desc: "Thông tin mã hóa 100%" },
                  { icon: <HeartHandshake size={20} className="text-primary" />, title: "Hỗ trợ", desc: "CSKH 24/7 tận tâm" },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="mb-3">{item.icon}</div>
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <VietQR amount={currentPrice} orderId={orderId} />
              
              <div className="mt-8">
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
                
                <button 
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all flex items-center justify-center gap-2 mb-4 neon-glow",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      Đang xử lý...
                      <Loader2 size={20} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Tôi đã thanh toán
                      <ShieldCheck size={20} />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Bấm "Tôi đã thanh toán" để hệ thống ưu tiên kiểm tra giao dịch của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
