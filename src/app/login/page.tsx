"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/admin-config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email hoặc mật khẩu không chính xác.");
      setIsLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (isAdmin(user?.email)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            
            <div className="relative">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-3">Đăng nhập</h1>
                <p className="text-muted-foreground text-sm">Chào mừng trở lại với Boo Account Premium.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
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
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-white uppercase tracking-widest">Mật khẩu</label>
                    <Link href="#" className="text-xs text-primary hover:underline">Quên mật khẩu?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 animate-shake">
                    <LogIn size={16} />
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
                      Đăng nhập ngay
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-muted-foreground">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-white font-bold hover:text-primary transition-colors">
                    Đăng ký ngay
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
