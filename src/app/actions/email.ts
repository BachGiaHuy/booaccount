import nodemailer from "nodemailer";

// Configure Gmail Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendDetails {
  email: string;
  orderNumber: string;
  productName: string;
  accountData: string;
  customerName?: string;
}

export async function sendAccountDeliveryEmail({
  email,
  orderNumber,
  productName,
  accountData,
  customerName
}: SendDetails) {
  console.log(`[EmailAction] Attempting to send delivery email to: ${email} for Order #${orderNumber}`);
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[EmailAction] ERROR: Gmail credentials are missing in Environment Variables!");
    return { success: false, error: "Missing Gmail credentials" };
  }

  try {
    const isMultipleItems = accountData.includes("\n");
    
    // Format the account details block
    let accountContentHtml = "";
    
    if (isMultipleItems) {
      // If it's the summary format from checkout.ts
      accountContentHtml = `
        <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid #262626;">
          <p style="margin: 0 0 16px 0; color: #00FFA3; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Danh sách tài khoản:</p>
          <pre style="margin: 0; color: #fff; font-family: inherit; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${accountData}</pre>
        </div>
      `;
    } else {
      // Single item with pipe conversion
      const parts = accountData.split("|");
      const accEmail = parts[0] || "N/A";
      const accPass = parts[1] || "N/A";
      const accProfile = parts[2] || "";

      accountContentHtml = `
        <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid #262626;">
          <p style="margin: 0 0 16px 0; color: #00FFA3; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Thông tin tài khoản:</p>
          <div style="margin-bottom: 12px;">
            <span style="color: #666;">Email/User:</span> <strong style="color: #fff;">${accEmail}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #666;">Mật khẩu:</span> <strong style="color: #fff; letter-spacing: 1px;">${accPass}</strong>
          </div>
          ${accProfile ? `<div><span style="color: #666;">Ghi chú:</span> <strong style="color: #fff;">${accProfile}</strong></div>` : ""}
        </div>
      `;
    }

    const mailOptions = {
      from: `"Boo Account" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[Boo Account] Đơn hàng #${orderNumber} đã sẵn sàng!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e0e; color: #ffffff; padding: 40px; border-radius: 24px;">
          <h1 style="color: #00FFA3; font-size: 24px; margin-bottom: 20px;">Đơn hàng đã được xử lý!</h1>
          <p style="color: #adaaaa; font-size: 16px;">Chào bạn <strong>${customerName || 'Quý khách'}</strong>, cảm ơn bạn đã tin dùng dịch vụ của Boo Account.</p>
          <p style="color: #adaaaa; font-size: 14px;">Mã đơn hàng: <strong style="color: #fff;">#${orderNumber}</strong></p>
          
          ${accountContentHtml}

          <p style="color: #adaaaa; font-size: 14px; line-height: 1.6;">
            Vui lòng đăng nhập và kiểm tra tài khoản. Nếu cần hỗ trợ, hãy truy cập website hoặc nhắn tin qua Zalo/Fanpage của chúng tôi.
          </p>
          
          <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;" />
          
          <p style="color: #666; font-size: 11px; text-align: center;">© 2024 Boo Account - Premium Digital Store</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailAction] Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, data: info };
  } catch (error) {
    console.error("[EmailAction] FAILED to send email:", error);
    return { success: false, error };
  }
}

interface SupportReplyDetails {
  email: string;
  customerName: string;
  subject: string;
  originalMessage: string;
  replyMessage: string;
}

export async function sendSupportReplyEmail({
  email,
  customerName,
  subject,
  originalMessage,
  replyMessage
}: SupportReplyDetails) {
  try {
    const mailOptions = {
      from: `"Boo Account Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Re: ${subject} - Phản hồi từ Boo Account`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e0e; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #262626;">
          <div style="display: flex; align-items: center; margin-bottom: 32px;">
            <div style="background: #00FFA3; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <span style="color: #000; font-weight: 900; font-size: 20px;">B</span>
            </div>
            <span style="font-weight: 900; font-size: 18px; letter-spacing: -1px;">BOO ACCOUNT SUPPORT</span>
          </div>

          <p style="color: #adaaaa; font-size: 16px;">Chào bạn <strong>${customerName}</strong>,</p>
          <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
            Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn về chủ đề <strong>"${subject}"</strong>. Dưới đây là phản hồi từ đội ngũ Boo Account:
          </p>
          
          <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; margin: 32px 0; border-left: 4px solid #00FFA3;">
            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${replyMessage}</p>
          </div>

          <div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 32px; border: 1px dashed #333;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Yêu cầu gốc của bạn:</p>
            <p style="margin: 0; color: #888; font-size: 13px; font-style: italic;">"${originalMessage}"</p>
          </div>

          <p style="color: #adaaaa; font-size: 14px; line-height: 1.6;">
            Nếu bạn cần hỗ trợ thêm, đừng ngần ngại trả lời trực tiếp email này hoặc truy cập website của chúng tôi.
          </p>
          
          <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;" />
          
          <p style="color: #666; font-size: 11px; text-align: center;">Đây là email tự động từ hệ thống hỗ trợ. Vui lòng không chia sẻ thông tin bảo mật qua email này.</p>
          <p style="color: #444; font-size: 10px; text-align: center; margin-top: 8px;">© 2024 Boo Account - Đà Nẵng, Việt Nam</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  } catch (error) {
    console.error("Internal Support Email Error:", error);
    return { success: false, error };
  }
}
