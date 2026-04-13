"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createTicketAction } from "@/app/actions/tickets";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicBadge } from "@/components/DynamicBadge";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createTicketAction(formData);
      if (res.success) {
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(res.error || "Lỗi khi gửi yêu cầu. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  const contactInfos = [
    {
      icon: <MapPin className="text-primary" size={24} />,
      title: "Địa chỉ",
      content: "Đà Nẵng, Việt Nam",
      description: "Thành phố đáng sống bậc nhất"
    },
    {
      icon: <Phone className="text-primary" size={24} />,
      title: "SĐT / Zalo",
      content: "0799 852 477",
      description: "Hỗ trợ 24/7 tức thì"
    },
    {
      icon: <Mail className="text-primary" size={24} />,
      title: "Email",
      content: "support@booaccount.vn",
      description: "Phân hồi trong 2 giờ"
    },
    {
      icon: <Clock className="text-primary" size={24} />,
      title: "Giờ làm việc",
      content: "08:00 - 23:00",
      description: "Tất cả các ngày trong tuần"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Contact Hero */}
        <div className="text-center mb-20">
          <DynamicBadge 
            icon={<MessageSquare size={14} />}
            items={[
              "Liên hệ với chúng tôi",
              "Hỗ trợ 24/7 tức thì",
              "Zalo / Messenger",
              "Giải đáp mọi thắc mắc"
            ]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-6"
          >
            Chúng tôi luôn sẵn sàng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              lắng nghe bạn
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Bạn có câu hỏi, đóng góp ý kiến hay cần hỗ trợ kỹ thuật? Đừng ngần ngại
            liên hệ với đội ngũ Boo Account. Chúng tôi cam kết phản hồi sớm nhất.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfos.map((info, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1">{info.title}</h3>
                  <p className="text-lg font-bold text-white mb-2 break-all">{info.content}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Social / Bonus Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/20 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Kết nối mạng xã hội</h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  Theo dõi chúng tôi trên các nền tảng mạng xã hội để cập nhật những ưu đãi 
                  và sản phẩm mới nhất nhanh nhất.
                </p>
                <div className="flex gap-4">
                  {['Facebook', 'Tiktok', 'Telegram'].map((social) => (
                    <button key={social} className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-bold hover:bg-white hover:text-black transition-all">
                      {social}
                    </button>
                  ))}
                </div>
              </div>
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 bg-[#0f0f0f] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-primary" size={40} />
                  </div>
                  <h2 className="text-3xl font-black mb-4">Gửi thành công!</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Cảm ơn bạn đã liên hệ. Đội ngũ của chúng tôi sẽ phản hồi lại bạn 
                    qua email trong vòng 24 giờ tới.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-8 px-8 py-3 rounded-xl bg-primary text-black font-bold"
                  >
                    Gửi tin nhắn khác
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Họ tên của bạn</label>
                      <input
                        required
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/20"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Địa chỉ Email</label>
                      <input
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/20"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Chủ đề</label>
                    <input
                      required
                      type="text"
                      placeholder="Cần hỗ trợ về gói Netflix..."
                      className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/20"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Tin nhắn của bạn</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                      className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/20 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all neon-glow text-lg"
                  >
                    Gửi yêu cầu ngay
                    <Send size={20} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
