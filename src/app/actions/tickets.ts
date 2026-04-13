"use server";

import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { sendSupportReplyEmail } from "./email";

export async function createTicketAction(formData: { name: string; email: string; subject: string; message: string }) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: "pending"
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Error creating ticket:", err);
    return { success: false, error: err.message || "Lỗi không xác định" };
  }
}

export async function getTicketsAction() {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching tickets:", err);
    return { success: false, error: err.message };
  }
}

export async function updateTicketStatusAction(id: string, status: string) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error updating ticket status:", err);
    return { success: false, error: err.message };
  }
}

export async function replyToTicketAction(id: string, replyMessage: string) {
  try {
    // 1. Fetch original ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Không tìm thấy yêu cầu hỗ trợ." };
    }

    // 2. Send Email using Resend
    const emailResult = await sendSupportReplyEmail({
      email: ticket.email,
      customerName: ticket.name,
      subject: ticket.subject,
      originalMessage: ticket.message,
      replyMessage: replyMessage
    });

    if (!emailResult.success) {
      return { success: false, error: "Lỗi khi gửi email phản hồi. Vui lòng thử lại sau." };
    }

    // 3. Update Status and store reply (if needed, here we just change status)
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ 
        status: "replied",
        // Storing reply in a note or specific column if exists, 
        // for now let's just use status as indicator
      })
      .eq("id", id);

    if (updateError) {
      console.warn("Email sent but DB update failed:", updateError);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error replying to ticket:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteTicketAction(id: string) {
  try {
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting ticket:", err);
    return { success: false, error: err.message };
  }
}
