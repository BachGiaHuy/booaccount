"use client";

import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface VietQRProps {
  amount: number;
  orderId: string;
}

export function VietQR({ amount, orderId }: VietQRProps) {
  const [copied, setCopied] = useState(false);

  // Virtual Bank Info (In real app, this comes from ENV or DB)
  const BANK_ID = "970415"; // VietinBank Example
  const ACCOUNT_NO = "102875326411";
  const ACCOUNT_NAME = "BACH GIA HUY";

  // VietQR URL format for quick generation (Standard API common in VN)
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${orderId}&accountName=${ACCOUNT_NAME}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 animate-fade-in">
      <div className="relative p-2 bg-white rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/VCB-QR.png" alt="VietQR Payment" className="w-64 h-auto object-contain" />
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Số tiền</p>
            <p className="text-xl font-bold text-primary">{amount.toLocaleString()}đ</p>
          </div>
          <button
            onClick={() => copyToClipboard(amount.toString())}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
          >
            {copied ? <Check size={18} className="text-primary" /> : <Copy size={18} />}
          </button>
        </div>

        <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Nội dung chuyển khoản</p>
            <p className="text-sm font-mono font-bold text-white">{orderId}</p>
          </div>
          <button
            onClick={() => copyToClipboard(orderId)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
          >
            {copied ? <Check size={18} className="text-primary" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vui lòng quét mã QR hoặc chuyển khoản đúng số tiền và nội dung để hệ thống tự động xác nhận sau 1-3 phút.
        </p>
      </div>
    </div>
  );
}
