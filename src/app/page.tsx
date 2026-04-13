"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RecentSalesTicker } from "@/components/RecentSalesTicker";
import { BannerSlider } from "@/components/BannerSlider";
import { CategoryBar } from "@/components/CategoryBar";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Fetch featured products first
      const { data: featuredData, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true);

      if (featuredError) throw featuredError;

      // 2. Fetch latest products
      const { data: allData, error: allError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (allError) throw allError;

      // Combine them
      const combined = [...(featuredData || [])];
      const featuredIds = new Set(combined.map(p => p.id));
      
      if (allData) {
        allData.forEach(p => {
          if (!featuredIds.has(p.id)) {
            combined.push(p);
          }
        });
      }

      if (combined.length === 0) {
        console.warn("No products found in database.");
      }

      setProducts(combined);
      setFilteredProducts(combined);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.brand?.toLowerCase().includes(query.toLowerCase())
      );
      
      // Smart Navigation: If exactly one product found, go to details immediately
      if (filtered.length === 1) {
        router.push(`/products/${filtered[0].slug}`);
        return;
      }
      
      setFilteredProducts(filtered);
    }
    setSelectedCategory("all"); // Reset category when searching

    // Scroll to products section
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when selecting category
    
    if (categoryId === "all") {
      setFilteredProducts(products);
    } else {
      const categoryMap: { [key: string]: string } = {
        entertainment: "Entertainment",
        productivity: "Productivity",
        education: "Education",
        premium: "Premium",
        gaming: "Gaming"
      };
      
      const mappedCategory = categoryMap[categoryId];
      const filtered = products.filter(p => p.category === mappedCategory || p.brand?.toLowerCase() === mappedCategory?.toLowerCase());
      setFilteredProducts(filtered);
    }

    // Scroll to products section
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="bg-background min-h-screen">
        <Hero onSearch={handleSearch} />
        <BannerSlider />

        <section id="products" className="py-12 md:py-16 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter mb-4">
                Sản phẩm <span className="text-primary">Nổi bật</span>
              </h2>
              <p className="text-muted-foreground max-w-md">
                Lựa chọn từ những dịch vụ phổ biến nhất, được tối ưu hóa cho trải nghiệm của bạn.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-full bg-foreground/5 border border-border text-foreground text-sm font-bold hover:bg-foreground/10 transition-colors flex items-center gap-2"
              >
                Tất cả sản phẩm
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <CategoryBar activeCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

          {/* Error or Empty State */}
          {error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl inline-block max-w-md">
                <p className="font-semibold">Lỗi kết nối dự án:</p>
                <p className="text-sm opacity-90">{error}</p>
                <p className="text-xs mt-2 italic text-gray-500">Mẹo: Kiểm tra lại Biến môi trường trên Vercel xem đã điền đúng URL và Key chưa.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <p className="text-gray-400 font-medium animate-pulse">Đang tải danh sách dịch vụ...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl inline-block">
                <p className="text-gray-400 font-medium text-lg">Hệ thống chưa có sản phẩm nào.</p>
                <p className="text-gray-500 text-sm mt-2">Vui lòng chạy lệnh đổ dữ liệu hoặc thêm sản phẩm trong Admin.</p>
                <Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline font-semibold">
                  Đến trang Admin <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative -mx-6 px-6 group/slider">
              {/* Navigation Buttons */}
              <button 
                onClick={() => {
                  const el = document.getElementById("product-slider");
                  if (el) el.scrollBy({ left: -352, behavior: 'smooth' });
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/60 border border-border text-foreground items-center justify-center flex opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-black transition-all shadow-xl"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("product-slider");
                  if (el) el.scrollBy({ left: 352, behavior: 'smooth' });
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/60 border border-border text-foreground items-center justify-center flex opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-black transition-all shadow-xl"
              >
                <ChevronRight size={24} />
              </button>

              <div 
                id="product-slider"
                className="grid grid-rows-1 md:grid-rows-2 grid-flow-col gap-6 md:gap-8 overflow-x-auto no-scrollbar py-8 snap-x snap-mandatory"
                style={{ scrollBehavior: 'smooth' }}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0, y: 30, rotateX: 15 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                      className="w-[280px] md:w-[320px] flex-shrink-0 snap-start h-full pb-4"
                    >
                      <ProductCard
                        {...product}
                        brand={product.brand as any}
                        iconUrl={product.icon_url}
                        price={product.price.toLocaleString("vi-VN") + "đ"}
                        originalPrice={product.original_price ? product.original_price.toLocaleString("vi-VN") + "đ" : undefined}
                        features={typeof product.features === 'string' ? JSON.parse(product.features) : product.features}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full py-20 flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</p>
                    <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác như "Netflix" hoặc "Spotify"</p>
                  </div>
                )}
              </div>
              
              {/* Subtle visual cues for scrolling */}
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 opacity-60" />
            </div>
          )}
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "Giao hàng tự động",
                  desc: "Nhận thông tin tài khoản ngay lập tức sau khi hoàn tất thanh toán, không cần chờ đợi.",
                  icon: "⚡",
                },
                {
                  title: "Bảo hành uy tín",
                  desc: "Cam kết bảo hành 1:1 trong suốt thời gian sử dụng nếu có bất kỳ lỗi nào từ hệ thống.",
                  icon: "🛡️",
                },
                {
                  title: "Hỗ trợ 24/7",
                  desc: "Đội ngũ kỹ thuật luôn sẵn sàng giải đáp thắc mắc và xử lý sự cố bất cứ lúc nào.",
                  icon: "💬",
                },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl bg-background/40 border border-border hover:border-primary/20 transition-colors group shadow-theme">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RecentSalesTicker />
      </main>
      <Footer />
    </div>
  );
}
