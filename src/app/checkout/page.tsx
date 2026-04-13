"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VietQR } from "@/components/VietQR";
import { ChevronLeft, ShieldCheck, Zap, HeartHandshake, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { completeOrderAction } from "../actions/checkout"; // Need to update this action next
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function GenericCheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shouldSaveInfo, setShouldSaveInfo] = useState(true);

  useEffect(() => {
    setOrderId(`LUX${Math.random().toString(36).substring(7).toUpperCase()}`);
    
    // Load saved info
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("lux-user-email");
      const savedName = localStorage.getItem("lux-user-name");
      const savedPhone = localStorage.getItem("lux-user-phone");
      const savedAddress = localStorage.getItem("lux-user-address");
      
      if (savedEmail) setEmail(savedEmail);
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
    }
    
    // Redirect if cart is empty
    if (cart.length === 0) {
      const timer = setTimeout(() => router.push("/products"), 3000);
      return () => clearTimeout(timer);
    }
  }, [cart, router]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Giỏ hàng đang trống</h1>
          <p className="text-muted-foreground mb-8">Đang chuyển bạn về trang sản phẩm...</p>
          <Loader2 className="animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

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

    // Prepare items for the action
    const items = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      duration: item.duration,
      durationLabel: item.durationLabel
    }));

    // Pass customer details to the server action
    const result = await completeOrderAction(items, email, orderId, {
      name,
      phone,
      address
    });

    if (result.success) {
      // Save info to localStorage if requested
      if (typeof window !== "undefined") {
        if (shouldSaveInfo) {
          localStorage.setItem("lux-user-email", email);
          localStorage.setItem("lux-user-name", name);
          localStorage.setItem("lux-user-phone", phone);
          localStorage.setItem("lux-user-address", address);
        } else {
          localStorage.setItem("lux-user-email", email); // Always save email for dashboard
        }
      }
      
      clearCart();
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
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-12">
          <ChevronLeft size={18} />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-10">
          Xác nhận <span className="text-primary">Thanh toán</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="space-y-8">
              {/* Customer Info Section */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
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

              {/* Order Items Summary */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <ShoppingCart size={16} /> Tóm tắt đơn hàng
                </h3>
                
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.duration}`} className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1.5">
                           {item.iconUrl ? (
                             <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
                           ) : (
                             <span className="font-bold text-xs">{item.brand[0].toUpperCase()}</span>
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.1em]">{item.durationLabel}</p>
                          <p className="text-[10px] text-muted-foreground">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="text-white font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/5">
                    <span className="text-white">Tổng thanh toán:</span>
                    <span className="text-primary">{totalPrice.toLocaleString()}đ</span>
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
              <VietQR amount={totalPrice} orderId={orderId} />
              
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
                    "w-full py-5 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all flex items-center justify-center gap-2 mb-4 neon-glow",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>Đang xử lý... <Loader2 size={20} className="animate-spin" /></>
                  ) : (
                    <>Tôi đã thanh toán <ShieldCheck size={20} /></>
                  )}
                </button>
                <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-widest leading-relaxed">
                  Bấm "Tôi đã thanh toán" để hệ thống ưu tiên kiểm tra giao dịch và gửi tài khoản cho bạn.
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
