"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Key, Calendar, ExternalLink, Mail, Clock, Loader2, Info, LogOut, Printer, User, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trackCustomerAction } from "../actions/admin";

interface Order {
  id: string;
  order_number: string;
  status: string;
  credentials_copy: string;
  created_at: string;
  customer_name: string;
  phone_number: string;
  address: string;
  price: number;
  duration?: number;
  duration_label?: string;
  products: {
    name: string;
    brand: string;
    price: number;
  };
}

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Profile Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const showNewOrderSuccess = searchParams.get("new_order") === "true";
  const targetOrderId = searchParams.get("order_id");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check real session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user?.email) {
        localStorage.setItem("boo-user-email", session.user.email);
        fetchOrders(session.user.email);
      } else {
        const savedEmail = localStorage.getItem("boo-user-email");
        if (savedEmail) {
          fetchOrders(savedEmail);
        } else {
          setIsLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async (userEmail?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          products (
            name,
            brand,
            price
          )
        `);

      if (userEmail) {
        query = query.eq("user_email", userEmail);
      } else {
        // If no email provided and not logged in, return empty
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (data) {
        setOrders(data as any);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("boo-user-email");
    setOrders([]);
    setCurrentUser(null);
    setActiveTab("orders");
    router.push("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setProfileStatus({ type: "error", msg: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setProfileStatus({ type: "error", msg: "Mật khẩu mới phải từ 6 ký tự trở lên." });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setProfileStatus({ type: "success", msg: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Auto logout after 2s
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (err: any) {
      setProfileStatus({ type: "error", msg: err.message || "Lỗi khi đổi mật khẩu." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualEmailLookup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    if (email) {
      localStorage.setItem("boo-user-email", email);
      fetchOrders(email);
      // Track customer activity
      trackCustomerAction(email);
    }
  };

  // Calculation for VIP Info - Respect filtering if in Receipt Mode
  const filteredForVIP = (targetOrderId && !showHistory)
    ? orders.filter(o => o.order_number.startsWith(targetOrderId))
    : orders;

  const totalSpent = filteredForVIP.reduce((acc, order) => acc + (order.price || 0), 0);
  const totalPoints = filteredForVIP.length * 10;

  return (
    <main className="pt-24 md:pt-32 pb-24 max-w-7xl mx-auto px-6">
      {showNewOrderSuccess && (
        <div className="mb-8 p-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Thanh toán hoàn tất!</p>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Thông tin tài khoản đã sẵn sàng bên dưới</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
            {showNewOrderSuccess ? (
              <>Đơn hàng <span className="text-primary text-glow">Thành công</span></>
            ) : (
              <>Bảng <span className="text-primary">Điều khiển</span></>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {showNewOrderSuccess
              ? "Cảm ơn bạn đã tin dùng Boo Account! Dưới đây là các tài khoản bạn vừa mua."
              : "Chào mừng trở lại! Quản lý các dịch vụ và lịch sử mua hàng của bạn."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab("orders")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === "orders" ? "bg-primary text-black" : "text-white hover:bg-white/5"
              )}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === "profile" ? "bg-primary text-black" : "text-white hover:bg-white/5"
              )}
            >
              Cấu hình
            </button>
          </div>

          {orders.length > 0 && (
            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
              title="Đăng xuất"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">VIP Level 1</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hội viên cao cấp</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng đã mua:</span>
                <span className="text-white font-bold">{totalSpent.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tích điểm:</span>
                <span className="text-primary font-bold">{totalPoints} pts</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <h4 className="text-white font-bold mb-4 text-sm">Thông báo mới</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <p className="text-xs text-muted-foreground">Hệ thống vừa cập nhật thêm 500 tài khoản Netflix 4K mới.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <p className="text-xs text-muted-foreground">Đã khôi phục dịch vụ bảo hành Canva qua Chatbot.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "profile" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/5 border border-white/10">
                <div className="max-w-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Cấu hình <span className="text-primary text-sm font-bold uppercase ml-2 tracking-widest">Tài khoản</span></h3>
                      <p className="text-muted-foreground">{currentUser?.email || "Chưa xác thực tài khoản"}</p>
                    </div>
                  </div>

                  {!currentUser ? (
                    <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <AlertCircle size={18} />
                        Vui lòng đăng nhập để sử dụng tính năng này.
                      </p>
                      <p className="text-xs mt-1 blur-none">Bạn đang truy cập ở chế độ khách (Guest) nên không thể đổi mật khẩu.</p>
                      <Link href="/login" className="inline-flex items-center gap-2 mt-4 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl bg-yellow-500 text-black hover:scale-105 transition-all">
                        Đến trang đăng nhập
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1 opacity-60">Mật khẩu mới</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                              type="password"
                              required
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                              placeholder="Nhập mật khẩu mới..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1 opacity-60">Xác nhận mật khẩu</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                              type="password"
                              required
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                              placeholder="Gõ lại mật khẩu mới..."
                            />
                          </div>
                        </div>
                      </div>

                      {profileStatus && (
                        <div className={cn(
                          "p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
                          profileStatus.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {profileStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {profileStatus.msg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full md:w-fit px-12 py-4 rounded-2xl bg-primary text-black font-black hover:scale-[1.02] transition-all neon-glow flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUpdating ? <RefreshCcw className="animate-spin" size={20} /> : "Cập nhật mật khẩu"}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/5 border border-white/10 border-dashed">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold text-white mb-2">Trung tâm hỗ trợ khách hàng</h4>
                    <p className="text-sm text-muted-foreground">Nếu bạn gặp bất kỳ vấn đề gì về tài khoản hoặc dịch vụ, hãy liên hệ ngay với chúng tôi.</p>
                  </div>
                  <Link href="/contact" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    Gửi yêu cầu <ExternalLink size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-muted-foreground">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/5 border border-white/10 border-dashed text-center">
              <div className="max-w-md mx-auto">
                <Info size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Tra cứu đơn hàng</h3>
                <p className="text-sm text-muted-foreground mb-8">Nhập email bạn đã dùng để mua hàng để xem lịch sử đơn hàng của mình.</p>

                <form onSubmit={handleManualEmailLookup} className="space-y-4 mb-8">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-center"
                  />
                  <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-black font-black hover:scale-[1.02] transition-all neon-glow">
                    Xem đơn hàng của tôi
                  </button>
                </form>

                <div className="pt-8 border-t border-white/5">
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-bold">Hoặc</p>
                  <Link href="/" className="text-white hover:text-primary transition-colors font-bold flex items-center justify-center gap-2">
                    Mua gói dịch vụ mới <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {(() => {
                const filtered = (targetOrderId && !showHistory)
                  ? orders.filter(o => o.order_number.startsWith(targetOrderId))
                  : orders;

                return (
                  <>
                    {filtered.map((order) => {
                      const [accEmail, accPass, accProfile] = (order.credentials_copy || "||").split("|");
                      return (
                        <div key={order.id} className="group relative rounded-3xl p-px bg-gradient-to-r from-white/10 to-transparent hover:from-primary/20 transition-all">
                          <div className="relative p-5 md:p-8 rounded-3xl bg-[#141414] overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-8 pb-6 border-b border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl md:text-3xl shrink-0 text-white">
                                  {order.products.brand === 'netflix' ? '📺' : order.products.brand === 'spotify' ? '🎵' : order.products.brand === 'google' ? '☁️' : '🎬'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-lg md:text-xl font-bold text-white truncate">{order.products.name}</h3>
                                    <div className="flex gap-1.5">
                                      {(showNewOrderSuccess && order.order_number.startsWith(targetOrderId || "")) && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-green-500 text-black text-[9px] font-black uppercase tracking-tight animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                          Mới
                                        </span>
                                      )}
                                      {order.duration_label && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tight border border-primary/20">
                                          {order.duration_label}
                                        </span>
                                      )}
                                      <span className={cn(
                                        "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight",
                                        order.status === 'completed' ? "bg-white/5 text-white/40" : "bg-yellow-500/10 text-yellow-500"
                                      )}>
                                        {order.status === 'completed' ? 'Active' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[11px] md:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="md:size-[14px]" /> {new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={12} className="md:size-[14px]" /> {order.order_number}</span>
                                    <span className="font-bold text-primary">{(order.price || order.products.price).toLocaleString()}đ</span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
                                <Link
                                  href={`/invoice/${order.id}`}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm hover:bg-primary hover:text-black transition-all group/print"
                                >
                                  <Printer size={16} className="group-hover/print:scale-110 transition-transform" />
                                  In hóa đơn
                                </Link>
                                <button className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs md:text-sm hover:bg-white/10 transition-colors">
                                  Hỗ trợ
                                  <ExternalLink size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-6">
                              <div className="flex md:flex-col items-center md:items-start justify-between p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest">
                                  <Mail size={14} /> <span className="md:inline">Tài khoản</span>
                                </div>
                                <p className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-full">{accEmail}</p>
                              </div>
                              <div className="flex md:flex-col items-center md:items-start justify-between p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest">
                                  <Key size={14} /> <span className="md:inline">Mật khẩu</span>
                                </div>
                                <p className="text-sm font-bold text-white tracking-widest">{accPass}</p>
                              </div>
                              <div className="flex md:flex-col items-center md:items-start justify-between p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest">
                                  <Shield size={14} /> <span className="md:inline">Profile / Note</span>
                                </div>
                                <p className="text-sm font-bold text-white">{accProfile || "Premium"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {targetOrderId && !showHistory && orders.length > 3 && orders.length > filtered.length && (
                      <div className="pt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <button
                          onClick={() => setShowHistory(true)}
                          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                          Hiển thị lịch sử các đơn hàng cũ hơn
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 size={40} className="text-primary animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
}
