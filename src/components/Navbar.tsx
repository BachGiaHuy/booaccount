"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-border py-3 shadow-2xl" 
          : "bg-background/40 backdrop-blur-md border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-black font-bold text-xl">B</span>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tighter text-foreground whitespace-nowrap">BOO ACCOUNT</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Trang chủ</Link>
          <Link href="/products" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Tất cả sản phẩm</Link>
          <Link href="/cong-viec" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Công việc</Link>
          <Link href="/lien-he" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Liên hệ</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/cart"
            className="p-2 rounded-full hover:bg-white/5 transition-colors relative group"
          >
            <ShoppingCart className="text-foreground group-hover:text-primary transition-colors" size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                {totalItems}
              </span>
            )}
          </Link>
          <ThemeToggle />
          
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Xin chào</span>
                  <span className="text-sm font-black text-primary">
                    {user.email?.split('@')[0].charAt(0).toUpperCase() + user.email?.split('@')[0].slice(1, 3)}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>Gói của tôi</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors px-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-xl bg-primary text-black text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 p-6 rounded-[2rem] bg-card/95 backdrop-blur-3xl border border-border overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {[
                { label: "Trang chủ", href: "/" },
                { label: "Tất cả sản phẩm", href: "/products" },
                { label: "Công việc", href: "/cong-viec" },
                { label: "Liên hệ", href: "/lien-he" },
                { label: "Chính sách", href: "/dieu-khoan" },
              ].map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="text-lg font-bold text-foreground/70 hover:text-primary transition-colors flex items-center justify-between"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  <Menu size={16} className="opacity-20" />
                </Link>
              ))}
               <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <Link 
                      href="/dashboard" 
                      className="w-full py-4 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={20} />
                      Truy cập gói của tôi
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-red-500 font-bold flex items-center justify-center gap-2"
                    >
                      <LogOut size={20} />
                      Đăng xuất tài khoản
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/login" 
                      className="py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-bold flex items-center justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      href="/register" 
                      className="py-4 rounded-2xl bg-primary text-black font-black flex items-center justify-center shadow-lg shadow-primary/20"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
