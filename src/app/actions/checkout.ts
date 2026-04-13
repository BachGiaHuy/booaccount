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
  },
  discountInfo?: {
    amount: number;
    couponCode: string;
  }
): Promise<CheckoutResult> {
  try {
    const deliveredItems: { name: string, data: string }[] = [];

    // Process each item in the cart
    for (const item of items) {
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
        const { error: updateError } = await supabase
          .from("inventory")
          .update({ status: "sold" })
          .eq("id", inv.id);

        if (updateError) {
          console.error("Inventory Update Error:", updateError);
          throw new Error("Không thể cập nhật trạng thái kho hàng.");
        }

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
          price: item.price,
          duration: item.duration,
          duration_label: item.durationLabel,
          // Support for discount info if columns exist
          discount_amount: discountInfo?.amount || 0,
          coupon_used: discountInfo?.couponCode || null
        };

        const { error: insertError } = await supabase.from("orders").insert(orderData);
        
        if (insertError) {
          console.error("Order Insertion Error:", insertError);
          // If columns don't exist yet, we retry without them to at least save the order
          if (insertError.code === 'P0001' || insertError.message.includes("column")) {
             const { error: retryError } = await supabase.from("orders").insert({
               ...orderData,
               discount_amount: undefined,
               coupon_used: undefined
             });
             if (retryError) throw retryError;
          } else {
            throw insertError;
          }
        }

        const displayName = item.durationLabel ? `${item.name} (${item.durationLabel})` : item.name;
        deliveredItems.push({ name: displayName, data: inv.account_data });
      }
    }

    // Trigger Email Delivery
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
    return { 
      success: false, 
      error: error.message || "Lỗi hệ thống trong quá trình xử lý đơn hàng." 
    };
  }
}
