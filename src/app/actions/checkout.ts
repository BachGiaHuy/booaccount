"use server";

import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { sendAccountDeliveryEmail } from "./email";

interface CheckoutItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  duration?: number;
  durationLabel?: string;
}

interface CheckoutResult {
  success: boolean;
  error?: string;
  deliveredItems?: { name: string, data: string }[];
}

export async function completeOrderAction(
  items: CheckoutItem[], 
  userEmail: string, 
  orderNumber: string,
  customerDetails?: {
    name: string;
    phone: string;
    address: string;
  }
): Promise<CheckoutResult> {
  try {
    const deliveredItems: { name: string, data: string }[] = [];

    // Process each item in the cart
    for (const item of items) {
      // Find available accounts for this specific product
      // We search by product_id and status
      const { data: inventoryItems, error: fetchError } = await supabase
        .from("inventory")
        .select("id, account_data")
        .eq("product_id", item.productId)
        .eq("status", "available")
        .limit(item.quantity);

      if (fetchError || !inventoryItems || inventoryItems.length < item.quantity) {
        return { 
          success: false, 
          error: `Rất tiếc, sản phẩm "${item.name}" không đủ số lượng trong kho. Vui lòng liên hệ hỗ trợ.` 
        };
      }

      // Mark items as sold and create order records
      for (const inv of inventoryItems) {
        // Update status
        await supabase.from("inventory").update({ status: "sold" }).eq("id", inv.id);

        // Create order (Suffixing order number to avoid unique constraint if not removed)
        const subOrderNumber = items.length > 1 ? `${orderNumber}-${inv.id.slice(0, 4)}` : orderNumber;
        
        const orderData: any = {
          product_id: item.productId,
          inventory_id: inv.id,
          order_number: subOrderNumber,
          status: "completed",
          credentials_copy: inv.account_data,
          user_email: userEmail,
          customer_name: customerDetails?.name,
          phone_number: customerDetails?.phone,
          address: customerDetails?.address,
          price: item.price, // store actual price paid
          duration: item.duration, // new column
          duration_label: item.durationLabel // new column
        };

        await supabase.from("orders").insert(orderData);

        const displayName = item.durationLabel ? `${item.name} (${item.durationLabel})` : item.name;
        deliveredItems.push({ name: displayName, data: inv.account_data });
      }
    }

    // Trigger Email Delivery with all items
    // We'll update the email logic to handle a list of items
    const summaryText = deliveredItems.map(item => `• ${item.name}: ${item.data}`).join("\n");
    
    await sendAccountDeliveryEmail({
      email: userEmail,
      orderNumber: orderNumber,
      productName: items.length > 1 ? `${items.length} sản phẩm` : items[0].name,
      accountData: summaryText,
      customerName: customerDetails?.name
    });

    return {
      success: true,
      deliveredItems
    };

  } catch (error: any) {
    console.error("Checkout Action Error:", error);
    return { success: false, error: error.message || "Lỗi hệ thống trong quá trình xử lý đơn hàng." };
  }
}
