"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Home, 
  Search, 
  ShoppingCart, 
  TicketPercent, 
  CreditCard, 
  ClipboardCheck,
  ArrowRight,
  Zap,
  ShieldCheck,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { DynamicBadge } from "@/components/DynamicBadge";

const STEPS = [
  {
    icon: <Home size={32} />,
    title: "Tiếp cận hệ thống",
    desc: "Bắt đầu hành trình tại trang chủ Boo Account, nơi quy tụ những dịch vụ số hàng đầu thế giới.",
    details: "Khám phá giao diện trực quan, tìm kiếm các dịch vụ phổ biến như Netflix, Spotify, hay Canva Pro ngay tại Hero Section.",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: <Search size={32} />,
    title: "Lựa chọn dịch vụ",
    desc: "Tìm kiếm và xem chi tiết các gói cước phù hợp với nhu cầu cá nhân của bạn.",
    details: "Sử dụng bộ lọc danh mục thông minh để nhanh chóng tiếp cận gói dịch vụ bạn cần với giá tiết kiệm đáng kể.",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: <ShoppingCart size={32} />,
    title: "Thêm vào giỏ hàng",
    desc: "Lưu giữ các dịch vụ đã chọn vào giỏ hàng để chuẩn bị cho bước thanh toán.",
    details: "Bạn có thể quản lý số lượng và loại gói cước dễ dàng ngay trong giao diện giỏ hàng hiện đại.",
    color: "from-orange-500/20 to-yellow-500/20"
  },
  {
    icon: <TicketPercent size={32} />,
    title: "Áp dụng Voucher",
    desc: "Sử dụng mã giảm giá để tối ưu hóa chi phí mua sắm của bạn.",
    details: "Nhập mã khuyến mãi tại trang giỏ hàng để nhận ngay chiết khấu trực tiếp vào tổng đơn hàng của bạn.",
    color: "from-primary/20 to-green-500/20"
  },
  {
    icon: <CreditCard size={32} />,
    title: "Thanh toán an toàn",
    desc: "Thực hiện thanh toán qua hệ thống QR Code tự động, nhanh chóng và bảo mật.",
    details: "Hệ thống sẽ tự động xác nhận giao dịch của bạn chỉ trong vài giây ngay sau khi tiền được chuyển thành công.",
    color: "from-blue-600/20 to-indigo-600/20"
  },
  {
    icon: <ClipboardCheck size={32} />,
    title: "Nhận tài khoản",
    desc: "Kiểm tra thông tin tài khoản tại Bảng điều khiển cá nhân và bắt đầu trải nghiệm.",
    details: "Truy cập mục 'Gói của tôi' để lấy thông tin đăng nhập và bắt đầu tận hưởng dịch vụ Premium ngay lập tức.",
    color: "from-emerald-500/20 to-teal-500/20"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-24">
            <DynamicBadge 
              icon={<Zap size={14} />}
              items={[
                "Quy trình thông minh",
                "Giao dịch tự động",
                "Bảo hành nhanh chóng",
                "Hỗ trợ tận tâm"
              ]}
            />
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6"
            >
              Cách thức hoạt động tại <span className="text-primary">Boo Account</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Chúng tôi tối ưu hóa mọi công đoạn để bạn có thể sở hữu tài khoản Premium yêu thích chỉ trong chưa đầy 2 phút.
            </motion.p>
          </div>

          {/* Steps Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* Visual connecting line for desktop (simplified) */}
            <div className="hidden lg:block absolute top-[15%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
            
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group z-10"
              >
                <div className={`h-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden`}>
                  {/* Step Number Background */}
                  <div className="absolute -right-4 -top-4 text-9xl font-black text-white/[0.03] italic group-hover:text-primary/[0.05] transition-colors">
                    {index + 1}
                  </div>
                  
                  {/* Icon Box */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border border-white/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    {step.icon}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                    <span className="text-primary text-sm font-bold opacity-40">0{index + 1}.</span>
                    {step.title}
                  </h3>
                  
                  <p className="text-white/70 font-bold mb-4 leading-relaxed">
                    {step.desc}
                  </p>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {step.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to action */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-12 rounded-[3.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Trophy size={160} className="text-primary" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">Sẵn sàng trải nghiệm dịch vụ Premium?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
              Tham gia cùng hơn 10,000 khách hàng đã tin dùng Boo Account để tối ưu hóa công việc và giải trí hàng ngày.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products" className="px-10 py-5 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all text-lg flex items-center gap-3 shadow-lg shadow-primary/20">
                Bắt đầu mua sắm ngay <ArrowRight size={20} />
              </Link>
              <Link href="/lien-he" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-lg flex items-center gap-2">
                Cần tư vấn thêm <ShieldCheck size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
