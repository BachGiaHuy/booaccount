export const brandConfig: Record<string, { color: string, border: string, glow: string }> = {
  netflix: { color: "#E50914", border: "brand-netflix", glow: "rgba(229, 9, 20, 0.2)" },
  spotify: { color: "#1DB954", border: "brand-spotify", glow: "rgba(29, 185, 84, 0.2)" },
  google: { color: "#4285F4", border: "brand-google", glow: "rgba(66, 133, 244, 0.2)" },
  capcut: { color: "#ffffff", border: "brand-capcut", glow: "rgba(255, 255, 255, 0.1)" },
  youtube: { color: "#FF0000", border: "brand-netflix", glow: "rgba(255, 0, 0, 0.2)" },
  chatgpt: { color: "#10a37f", border: "brand-google", glow: "rgba(16, 163, 127, 0.2)" },
  canva: { color: "#00c4cc", border: "brand-spotify", glow: "rgba(0, 196, 204, 0.2)" },
  adobe: { color: "#ff0000", border: "brand-netflix", glow: "rgba(255, 0, 0, 0.2)" },
  icloud: { color: "#007aff", border: "brand-google", glow: "rgba(0, 122, 255, 0.2)" },
  gemini: { color: "#8e75ff", border: "brand-google", glow: "rgba(142, 117, 255, 0.2)" },
  claude: { color: "#D97757", border: "brand-google", glow: "rgba(217, 119, 87, 0.2)" },
  cursor: { color: "#3d3d3d", border: "brand-capcut", glow: "rgba(61, 61, 61, 0.2)" },
  deepseek: { color: "#0055ff", border: "brand-google", glow: "rgba(0, 85, 255, 0.2)" },
  discord: { color: "#5865F2", border: "brand-google", glow: "rgba(88, 101, 242, 0.2)" },
  duolingo: { color: "#58CC02", border: "brand-spotify", glow: "rgba(88, 204, 2, 0.2)" },
  grok: { color: "#ffffff", border: "brand-capcut", glow: "rgba(255, 255, 255, 0.2)" },
};

export const PRODUCT_DURATIONS: Record<string, number[]> = {
  duolingo: [1, 6, 12],
  grok: [1],
  adobe: [1, 3, 6, 12],
  claude: [1],
  cursor: [1],
  deepseek: [1],
  discord: [1, 3, 12],
  gemini: [1, 6, 12],
  chatgpt: [1],
  youtube: [1, 3, 6, 12],
  canva: [1, 12, 999], // 999 for vĩnh viễn
  google: [1, 6, 12],
  netflix: [1, 3, 6],
  spotify: [1, 3, 6, 12],
  capcut: [1, 3, 6, 12]
};

export const FALLBACK_FEATURES: Record<string, string[]> = {
  netflix: ["4K Ultra HD + HDR", "Xem trên 4 thiết bị", "Hỗ trợ lồng tiếng", "Bảo hành 1 đổi 1"],
  spotify: ["Nghe nhạc không QC", "Tải nhạc Offline", "Âm thanh 320kbps", "Gia hạn chính chủ"],
  google: ["2TB Dung lượng gốc", "Sao lưu ảnh gốc", "Hỗ trợ Google One", "Bảo mật tuyệt đối"],
  capcut: ["Full hiệu ứng Pro", "Không dính Logo", "Xuất video 4K 60fps", "Dùng cho cả PC"],
  chatgpt: ["Model GPT-4o mới", "Truy cập DALL-E 3", "Phân tích dữ liệu", "Tài khoản riêng"],
  canva: ["Premium Elements", "Bộ công cụ Brand Kit", "Resize linh hoạt", "Xóa nền Pro"],
  youtube: ["Không quảng cáo", "Phát nhạc nền", "YouTube Music", "Tải video Offline"],
  gemini: ["Model Gemini Pro", "Xử lý 1M token", "Google Workspace", "Hỗ trợ nhanh"],
  icloud: ["Dung lượng iCloud+", "Private Relay", "Hide My Email", "Sao lưu iPhone"],
  adobe: ["Full 20+ App Adobe", "100GB Cloud", "Sử dụng font Adobe", "Bản mới nhất"],
  claude: ["Model Claude 3.5 Sonnet", "Xử lý 200k Token", "Phân tích Code chuyên sâu", "Tài khoản riêng biệt"],
  cursor: ["AI Code Editor Pro", "Tích hợp Claude/GPT", "Autocomplete thông minh", "Unlimited Search"],
  deepseek: ["Model DeepSeek-V3", "Hiệu năng vượt trội", "Hỗ trợ tiếng Việt tốt", "API ổn định 24/7"],
  discord: ["Badge Nitro cao cấp", "2 Server Boosts", "Upload file 500MB", "Emoji động & Cover"],
  duolingo: ["Học không giới hạn", "Không quảng cáo", "Review lỗi sai", "Tài khoản Super"],
  grok: ["AI của Elon Musk (xAI)", "Dữ liệu X Real-time", "Phân tích chuyên sâu", "Tài khoản Premium"]
};
