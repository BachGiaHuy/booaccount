import { supabaseAdmin } from "../src/lib/supabase-admin";

async function checkLatestOrders() {
  console.log("--- KIỂM TRA 5 ĐƠN HÀNG MỚI NHẤT ---");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Lỗi truy vấn:", error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

checkLatestOrders();
