"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, UserPlus, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Supabase by default sends email confirmation
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl -ml-16 -mb-16 group-hover:bg-primary/20 transition-colors" />
            
            <div className="relative">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-3">Tạo tài khoản</h1>
                <p className="text-muted-foreground text-sm">Bắt đầu trải nghiệm dịch vụ số cao cấp ngay hôm nay.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      minLength={6}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all neon-glow",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Đăng ký ngay
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-muted-foreground">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-white font-bold hover:text-primary transition-colors">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
