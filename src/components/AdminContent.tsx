"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  FileSpreadsheet,
  Package,
  Database,
  CheckCircle2,
  Check,
  AlertCircle,
  Users,
  History,
  Mail,
  Search,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Box,
  Settings,
  TrendingUp,
  CreditCard,
  PlusCircle,
  X,
  MessageCircle,
  Ticket,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getTicketsAction, updateTicketStatusAction, replyToTicketAction, deleteTicketAction } from "@/app/actions/tickets";
import { getCouponsAction, createCouponAction, deleteCouponAction } from "@/app/actions/coupons";
import { getSalesAction, deleteOrderAction } from "@/app/actions/sales";
import { importInventoryAction, addProductAction, updateProductAction, deleteProductAction, standardizeProductFeatures, getCustomersAction, syncInventorySamplesAction, deleteCustomerAction } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";
import { isAdmin } from "@/lib/admin-config";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number;
  category: string;
  features: string[]; // Added features
  icon_url: string;
  is_featured: boolean;
}

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "inventory" | "users" | "sales" | "tickets" | "coupons">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [couponSearchQuery, setCouponSearchQuery] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    expiry_date: "",
    usage_limit: 100
  });

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "netflix",
    price: 0,
    original_price: 0,
    category: "Entertainment",
    features: ["Bảo hành trọn đời", "Giao hàng sau 5 phút"],
    icon_url: "",
    is_featured: false
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    setIsVerifying(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdmin(session.user.email)) {
      setUser(null);
      setIsVerifying(false);
      return;
    }

    setUser(session.user);
    setIsVerifying(false);

    // Once verified, fetch data
    fetchProducts();
    fetchSales();
    fetchUsers();
    fetchTickets();
    fetchCoupons();
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchSales = async () => {
    const res = await getSalesAction();
    if (res.success && res.data) {
      setSales(res.data);
    }
  };

  const fetchUsers = async () => {
    const res = await getCustomersAction();
    if (res.success && res.data) {
      setUsersList(res.data);
    } else {
      // Fallback if table doesn't exist yet
      const { data } = await supabase.from("orders").select("user_email, created_at");
      const unique = Array.from(new Set(data?.map(u => u.user_email))).map(email => ({
        email,
        last_activity: data?.find(u => u.user_email === email)?.created_at,
        is_guest: true
      }));
      setUsersList(unique);
    }
  };

  const fetchTickets = async () => {
    const res = await getTicketsAction();
    if (res.success && res.data) {
      setTicketsList(res.data);
    }
  };

  const fetchCoupons = async () => {
    const res = await getCouponsAction();
    if (res.success && res.data) {
      setCouponsList(res.data);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const res = await createCouponAction(newCoupon);
    setIsLoading(false);
    if (res.success) {
      setStatus({ type: "success", msg: "Đã tạo mã giảm giá mới!" });
      setNewCoupon({
        code: "",
        type: "percent",
        value: 0,
        expiry_date: "",
        usage_limit: 100
      });
      fetchCoupons();
    } else {
      setStatus({ type: "error", msg: res.error || "Lỗi khi tạo mã." });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Xóa mã giảm giá này?")) return;
    const res = await deleteCouponAction(id);
    if (res.success) {
      fetchCoupons();
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    const res = await updateTicketStatusAction(id, newStatus);
    if (res.success) {
      fetchTickets();
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Xóa yêu cầu hỗ trợ này vĩnh viễn?")) return;
    const res = await deleteTicketAction(id);
    if (res.success) {
      fetchTickets();
    } else {
      setStatus({ type: "error", msg: res.error || "Lỗi khi xóa ticket." });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này sẽ xóa vĩnh viễn dữ liệu giao dịch.")) return;
    setIsLoading(true);
    const res = await deleteOrderAction(id);
    setIsLoading(false);
    if (res.success) {
      fetchSales();
    } else {
      setStatus({ type: "error", msg: res.error || "Lỗi khi xóa đơn hàng." });
    }
  };

  const handleDeleteUser = async (id: string) => {
    // Only delete if it's a customer record
    if (!confirm("Xóa thông tin khách hàng này khỏi danh sách quản lý?")) return;
    setIsLoading(true);
    const res = await deleteCustomerAction(id);
    setIsLoading(false);
    if (res.success) {
      fetchUsers();
    } else {
      setStatus({ type: "error", msg: res.error || "Lỗi khi xóa người dùng." });
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOrders = (visibleOrders: any[]) => {
    if (selectedOrderIds.length === visibleOrders.length && visibleOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(visibleOrders.map(o => o.id));
    }
  };

  const handleBulkDeleteOrders = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedOrderIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`)) return;
    
    setIsLoading(true);
    try {
      const { deleteOrdersBulkAction } = await import("@/app/actions/sales");
      const res = await deleteOrdersBulkAction(selectedOrderIds);
      if (res.success) {
        setStatus({ type: "success", msg: `Đã xóa thành công ${selectedOrderIds.length} đơn hàng!` });
        setSelectedOrderIds([]);
        fetchSales();
      } else {
        setStatus({ type: "error", msg: res.error || "Lỗi khi xóa hàng loạt" });
      }
    } catch (error) {
      setStatus({ type: "error", msg: "Lỗi kết nối máy chủ" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleReplyTicket = async (id: string) => {
    const text = replies[id];
    if (!text?.trim()) return;

    setReplyingToId(id);
    const res = await replyToTicketAction(id, text);
    setReplyingToId(null);

    if (res.success) {
      setStatus({ type: "success", msg: "Đã gửi phản hồi thành công!" });
      setReplies({ ...replies, [id]: "" });
      fetchTickets();
    } else {
      setStatus({ type: "error", msg: res.error || "Lỗi khi gửi phản hồi." });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const result = await addProductAction(newProduct);

    setIsLoading(false);
    if (!result.success) {
      setStatus({ type: "error", msg: result.error || "Lỗi không xác định" });
    } else {
      setStatus({ type: "success", msg: "Đã thêm sản phẩm mới!" });
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        brand: "netflix",
        price: 0,
        original_price: 0,
        category: "Entertainment",
        features: ["Bảo hành trọn đời", "Giao hàng sau 5 phút"],
        icon_url: "",
        is_featured: false
      });
      fetchProducts();
    }
  };

  const handleEditInit = (p: Product) => {
    setNewProduct({
      name: p.name,
      brand: p.brand,
      price: p.price,
      original_price: p.original_price,
      category: p.category,
      features: p.features || [],
      icon_url: p.icon_url,
      is_featured: p.is_featured
    });
    setEditingProductId(p.id);
    setIsEditModalOpen(true);
    setStatus(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    setIsLoading(true);
    setStatus(null);

    const result = await updateProductAction(editingProductId, newProduct);

    setIsLoading(false);
    if (!result.success) {
      setStatus({ type: "error", msg: result.error || "Lỗi khi cập nhật" });
    } else {
      setStatus({ type: "success", msg: "Cập nhật thành công!" });
      setIsEditModalOpen(false);
      setEditingProductId(null);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProductId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.")) return;

    setIsLoading(true);
    const result = await deleteProductAction(editingProductId);
    setIsLoading(false);

    if (result.success) {
      setIsEditModalOpen(false);
      setEditingProductId(null);
      fetchProducts();
    } else {
      setStatus({ type: "error", msg: result.error || "Lỗi khi xóa" });
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...newProduct.features];
    updated[index] = value;
    setNewProduct({ ...newProduct, features: updated });
  };

  const addFeatureRow = () => {
    setNewProduct({ ...newProduct, features: [...newProduct.features, ""] });
  };

  const removeFeatureRow = (index: number) => {
    const updated = newProduct.features.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, features: updated });
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setStatus({ type: "success", msg: `Đã đọc ${results.data.length} dòng từ file CSV.` });
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "text/csv": [".csv"] } });

  const handleImport = async () => {
    if (!selectedProductId || csvData.length === 0) {
      setStatus({ type: "error", msg: "Vui lòng chọn sản phẩm và tải file CSV." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const result = await importInventoryAction(selectedProductId, csvData, 1);

    setIsLoading(false);
    if (result.success) {
      setStatus({ type: "success", msg: `Nạp kho thành công! Đã thêm ${result.count} tài khoản.` });
      setCsvData([]);
      setSelectedProductId("");
    } else {
      setStatus({ type: "error", msg: `Lỗi: ${result.error}` });
    }
  };

  const handleQuickSync = async () => {
    setIsLoading(true);
    setStatus(null);
    const result = await syncInventorySamplesAction();
    setIsLoading(false);

    if (result.success && 'message' in result) {
      setStatus({ type: "success", msg: result.message as string });
      fetchProducts(); // Refresh product list to show updated stock if needed
    } else {
      setStatus({ type: "error", msg: result.error || "Lỗi khi đồng bộ." });
    }
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
        activeTab === id ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Đang xác minh quyền quản trị...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-10 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter mb-2">Truy cập bị từ chối</h1>
            <p className="text-gray-400 text-sm">Bạn không có quyền truy cập vào khu vực này. Vui lòng đăng nhập bằng tài khoản Quản trị viên.</p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all">
              Đăng nhập Admin
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
              Quay về trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 p-8 flex flex-col gap-10 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black text-2xl">B</div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter line-clamp-1">BOO<span className="text-primary">ADMIN</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Quản trị hệ thống</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <NavItem id="dashboard" label="Tổng quan" icon={LayoutDashboard} />
          <NavItem id="products" label="Dịch vụ" icon={Box} />
          <NavItem id="inventory" label="Kho hàng" icon={Database} />
          <NavItem id="users" label="Người dùng" icon={Users} />
          <NavItem id="sales" label="Đơn hàng" icon={History} />
          <NavItem id="tickets" label="Hỗ trợ" icon={MessageCircle} />
          <NavItem id="coupons" label="Voucher" icon={Ticket} />
        </nav>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs font-bold text-white mb-1">BooAccount Pro</p>
          <p className="text-[10px] text-muted-foreground mb-3">Phiên bản 2.2.0 Cloud</p>
          <button className="w-full py-2 rounded-xl bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">Support</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow h-screen overflow-y-auto p-12 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white tracking-tighter">Chào chủ shop, chúc ngày mới tốt lành!</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Doanh thu", value: sales.reduce((acc, curr) => acc + (curr.products?.price || 0), 0).toLocaleString() + "đ", icon: TrendingUp, color: "text-primary" },
                  { label: "Đơn hàng", value: sales.length, icon: CreditCard, color: "text-blue-400" },
                  { label: "Khách hàng", value: usersList.length, icon: Users, color: "text-purple-400" },
                  { label: "Sản phẩm", value: products.length, icon: Package, color: "text-orange-400" },
                ].map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                    <stat.icon size={24} className={cn("mb-6", stat.color)} />
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8">
                <TodayRevenueChart sales={sales} />
              </div>
            </motion.div>
          )}

          {activeTab === "products" && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white tracking-tighter">Quản lý dịch vụ</h2>
                <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 rounded-xl bg-primary text-black font-bold flex items-center gap-2 hover:scale-105 transition-all">
                  <PlusCircle size={20} /> Thêm dịch vụ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center">
                        {p.icon_url ? <img src={p.icon_url} alt="" className="w-full h-full object-contain" /> : <span className="text-black font-black">{p.brand[0].toUpperCase()}</span>}
                      </div>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", p.is_featured ? "bg-primary/20 text-primary" : "bg-white/10 text-white")}>
                        {p.is_featured ? "Nổi bật" : "Thường"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                    <p className="text-2xl font-black text-primary">{p.price.toLocaleString()}đ</p>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleEditInit(p)}
                        className="px-6 py-2 rounded-lg bg-primary text-black font-bold text-sm"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "inventory" && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
              <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Cập nhật kho hàng</h2>
                    <p className="text-muted-foreground">Kéo thả file CSV chứa danh sách tài khoản để nạp vào dịch vụ.</p>
                  </div>

                  <button
                    onClick={handleQuickSync}
                    disabled={isLoading}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-primary/50 transition-all group disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <RefreshCcw className="group-hover:rotate-180 transition-transform duration-500" size={20} />}
                    ĐỒNG BỘ NHANH TỪ MẪU
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white uppercase tracking-widest">1. Chọn sản phẩm cần nạp</label>
                    <select
                      className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none transition-all cursor-pointer"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">-- Danh sách dịch vụ --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()}đ)</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white uppercase tracking-widest">2. Tải file tài khoản (CSV)</label>
                    <div {...getRootProps()} className={cn("border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all", isDragActive ? "border-primary bg-primary/5" : "border-white/5 bg-black/40 hover:border-white/10")}>
                      <input {...getInputProps()} />
                      <FileSpreadsheet className="mx-auto mb-4 text-muted-foreground" size={60} />
                      <p className="text-white font-bold text-lg">Hệ thống chấp nhận file .CSV</p>
                      <p className="text-sm text-neutral-500 mt-2">Đinh dạng: email, password, profile (tùy chọn)</p>
                    </div>
                  </div>

                  {status && (
                    <div className={cn("p-4 rounded-2xl border flex items-center gap-3", status.type === "success" ? "bg-primary/20 border-primary/30 text-primary" : "bg-red-500/20 border-red-500/30 text-red-500")}>
                      {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      <span className="text-sm font-bold">{status.msg}</span>
                    </div>
                  )}

                  <button
                    onClick={handleImport}
                    disabled={isLoading || !selectedProductId || csvData.length === 0}
                    className="w-full py-5 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] neon-glow transition-all disabled:opacity-30 disabled:hover:scale-100"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Upload size={24} /> Bắt đầu nạp kho</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black text-white tracking-tighter">Quản lý người dùng</h2>
                <div className="relative w-96 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email, sđt..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm text-white focus:border-primary outline-none transition-all"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {usersList
                  .filter(user => {
                    const query = searchQuery.toLowerCase();
                    return (
                      user.email?.toLowerCase().includes(query) ||
                      user.name?.toLowerCase().includes(query) ||
                      user.phone?.includes(query)
                    );
                  })
                  .map((user, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white/[0.08] transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                          <Users size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-0.5">{user.name || "Khách hàng mới"}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail size={12} /> {user.email}</p>
                            {user.phone && <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-mono">📱 {user.phone}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            user.is_guest ? "bg-white/10 text-white/60" : "bg-primary/20 text-primary"
                          )}>
                            {user.is_guest ? "Chưa mua hàng" : "Thành viên"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Hoạt động cuối: {user.last_activity ? new Date(user.last_activity).toLocaleString("vi-VN") : "N/A"}
                        </p>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === "sales" && (
            <motion.div key="sales" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-4xl font-black text-white tracking-tighter">Giao dịch đã thực hiện</h2>
                  <button 
                    onClick={() => {
                      const filtered = sales.filter(s => {
                        const query = orderSearchQuery.toLowerCase().startsWith('#') 
                          ? orderSearchQuery.toLowerCase().substring(1) 
                          : orderSearchQuery.toLowerCase();
                        return s.order_number?.toLowerCase().includes(query);
                      });
                      toggleSelectAllOrders(filtered);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    {selectedOrderIds.length > 0 && selectedOrderIds.length === sales.filter(s => {
                        const query = orderSearchQuery.toLowerCase().startsWith('#') 
                          ? orderSearchQuery.toLowerCase().substring(1) 
                          : orderSearchQuery.toLowerCase();
                        return s.order_number?.toLowerCase().includes(query);
                      }).length ? "Bỏ chọn" : "Chọn tất cả hiển thị"}
                  </button>
                </div>
                <div className="relative w-96 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Nhập mã đơn hàng (VD: #BOO...)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm text-white focus:border-primary outline-none transition-all"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {sales
                .filter(sale => {
                  const query = orderSearchQuery.toLowerCase().startsWith('#')
                    ? orderSearchQuery.toLowerCase().substring(1)
                    : orderSearchQuery.toLowerCase();
                  return (
                    sale.order_number?.toLowerCase().includes(query)
                  );
                })
                .map((sale) => (
                  <div key={sale.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white/[0.08] transition-all relative overflow-hidden">
                    {/* Checkbox Overlay for Selection */}
                    <div 
                      onClick={() => toggleSelectOrder(sale.id)}
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-2 cursor-pointer transition-all",
                        selectedOrderIds.includes(sale.id) ? "bg-primary" : "bg-transparent hover:bg-white/10"
                      )}
                    />
                    
                    <div className="flex items-center gap-6">
                      <div 
                        onClick={() => toggleSelectOrder(sale.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all",
                          selectedOrderIds.includes(sale.id) ? "bg-primary border-primary text-black" : "border-white/10 hover:border-primary/50"
                        )}
                      >
                        {selectedOrderIds.includes(sale.id) && <Check size={14} strokeWidth={4} />}
                      </div>
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-all"><ShieldCheck size={32} /></div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{sale.products?.name || "Sản phẩm không xác định"}</h3>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-[10px] uppercase font-black">#{sale.order_number}</span>
                            {sale.coupon_used && (
                              <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[10px] uppercase font-black border border-primary/20 flex items-center gap-1">
                                <Ticket size={10} /> {sale.coupon_used}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-primary font-bold flex items-center gap-2">
                            <Users size={14} /> {sale.customer_name || 'Khách vãng lai'} {sale.phone_number && `• ${sale.phone_number}`}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 italic">
                            <Mail size={14} /> {sale.user_email}
                          </p>
                          {sale.address && (
                            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-2">
                              📍 {sale.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white mb-1 uppercase tracking-tighter">{new Date(sale.created_at).toLocaleString("vi-VN")}</p>
                      <div className="flex flex-col items-end gap-2">
                        {sale.discount_amount > 0 && (
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                            Giảm {sale.discount_amount.toLocaleString()}đ
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Giao hàng tự động thành công
                        </span>
                        <button
                          onClick={() => handleDeleteOrder(sale.id)}
                          className="p-2 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer mt-2"
                          title="Xóa giao dịch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              
              {/* Floating Bulk Toolbar */}
              <AnimatePresence>
                {selectedOrderIds.length > 0 && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center gap-8 min-w-[500px] justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black">
                        {selectedOrderIds.length}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Đơn hàng đã chọn</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Sẵn sàng để xử lý hàng loạt</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedOrderIds([])}
                        className="px-6 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={handleBulkDeleteOrders}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <Trash2 size={16} />
                        {isLoading ? "Đang xử lý..." : `Xóa hàng loạt (${selectedOrderIds.length})`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "tickets" && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black text-white tracking-tighter">Hỗ trợ khách hàng</h2>
                <div className="relative w-96 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc nội dung..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm text-white focus:border-primary outline-none transition-all"
                    value={ticketSearchQuery}
                    onChange={(e) => setTicketSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {ticketsList
                  .filter(ticket => {
                    const query = ticketSearchQuery.toLowerCase();
                    return (
                      ticket.name?.toLowerCase().includes(query) ||
                      ticket.email?.toLowerCase().includes(query) ||
                      ticket.subject?.toLowerCase().includes(query) ||
                      ticket.message?.toLowerCase().includes(query)
                    );
                  })
                  .length > 0 ? (
                  ticketsList
                    .filter(ticket => {
                      const query = ticketSearchQuery.toLowerCase();
                      return (
                        ticket.name?.toLowerCase().includes(query) ||
                        ticket.email?.toLowerCase().includes(query) ||
                        ticket.subject?.toLowerCase().includes(query) ||
                        ticket.message?.toLowerCase().includes(query)
                      );
                    })
                    .map((ticket) => (
                      <div key={ticket.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col gap-6 group">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <Mail size={24} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{ticket.name}</h3>
                              <p className="text-sm text-muted-foreground">{ticket.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={cn(
                              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                              ticket.status === 'pending' ? "bg-orange-500/20 text-orange-500" : "bg-emerald-500/20 text-emerald-500"
                            )}>
                              {ticket.status === 'pending' ? "Đang chờ" : "Đã xử lý"}
                            </span>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                              {new Date(ticket.created_at).toLocaleString("vi-VN")}
                            </p>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="p-2 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Xóa yêu cầu"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                          <p className="text-xs font-black text-primary uppercase mb-2">Chủ đề: {ticket.subject}</p>
                          <p className="text-white/80 leading-relaxed italic">"{ticket.message}"</p>
                        </div>

                        <div className="space-y-4">
                          <textarea
                            placeholder="Nhập nội dung phản hồi cho khách hàng..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary outline-none transition-all min-h-[100px] resize-none"
                            value={replies[ticket.id] || ""}
                            onChange={(e) => setReplies({ ...replies, [ticket.id]: e.target.value })}
                          />
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => handleReplyTicket(ticket.id)}
                              disabled={replyingToId === ticket.id || !replies[ticket.id]}
                              className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                replies[ticket.id]
                                  ? "bg-primary text-black hover:scale-105 shadow-lg shadow-primary/20"
                                  : "bg-white/5 text-white/20 cursor-not-allowed"
                              )}
                            >
                              {replyingToId === ticket.id ? "Đang gửi..." : "Gửi phản hồi qua Email"}
                            </button>
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id, ticket.status === 'pending' ? 'resolved' : 'pending')}
                              className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                                ticket.status === 'pending'
                                  ? "bg-white/10 text-white hover:bg-white/20"
                                  : "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                              )}
                            >
                              {ticket.status === 'pending' ? "Chỉ đánh dấu đã xử lý" : "Mở lại ticket"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground italic">Hiện chưa có yêu cầu hỗ trợ nào.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Product Modal */}
        <ProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm dịch vụ mới"
          onSubmit={handleAddProduct}
          data={newProduct}
          setData={setNewProduct}
          isLoading={isLoading}
          status={status}
          onFeatureChange={handleFeatureChange}
          onAddFeature={addFeatureRow}
          onRemoveFeature={removeFeatureRow}
        />

        {/* Edit Product Modal */}
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Chỉnh sửa dịch vụ"
          onSubmit={handleUpdateProduct}
          data={newProduct}
          setData={setNewProduct}
          isLoading={isLoading}
          status={status}
          onDelete={handleDeleteProduct}
          onFeatureChange={handleFeatureChange}
          onAddFeature={addFeatureRow}
          onRemoveFeature={removeFeatureRow}
        />
        {/* Coupons Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Mã giảm giá</h2>
                <p className="text-sm text-muted-foreground">Quản lý các chương trình khuyến mãi và Voucher</p>
              </div>
              <div className="relative w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Nhập mã Voucher..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm text-white focus:border-primary outline-none transition-all"
                  value={couponSearchQuery}
                  onChange={(e) => setCouponSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Create */}
              <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 h-fit">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlusCircle className="text-primary" size={20} />
                  Tạo mã mới
                </h3>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1">Mã Code</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: BOOSTART"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1">Loại</label>
                      <select
                        value={newCoupon.type}
                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                      >
                        <option value="percent">Phần trăm (%)</option>
                        <option value="fixed">Số tiền (đ)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1">Giá trị</label>
                      <input
                        type="number"
                        required
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1">Số lượng tối đa</label>
                    <input
                      type="number"
                      required
                      value={newCoupon.usage_limit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white uppercase tracking-widest ml-1">Ngày hết hạn (Tuỳ chọn)</label>
                    <input
                      type="date"
                      value={newCoupon.expiry_date}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  {status && (
                    <div className={cn(
                      "p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
                      status.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {status.msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : "Tạo Voucher"}
                  </button>
                </form>
              </div>

              {/* List Coupons */}
              <div className="lg:col-span-2 space-y-4">
                {couponsList
                  .filter(c => c.code.toLowerCase().includes(couponSearchQuery.toLowerCase()))
                  .map((c) => (
                    <div key={c.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Ticket size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-white">{c.code}</h4>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                              c.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {c.active ? "Đang chạy" : "Tạm dừng"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Giảm {c.type === "percent" ? `${c.value}%` : `${c.value.toLocaleString()}đ`}
                            {" • "} Đã dùng {c.used_count}/{c.usage_limit || "∞"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-3 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                {couponsList.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl text-muted-foreground uppercase text-xs tracking-widest font-bold">
                    Chưa có mã giảm giá nào
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TodayRevenueChart({ sales }: { sales: any[] }) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Calculate today's hourly data
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const hourlyData = Array(24).fill(0);
  let todayTotal = 0;

  sales.forEach(sale => {
    const saleTime = new Date(sale.created_at).getTime();
    if (saleTime >= startOfToday) {
      const hour = new Date(sale.created_at).getHours();
      const amount = sale.products?.price || 0;
      hourlyData[hour] += amount;
      todayTotal += amount;
    }
  });

  const maxRevenue = Math.max(...hourlyData, 1); // Avoid division by zero

  // Format currency helpers
  const formatCompact = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  return (
    <div className="p-12 rounded-[3.5rem] bg-[#0d0d0d] border border-white/[0.05] space-y-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Header Layout per Image 1 */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
            Doanh thu <span className="text-primary italic">Hôm nay</span>
          </h3>
          <p className="text-gray-500 text-sm font-medium">Phân tích dòng tiền theo từng khung giờ</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-white tracking-tighter">{todayTotal.toLocaleString()}đ</p>
          <div className="flex items-center justify-end gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mt-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp size={12} strokeWidth={3} />
              Tăng trưởng thực tế
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area with Labels per Image 2 */}
      <div className="h-72 flex items-end justify-between gap-2.5 relative pt-12">
        {/* Horizontal Helper Grid */}
        <div className="absolute inset-x-0 top-12 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-white/[0.03]" />
          <div className="w-full border-t border-white/[0.03]" />
          <div className="w-full border-t border-white/[0.03]" />
        </div>

        {hourlyData.map((revenue, hour) => {
          const height = (revenue / maxRevenue) * 100;
          const isCurrentHour = new Date().getHours() === hour;

          return (
            <div
              key={hour}
              className="flex-grow flex flex-col items-center gap-4 group relative h-full justify-end"
              onMouseEnter={() => setHoveredHour(hour)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {/* Value Label on Top (Persistent but subtle) */}
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: revenue > 0 ? 0.6 : 0 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className={cn(
                  "text-[9px] font-black text-white/40 mb-1 transition-all",
                  revenue > 0 && "text-white/80",
                  hoveredHour === hour && "text-primary scale-125"
                )}
              >
                {revenue > 0 ? formatCompact(revenue) : ""}
              </motion.span>

              {/* Bar Container */}
              <div className="w-full relative flex flex-col items-center justify-end h-full max-h-[160px]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, revenue > 0 ? 4 : 0)}%` }}
                  transition={{ duration: 1.2, delay: hour * 0.03, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-500 relative",
                    revenue > 0 
                      ? "bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_20px_rgba(0,255,160,0.15)]" 
                      : "bg-white/[0.03]",
                    hoveredHour === hour && "brightness-125 scale-x-110 shadow-[0_0_30px_rgba(0,255,160,0.4)]",
                    isCurrentHour && !hoveredHour && "bg-primary/60 border-x border-t border-primary/40"
                  )}
                >
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </div>

              {/* Hour Label */}
              <span className={cn(
                "text-[10px] font-black transition-all",
                hoveredHour === hour ? "text-primary scale-110" : "text-gray-600",
                isCurrentHour && "text-white underline decoration-primary underline-offset-4"
              )}>
                {hour}h
              </span>

              {/* Tooltip on Hover */}
              <AnimatePresence>
                {hoveredHour === hour && revenue > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute -top-16 bg-white text-black px-4 py-2 rounded-2xl text-[10px] font-black pointer-events-none z-50 whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center"
                  >
                    <span className="text-gray-500 uppercase tracking-widest text-[8px] mb-1">{hour}:00 - {hour}:59</span>
                    <span className="text-lg">{revenue.toLocaleString()}đ</span>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}

function ProductModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  data,
  setData,
  isLoading,
  status,
  onDelete,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature
}: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 overflow-y-auto max-h-[90vh] relative"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-white transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black text-white tracking-tighter mb-8">{title}</h2>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase">Tên dịch vụ</label>
                  <input
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white hover:border-white/20 focus:border-primary outline-none transition-all"
                    placeholder="VD: Netflix Premium"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase">Thương hiệu (Brand)</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none transition-all"
                    value={data.brand}
                    onChange={e => setData({ ...data, brand: e.target.value })}
                  >
                    {['netflix', 'spotify', 'google', 'capcut', 'youtube', 'chatgpt', 'canva', 'icloud', 'gemini', 'adobe'].map(b => (
                      <option key={b} value={b} className="bg-black capitalize">{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none"
                    value={data.price}
                    onChange={e => setData({ ...data, price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase">Danh mục</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none"
                    value={data.category}
                    onChange={e => setData({ ...data, category: e.target.value })}
                  >
                    <option value="Entertainment" className="bg-black">Giải trí</option>
                    <option value="Productivity" className="bg-black">Năng suất</option>
                    <option value="Design" className="bg-black">Thiết kế</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase">Tính năng (Features - Green Ticks)</label>
                <div className="space-y-3">
                  {data.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary outline-none"
                        value={feature}
                        onChange={(e) => onFeatureChange(idx, e.target.value)}
                        placeholder="VD: Bảo hành 1 đổi 1"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveFeature(idx)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={onAddFeature}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mt-1"
                  >
                    <Plus size={14} /> Thêm tính năng mới
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase">Icon URL</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary outline-none"
                  placeholder="/img/ten-anh.png"
                  value={data.icon_url}
                  onChange={e => setData({ ...data, icon_url: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`featured-${title}`}
                  className="w-5 h-5 accent-primary"
                  checked={data.is_featured}
                  onChange={e => setData({ ...data, is_featured: e.target.checked })}
                />
                <label htmlFor={`featured-${title}`} className="text-sm font-bold text-white">Đưa vào Sản phẩm nổi bật</label>
              </div>

              {status && (
                <div className={cn("p-4 rounded-2xl border flex items-center gap-3", status.type === "success" ? "bg-primary/20 border-primary/30 text-primary" : "bg-red-500/20 border-red-500/30 text-red-500")}>
                  {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-sm font-bold">{status.msg}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-grow py-5 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isLoading}
                    className="px-8 py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
