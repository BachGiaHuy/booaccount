"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicBadge } from "@/components/DynamicBadge";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tất cả", "Entertainment", "Productivity", "Design", "Education"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
    setIsLoading(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-xl">
            <DynamicBadge 
              icon={<Sparkles size={12} />}
              items={[
                "Kho tàng dịch số cao cấp",
                "Giải trí không giới hạn",
                "Công cụ AI đỉnh cao",
                "Học tập & Làm việc"
              ]}
              className="mb-4"
            />
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4">
              Tất cả <span className="text-primary">Sản phẩm</span>
            </h1>
            <p className="text-muted-foreground">
              Khám phá hệ sinh thái tài khoản bản quyền đa dạng, được kiểm duyệt chất lượng khắt khe nhất.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Tìm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 bg-foreground/5 border border-border rounded-2xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all border",
                activeCategory === cat 
                  ? "bg-primary text-black border-primary neon-glow-sm" 
                  : "bg-card text-foreground/60 border-border hover:bg-foreground/5 hover:text-foreground shadow-theme"
              )}
            >
              {cat === "Tất cả" ? "Tất cả dịch vụ" : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Đang kết nối kho dữ liệu...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                brand={product.brand as any} 
                iconUrl={product.icon_url}
                price={product.price.toLocaleString("vi-VN") + "đ"}
                originalPrice={product.original_price ? product.original_price.toLocaleString("vi-VN") + "đ" : undefined}
                features={typeof product.features === 'string' ? JSON.parse(product.features) : product.features}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 rounded-3xl bg-white/5 border border-white/10 border-dashed">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp.</p>
            <button 
              onClick={() => {setActiveCategory("Tất cả"); setSearchQuery("");}}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
