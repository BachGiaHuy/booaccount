-- Lệnh SQL để cập nhật bảng orders cho đầy đủ tính năng mới
-- Bạn hãy Copy đoạn này và chạy trong mục "SQL Editor" trên trang Supabase nhé!

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS duration_label TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_used TEXT;

-- Thông báo: Đã sẵn sàng cho hệ thống Voucher và Quản lý doanh thu!
