"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Printer, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  customer_name: string;
  phone_number: string;
  address: string;
  user_email: string;
  price: number;
  duration?: number;
  duration_label?: string;
  products: {
    name: string;
    brand: string;
    price: number;
  };
}

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          products (
            name,
            brand,
            price
          )
        `)
        .eq("id", id)
        .single();

      if (data) {
        setOrder(data as any);
      }
      setIsLoading(false);
    }

    if (id) fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tạo hóa đơn...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h1>
        <p className="text-muted-foreground mb-8">Đơn hàng này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-primary text-black rounded-xl font-bold"
        >
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-16 print:p-0 print:bg-white">
      {/* Navigation and Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto px-6 mb-8 flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Printer size={18} />
          In hóa đơn
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-12 md:p-16 relative overflow-hidden">
        {/* Logo and Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <span className="text-black font-black text-2xl">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-black">BOO ACCOUNT</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Premium Digital Services</p>
              </div>
            </div>
            <div className="text-base text-black font-medium space-y-1">
              <p>Thành phố Đà Nẵng, Việt Nam</p>
              <p>Email: hotro@booaccount.vn</p>
              <p>Hotline: 0799 852 477</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-5xl font-black text-black uppercase tracking-tighter mb-2">Hóa Đơn</h2>
            <div className="space-y-1 text-base">
              <p className="font-bold text-black flex items-center justify-end gap-2 text-lg">
                #{order.order_number}
                <CheckCircle2 size={16} className="text-black" />
              </p>
              <p className="text-black font-medium">Ngày: {new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
              <p className="text-black font-black uppercase text-[12px] tracking-widest">Đã thanh toán</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-xs font-black uppercase text-black tracking-[0.2em] mb-4 border-b-2 border-black pb-1">Người nhận hóa đơn:</h3>
            <div className="text-base space-y-1">
              <p className="font-black text-2xl text-black underline decoration-primary decoration-4 underline-offset-4 mb-2">{order.customer_name || "Khách hàng"}</p>
              <p className="text-black font-bold italic">{order.user_email}</p>
              <p className="text-black font-medium">{order.phone_number || "N/A"}</p>
              <p className="text-black font-medium max-w-xs">{order.address || "Mua tại hệ thống trực tuyến"}</p>
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl border border-border">
            <h3 className="text-xs font-black uppercase text-black/60 tracking-[0.2em] mb-4">Ghi chú thanh toán:</h3>
            <p className="text-sm text-black leading-relaxed italic font-medium">
              Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ tại Boo Account. 
              Dữ liệu tài khoản đã được bàn giao và lưu trữ trong bảng điều khiển cá nhân của bạn.
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-16">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 font-black uppercase text-[10px] tracking-widest text-black">Hạng mục dịch vụ</th>
                <th className="py-4 font-black uppercase text-[10px] tracking-widest text-black text-center">Số lượng</th>
                <th className="py-4 font-black uppercase text-[10px] tracking-widest text-black text-right">Đơn giá</th>
                <th className="py-4 font-black uppercase text-[10px] tracking-widest text-black text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-6">
                  <p className="font-bold text-black text-lg">{order.products.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {order.products.brand} Subscription - {order.duration_label || "1 tháng"}
                  </p>
                </td>
                <td className="py-6 text-center font-medium text-black">1</td>
                <td className="py-6 text-right font-medium text-black">{(order.price || order.products.price || 0).toLocaleString()}đ</td>
                <td className="py-6 text-right font-black text-black">{(order.price || order.products.price || 0).toLocaleString()}đ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-24">
          <div className="w-full max-w-[240px] space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-black font-medium">Tạm tính:</span>
              <span className="font-black text-black">{(order.price || order.products.price || 0).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-black font-medium">Thuế (0%):</span>
              <span className="font-black text-black">0đ</span>
            </div>
            <div className="pt-3 border-t border-black flex justify-between items-center text-black">
              <span className="font-black uppercase text-xs tracking-widest">Tổng cộng:</span>
              <span className="font-black text-2xl">{(order.products.price || 0).toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* Payment Info & Footer */}
        <div className="absolute bottom-16 left-16 right-16 border-t border-gray-100 pt-10">
          <div className="grid grid-cols-2 gap-8 items-end">
            <div>
              <h4 className="text-[10px] font-black uppercase text-black tracking-[0.2em] mb-3">Thông tin thanh toán:</h4>
              <div className="text-[11px] text-gray-400 space-y-1 uppercase font-bold tracking-tighter">
                <p>Vietcombank / Boo Account</p>
                <p>Số tài khoản: 123456789</p>
                <p>Nội dung: #{order.order_number}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black tracking-tighter text-black mb-1">XIN CẢM ƠN!</p>
              <p className="text-xs text-black font-black uppercase tracking-widest">Hy vọng sớm phục vụ quý khách lần tới</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print-hidden {
            display: none !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
