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
  const [accEmail, accPass, accProfile] = accountData.split("|");

  try {
    const mailOptions = {
      from: `"Boo Account" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[Boo Account] Đơn hàng #${orderNumber} đã sẵn sàng!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e0e; color: #ffffff; padding: 40px; border-radius: 24px;">
          <h1 style="color: #00FFA3; font-size: 24px; margin-bottom: 20px;">Đơn hàng của bạn đã sẵn sàng!</h1>
          <p style="color: #adaaaa; font-size: 16px;">Chào bạn <strong>${customerName || ''}</strong>, đơn hàng <strong>#${orderNumber}</strong> cho sản phẩm <strong>${productName}</strong> đã được xử lý thành công.</p>
          
          <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid #262626;">
            <p style="margin: 0 0 16px 0; color: #00FFA3; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Thông tin tài khoản:</p>
            <div style="margin-bottom: 12px;">
              <span style="color: #666;">Email:</span> <strong style="color: #fff;">${accEmail}</strong>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="color: #666;">Mật khẩu:</span> <strong style="color: #fff; letter-spacing: 2px;">${accPass}</strong>
            </div>
            ${accProfile ? `<div><span style="color: #666;">Profile:</span> <strong style="color: #fff;">${accProfile}</strong></div>` : ""}
          </div>

          <p style="color: #adaaaa; font-size: 14px; line-height: 1.6;">
            Vui lòng đăng nhập và kiểm tra tài khoản. Nếu có bất kỳ vấn đề gì, hãy liên hệ với chúng tôi qua nút "Hỗ trợ" trên website.
          </p>
          
          <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;" />
          
          <p style="color: #666; font-size: 12px; text-align: center;">© 2024 Boo Account - Premium Digital Store</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  } catch (error) {
    console.error("Internal Email Error:", error);
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
