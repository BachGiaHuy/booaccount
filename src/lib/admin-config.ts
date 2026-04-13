/**
 * DANH SÁCH EMAIL CÓ QUYỀN ADMIN
 * Bạn hãy thêm Email của mình vào danh sách này để có thể truy cập trang /admin
 */
export const ADMIN_EMAILS = [
  "admin@gmail.com", // Thay thế bằng email thật của bạn
  "hoangnguyen@example.com", 
];

/**
 * Kiểm tra xem một email có phải là admin hay không
 */
export const isAdmin = (email: string | undefined | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
