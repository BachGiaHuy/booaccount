"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getRecentSalesAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        user_email,
        created_at,
        products (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) {
      console.error("Get Recent Sales Error:", error);
      return { success: false, error: error.message };
    }

    // Mask emails for privacy: hoangnguyen@gmail.com -> hoa***@gmail.com
    const maskedData = data.map((order: any) => {
      const email = order.user_email || "khách vãng lai";
      let maskedEmail = email;
      
      if (email.includes("@")) {
        const [name, domain] = email.split("@");
        if (name.length > 3) {
          maskedEmail = `${name.substring(0, 3)}***@${domain}`;
        } else {
          maskedEmail = `${name}***@${domain}`;
        }
      }

      return {
        id: order.id,
        email: maskedEmail,
        productName: order.products?.name || "Sản phẩm",
        time: order.created_at
      };
    });

    return { success: true, data: maskedData };
  } catch (error: any) {
    console.error("Action Catch Error:", error);
    return { success: false, error: error.message };
  }
}
