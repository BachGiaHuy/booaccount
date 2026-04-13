"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { 
  Check, 
  ShoppingCart, 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  ChevronLeft, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { brandConfig, FALLBACK_FEATURES, PRODUCT_DURATIONS } from "@/lib/constants";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductAndRelated();
  }, [slug]);

  // Reset duration when product changes
  useEffect(() => {
    setSelectedDuration(1);
  }, [product?.id]);

  const fetchProductAndRelated = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch current product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (productError) throw productError;
      
      if (productData) {
        setProduct(productData);
        
        // 2. Fetch related products (same category, excluding current)
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .eq("category", productData.category)
          .neq("id", productData.id)
          .limit(4);
          
        let finalRelated = relatedData || [];

        // 3. Fallback: If less than 4 related products, fill with latest products from other categories
        if (finalRelated.length < 4) {
          const excludeIds = [productData.id, ...finalRelated.map(p => p.id)];
          const { data: fallbackData } = await supabase
            .from("products")
            .select("*")
            .not("id", "in", `(${excludeIds.join(",")})`)
            .limit(4 - finalRelated.length);
          
          if (fallbackData) {
            finalRelated = [...finalRelated, ...fallbackData];
          }
        }
          
        setRelatedProducts(finalRelated);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (basePrice: number, months: number) => {
    if (months === 1) return basePrice;
    if (months === 999) return basePrice * 10; // Lifetime = 10x monthly
    
    // Each extra month adds 50% of basePrice
    return basePrice + (months - 1) * (basePrice * 0.5);
  };

  const getDurationLabel = (months: number) => {
    if (months === 999) return "Vĩnh viễn";
    return `${months} tháng`;
  };

  const currentPrice = product ? calculatePrice(product.price, selectedDuration) : 0;
  const currentOriginalPrice = product && product.original_price 
    ? calculatePrice(product.original_price, selectedDuration) 
    : (currentPrice * 1.5);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        ...product,
        price: currentPrice,
      }, 
      selectedDuration, 
      getDurationLabel(selectedDuration)
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    handleAddToCart();
    window.location.href = `/checkout/${product.slug}?duration=${selectedDuration}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-white mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Không tìm thấy sản phẩm này trên hệ thống Boo Account.</p>
        <Link href="/" className="px-8 py-3 rounded-xl bg-primary text-black font-bold">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const config = brandConfig[product.brand.toLowerCase()] || { color: "#ffffff", glow: "rgba(255,255,255,0.1)" };
  const features = (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) || [];
  const displayFeatures = features.length > 0 ? features : (FALLBACK_FEATURES[product.brand.toLowerCase()] || []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronLeft size={12} className="rotate-180" />
          <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <ChevronLeft size={12} className="rotate-180" />
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Product Media */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-[3rem] bg-[#141414] border border-white/5 flex items-center justify-center overflow-hidden"
            >
              {/* Giant Ambient Glow */}
              <div 
                className="absolute inset-x-0 inset-y-0 blur-[120px] opacity-20"
                style={{ backgroundColor: config.color }}
              />
              
              <div className={cn(
                "relative w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] flex items-center justify-center overflow-hidden",
                product.icon_url ? "bg-white p-8" : "bg-white/5 border border-white/10"
              )}>
                {product.icon_url ? (
                  <img src={product.icon_url} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-8xl font-black text-white uppercase">{product.brand[0]}</span>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Zap size={20} className="text-primary" />, title: "Tức thì", desc: "Giao ngay ~10s" },
                { icon: <ShieldCheck size={20} className="text-primary" />, title: "Bảo mật", desc: "Chính chủ 100%" },
                { icon: <HeartHandshake size={20} className="text-primary" />, title: "Bảo hành", desc: "1 đổi 1 uy tín" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <h4 className="text-[10px] uppercase font-black text-white mb-0.5">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-grow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  Dịch vụ cao cấp
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-black text-white">
                  {currentPrice.toLocaleString("vi-VN")}đ
                </span>
                {currentOriginalPrice > currentPrice && (
                  <span className="text-xl text-muted-foreground line-through decoration-primary/50">
                    {currentOriginalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              {/* Duration Selector */}
              {product && PRODUCT_DURATIONS[product.brand.toLowerCase()] && PRODUCT_DURATIONS[product.brand.toLowerCase()].length > 1 && (
                <div className="mb-12">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Zap size={10} />
                    Chọn thời hạn sử dụng
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {PRODUCT_DURATIONS[product.brand.toLowerCase()].map((months) => (
                      <button
                        key={months}
                        onClick={() => setSelectedDuration(months)}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold transition-all border text-xs relative overflow-hidden group",
                          selectedDuration === months 
                            ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(0,255,163,0.3)]" 
                            : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {getDurationLabel(months)}
                        {selectedDuration === months && (
                          <motion.div 
                            layoutId="activeDuration"
                            className="absolute inset-0 bg-primary -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-16 mb-24">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
                    Quyền lợi cao cấp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {displayFeatures.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                          <Check size={14} className="text-primary group-hover:text-black transition-colors" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-white transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {product.description && (
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-l-4 border-primary pl-4">
                      Chi tiết sản phẩm
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-grow py-5 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all neon-glow text-lg"
                >
                  Mua ngay với ưu đãi
                  <Zap size={20} />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  Thêm giỏ hàng
                  <ShoppingCart size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-24 border-t border-white/5">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
                  Dịch vụ <span className="text-primary">Liên quan</span>
                </h2>
                <p className="text-muted-foreground text-sm">Khám phá thêm các gói cước hấp dẫn khác cùng danh mục.</p>
              </div>
              <Link href="/products" className="text-xs font-black uppercase tracking-widest text-white hover:text-primary transition-colors flex items-center gap-2">
                Xem tất cả <ChevronLeft size={14} className="rotate-180" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  brand={p.brand}
                  category={p.category}
                  iconUrl={p.icon_url}
                  price={p.price.toLocaleString("vi-VN") + "đ"}
                  originalPrice={p.original_price ? p.original_price.toLocaleString("vi-VN") + "đ" : undefined}
                  features={typeof p.features === 'string' ? JSON.parse(p.features) : p.features}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
