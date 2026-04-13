"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getCouponsAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Get Coupons Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createCouponAction(data: {
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiry_date?: string;
  usage_limit?: number;
}) {
  try {
    const { error } = await supabaseAdmin
      .from("coupons")
      .insert([
        {
          code: data.code.toUpperCase(),
          type: data.type,
          value: data.value,
          expiry_date: data.expiry_date || null,
          usage_limit: data.usage_limit || null,
          used_count: 0,
          active: true
        }
      ]);

    if (error) {
      if (error.code === '23505') return { success: false, error: "Mã giảm giá này đã tồn tại." };
      throw error;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCouponAction(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Delete Coupon Error:", error);
    return { success: false, error: error.message };
  }
}

export async function validateCouponAction(code: string) {
  try {
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();

    if (error || !coupon) {
      return { success: false, error: "Mã giảm giá không tồn tại hoặc đã hết hạn." };
    }

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return { success: false, error: "Mã giảm giá đã hết hạn sử dụng." };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { success: false, error: "Mã giảm giá đã hết lượt sử dụng." };
    }

    return { 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      } 
    };
  } catch (error: any) {
    console.error("Validate Coupon Error:", error);
    return { success: false, error: "Lỗi khi kiểm tra mã giảm giá." };
  }
}

export async function incrementCouponUsageAction(couponId: string) {
  try {
    const { data: coupon, error: fetchError } = await supabaseAdmin
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabaseAdmin
      .from("coupons")
      .update({ used_count: (coupon.used_count || 0) + 1 })
      .eq("id", couponId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error("Increment Coupon Usage Error:", error);
    return { success: false, error: error.message };
  }
}
