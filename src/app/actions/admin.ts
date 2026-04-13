"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

export async function importInventoryAction(productIdentifier: string, data: any[], duration: number = 1) {
  try {
    let productId = productIdentifier;

    // Check if the identifier is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productIdentifier);
    
    if (!isUUID) {
      // Try to find product by slug
      const { data: product, error: fetchError } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", productIdentifier)
        .maybeSingle();
      
      if (fetchError || !product) {
        return { success: false, error: `Không tìm thấy sản phẩm với mã hoặc đường dẫn: ${productIdentifier}` };
      }
      productId = product.id;
    }

    const inventoryItems = data.map((row) => ({
      product_id: productId,
      account_data: row.account_data || row.email || Object.values(row)[0],
      status: "available",
      duration: duration
    }));

    const { error } = await supabaseAdmin
      .from("inventory")
      .insert(inventoryItems);

    if (error) {
      console.error("Server Import Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: inventoryItems.length };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, error: error.message || "Lỗi hệ thống khi nạp kho." };
  }
}

export async function addProductAction(productData: any) {
  try {
    // Better slug generation: handle special characters and multiple spaces
    const slug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing -

    const { error, data } = await supabaseAdmin
      .from("products")
      .insert({
        ...productData,
        slug,
        // Supabase JS client handles JS objects for JSONB columns; don't JSON.stringify
        features: productData.features || ["Bảo hành trọn đời", "Giao hàng sau 5 phút"]
      })
      .select();

    if (error) {
      console.error("Server Insert Error:", error);
      // Friendly error mapping
      if (error.code === '23505') {
        return { success: false, error: "Tên dịch vụ hoặc đường dẫn này đã tồn tại trong hệ thống." };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}
export async function standardizeProductFeatures() {
  try {
    const productFeatures: Record<string, string[]> = {
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

    const { data: products, error: fetchError } = await supabaseAdmin.from('products').select('id, brand');
    
    if (fetchError || !products) throw new Error(fetchError?.message || "No products found");

    for (const product of products) {
      const brand = product.brand.toLowerCase();
      const features = productFeatures[brand] || ["Bảo hành uy tín", "Hỗ trợ 24/7", "Giao hàng tự động", "Giá rẻ nhất"];
      
      await supabaseAdmin
        .from('products')
        .update({ features })
        .eq('id', product.id);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Standardize Error:", error);
    return { success: false, error: error.message };
  }
}

export async function trackCustomerAction(email: string, name?: string, phone?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .upsert(
        { 
          email: email.toLowerCase(), 
          name, 
          phone, 
          last_activity: new Date().toISOString() 
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.error("Track Customer Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCustomersAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .order("last_activity", { ascending: false });

    if (error) {
      console.error("Get Customers Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(productId: string, productData: any) {
  try {
    const { error, data } = await supabaseAdmin
      .from("products")
      .update({
        ...productData,
        features: productData.features
      })
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Server Update Error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Server Delete Error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}

export async function syncInventorySamplesAction() {
  try {
    const samplesDir = path.join(process.cwd(), "inventory_samples");
    const files = await fs.readdir(samplesDir);
    const csvFiles = files.filter(f => f.endsWith(".csv"));
    
    let totalImported = 0;
    const details = [];

    for (const file of csvFiles) {
      const slug = file.replace(".csv", "");
      
      // Find product by slug
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      if (product) {
        const filePath = path.join(samplesDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        
        const { data: csvRows } = Papa.parse(content, {
          header: true,
          skipEmptyLines: true
        });

        if (csvRows.length > 0) {
          const inventoryItems = csvRows.map((row: any) => ({
            product_id: product.id,
            account_data: row.account_data || row.email || Object.values(row)[0],
            status: "available",
            duration: 1
          }));

          const { error: insertError } = await supabaseAdmin
            .from("inventory")
            .insert(inventoryItems);

          if (!insertError) {
            totalImported += inventoryItems.length;
            details.push(`${product.name}: +${inventoryItems.length}`);
          }
        }
      }
    }

    return { 
      success: true, 
      total: totalImported, 
      message: `Đã nạp thành công ${totalImported} tài khoản cho ${details.length} sản phẩm.`,
      details 
    };
  } catch (error: any) {
    console.error("Sync Action Error:", error);
    return { success: false, error: error.message || "Lỗi khi đồng bộ thư mục mẫu." };
  }
}

export async function deleteCustomerAction(customerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      console.error("Delete Customer Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}
