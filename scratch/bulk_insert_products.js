const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newProducts = [
  {
    name: "Claude AI Pro",
    price: 450000,
    original_price: 600000,
    brand: "claude",
    category: "Productivity",
    icon_url: "/img/claude.jpeg",
    slug: "claude-ai-pro",
    is_featured: true,
    features: ["Model Claude 3.5 Sonnet", "Xử lý 200k Token", "Phân tích Code chuyên sâu", "Tài khoản riêng biệt"]
  },
  {
    name: "Cursor AI Pro",
    price: 450000,
    original_price: 600000,
    brand: "cursor",
    category: "Design",
    icon_url: "/img/cursor.png",
    slug: "cursor-ai-pro",
    is_featured: false,
    features: ["AI Code Editor Pro", "Tích hợp Claude/GPT", "Autocomplete thông minh", "Unlimited Search"]
  },
  {
    name: "DeepSeek Pro",
    price: 49000,
    original_price: 99000,
    brand: "deepseek",
    category: "Productivity",
    icon_url: "/img/deepseek.png",
    slug: "deepseek-pro",
    is_featured: false,
    features: ["Model DeepSeek-V3", "Hiệu năng vượt trội", "Hỗ trợ tiếng Việt tốt", "API ổn định 24/7"]
  },
  {
    name: "Discord Nitro",
    price: 59000,
    original_price: 120000,
    brand: "discord",
    category: "Entertainment",
    icon_url: "/img/discord.avif",
    slug: "discord-nitro",
    is_featured: false,
    features: ["Badge Nitro cao cấp", "2 Server Boosts", "Upload file 500MB", "Emoji động & Cover"]
  },
  {
    name: "Duolingo Super",
    price: 35000,
    original_price: 150000,
    brand: "duolingo",
    category: "Education",
    icon_url: "/img/duolingo.png",
    slug: "duolingo-super",
    is_featured: false,
    features: ["Học không giới hạn", "Không quảng cáo", "Review lỗi sai", "Tài khoản Super"]
  },
  {
    name: "Grok AI (xAI)",
    price: 150000,
    original_price: 300000,
    brand: "grok",
    category: "Productivity",
    icon_url: "/img/grok.svg",
    slug: "grok-ai-xai",
    is_featured: false,
    features: ["AI của Elon Musk (xAI)", "Dữ liệu X Real-time", "Phân tích chuyên sâu", "Tài khoản Premium"]
  },
  {
    name: "Adobe Full App",
    price: 180000,
    original_price: 850000,
    brand: "adobe",
    category: "Design",
    icon_url: "/img/adobe.png",
    slug: "adobe-full-app",
    is_featured: true,
    features: ["Full 20+ App Adobe", "100GB Cloud", "Sử dụng font Adobe", "Bản mới nhất"]
  }
];

async function main() {
  console.log("Starting bulk insert...");
  const { data, error } = await supabase
    .from('products')
    .insert(newProducts)
    .select();

  if (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  }

  console.log(`Successfully added ${data.length} products.`);
}

main();
