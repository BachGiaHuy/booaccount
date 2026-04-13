import Link from "next/link";
import { MessageCircle, Mail, Globe, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-primary neon-glow flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-black font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-foreground">BOO ACCOUNT</span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Nền tảng cung cấp tài khoản số cao cấp hàng đầu Việt Nam. Chất lượng tối ưu, bảo hành uy tín.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-full bg-foreground/5 border border-border text-foreground hover:text-primary transition-colors">
                <Mail size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-foreground/5 border border-border text-foreground hover:text-primary transition-colors">
                <Globe size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-foreground/5 border border-border text-foreground hover:text-primary transition-colors">
                <MessageCircle size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-black mb-6 uppercase text-m tracking-[0.2em]">Sản phẩm</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Netflix Premium</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Spotify Family</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Google Drive Unlimited</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">CapCut Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-black mb-6 uppercase text-m tracking-[0.2em]">Hỗ trợ</h4>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link href="/dieu-khoan#warranty" className="hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Hướng dẫn thanh toán</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Liên hệ Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-black mb-6 uppercase text-m tracking-[0.2em]">Newsletter</h4>
            <p className="text-base text-foreground/80 mb-4">Nhận thông tin ưu đãi và cập nhật tài khoản mới nhất.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 bg-foreground/5 border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button className="p-2 bg-primary rounded-xl text-black hover:scale-105 transition-transform">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t border-border text-xs text-muted-foreground">
          <p>© 2026 Boo Account. Đã đăng ký bản quyền.</p>
          <div className="flex gap-8">
            <Link href="/dieu-khoan#terms" className="hover:text-foreground transition-colors">Điều khoản</Link>
            <Link href="/dieu-khoan#privacy" className="hover:text-foreground transition-colors">Bảo mật</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
