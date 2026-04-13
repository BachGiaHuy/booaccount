"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChevronRight, ShieldCheck, Zap, HeartHandshake, CreditCard, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PolicyPage() {
  const sections = [
    {
      id: "warranty",
      title: "Chính sách Bảo hành 1:1",
      icon: <ShieldCheck className="text-primary" size={32} />,
      content: [
        "BooAccount cam kết bảo hành 1 đổi 1 cho tất cả các loại tài khoản trong suốt thời gian sử dụng.",
        "Nếu tài khoản gặp lỗi không thể đăng nhập hoặc bị hạ cấp (back free), quý khách vui lòng liên hệ Admin để được cấp tài khoản mới hoặc fix lỗi trong tối đa 24h.",
        "Chúng tôi không bảo hành cho các trường hợp: Thay đổi email/mật khẩu tài khoản (đối với tài khoản dùng chung), vi phạm điều khoản cộng đồng của nhà cung cấp (Netflix, Spotify...).",
      ]
    },
    {
      id: "payment",
      title: "Hướng dẫn Thanh toán & Giao hàng",
      icon: <Zap className="text-primary" size={32} />,
      content: [
        "Hệ thống thanh toán qua VietQR hoàn toàn tự động. Sau khi chuyển khoản đúng số tiền và nội dung, mã đơn hàng sẽ được xử lý ngay lập tức.",
        "Thông tin tài khoản (Email/Mật khẩu) sẽ được gửi trực tiếp vào Email bạn cung cấp ở trang thanh toán.",
        "Trường hợp quá 5 phút chưa nhận được tài khoản, vui lòng kiểm tra hòm thư Spam hoặc liên hệ hỗ trợ kèm mã đơn hàng.",
      ]
    },
    {
      id: "terms",
      title: "Điều khoản Dịch vụ",
      icon: <Lock className="text-primary" size={32} />,
      content: [
        "Tài khoản được cung cấp bởi BooAccount chỉ phục vụ mục đích cá nhân, không hỗ trợ mua đi bán lại trừ khi có thỏa thuận đại lý.",
        "Quý khách vui lòng tuân thủ đúng hướng dẫn sử dụng đi kèm (ví dụ: không đăng nhập quá số thiết bị cho phép trên Netflix).",
        "Chúng tôi có quyền từ chối cung cấp dịch vụ nếu phát hiện hành vi gian lận hoặc phá hoại hệ thống.",
      ]
    },
    {
      id: "privacy",
      title: "Chính sách Bảo mật",
      icon: <HeartHandshake className="text-primary" size={32} />,
      content: [
        "Thông tin cá nhân (Email, SĐT) của khách hàng chỉ được dùng để nhận tài khoản và hỗ trợ sau bán hàng.",
        "BooAccount cam kết không chia sẻ dữ liệu khách hàng cho bất kỳ bên thứ ba nào.",
        "Mọi thông tin giao dịch đều được mã hóa và bảo mật tuyệt đối thông qua hệ thống ngân hàng nội địa.",
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
              Trung tâm <span className="text-primary">Chính sách</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tại BooAccount, sự minh bạch và quyền lợi của khách hàng là ưu tiên hàng đầu. 
              Tìm hiểu kỹ các chính sách của chúng tôi để có trải nghiệm mua sắm tốt nhất.
            </p>
          </motion.div>
        </section>

        {/* Content Section */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 md:p-12 rounded-[40px] bg-[#0a0a0a] border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">
                      {section.title}
                    </h2>
                    <ul className="space-y-4">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex gap-4 text-muted-foreground leading-relaxed">
                          <ChevronRight size={18} className="text-primary flex-shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="mt-32 max-w-3xl mx-auto px-6">
          <div className="p-12 rounded-[40px] bg-primary text-black text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h2 className="text-3xl font-black mb-4 tracking-tighter italic">BẠN CẦN TRỢ GIÚP THÊM?</h2>
            <p className="font-bold opacity-80 mb-8 lowercase tracking-tight">
              liên hệ ngay với đội ngũ hỗ trợ để được giải đáp mọi thắc mắc
            </p>
            <Link 
              href="https://zalo.me" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              Liên hệ Admin qua Zalo
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"></path>
      <path d="M12 5l7 7-7 7"></path>
    </svg>
  );
}
