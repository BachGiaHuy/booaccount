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
      accountContentHtml = `
        <div style="background: #141414; padding: 32px; border-radius: 24px; margin: 32px 0; border: 1px solid #262626; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background: #00FFA3; width: 4px; height: 16px; border-radius: 2px; margin-right: 10px;"></div>
            <p style="margin: 0; color: #00FFA3; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Danh sách tài khoản</p>
          </div>
          <pre style="margin: 0; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.8; white-space: pre-wrap; background: #000; padding: 20px; border-radius: 12px; border: 1px dashed #333;">${accountData}</pre>
          <p style="margin: 20px 0 0 0; color: #666; font-size: 12px; font-style: italic;">* Lưu ý: Mỗi dòng tương ứng với một sản phẩm trong đơn hàng của bạn.</p>
        </div>
      `;
    } else {
      const parts = accountData.split("|");
      const accEmail = parts[0] || "N/A";
      const accPass = parts[1] || "N/A";
      const accProfile = parts[2] || "Premium";

      accountContentHtml = `
        <div style="background: #141414; padding: 32px; border-radius: 24px; margin: 32px 0; border: 1px solid #262626; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="background: #00FFA3; width: 4px; height: 16px; border-radius: 2px; margin-right: 10px;"></div>
            <p style="margin: 0; color: #00FFA3; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Thông tin tài khoản</p>
          </div>
          
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222;">
                <span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email / Username</span><br/>
                <strong style="color: #00FFA3; font-size: 16px; display: block; margin-top: 4px;">${accEmail}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222;">
                <span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mật khẩu</span><br/>
                <strong style="color: #ffffff; font-size: 16px; display: block; margin-top: 4px; letter-spacing: 1px;">${accPass}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ghi chú / Profile</span><br/>
                <strong style="color: #ffffff; font-size: 16px; display: block; margin-top: 4px;">${accProfile}</strong>
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    const mailOptions = {
      from: `"Boo Account" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[Boo Account] Đơn hàng #${orderNumber} đã sẵn sàng!`,
      html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e0e; color: #ffffff; padding: 40px; border-radius: 32px; border: 1px solid #222;">
          <!-- Header Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; background: #00FFA3; width: 48px; height: 48px; border-radius: 14px; text-align: center; line-height: 48px; margin-bottom: 16px;">
              <span style="color: #000; font-weight: 900; font-size: 24px;">B</span>
            </div>
            <h2 style="margin: 0; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; color: #ffffff;">BOO ACCOUNT</h2>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00FFA3; font-size: 32px; font-weight: 900; margin: 0 0 16px 0; letter-spacing: -1px;">Thanh toán hoàn tất!</h1>
            <p style="color: #adaaaa; font-size: 16px; line-height: 1.6;">Chào mừng <strong>${customerName || 'bạn'}</strong> đến với hệ thống Premium Digital.</p>
            <p style="color: #666; font-size: 14px; margin-top: 8px;">Mã đơn hàng: <span style="color: #fff; font-weight: bold;">#${orderNumber}</span></p>
          </div>
          
          ${accountContentHtml}

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://boo-pay.vercel.app/dashboard" style="background: #00FFA3; color: #000000; padding: 18px 40px; border-radius: 18px; text-decoration: none; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(0,255,163,0.2);">
              TRUY CẬP GÓI CỦA TÔI
            </a>
          </div>

          <div style="background: #ffffff0a; padding: 24px; border-radius: 20px; border: 1px solid #ffffff0a;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #fff; font-size: 14px;">Bạn gặp sự cố?</p>
            <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.6;">
              Đừng ngần ngại liên hệ với chúng tôi qua nút <strong>Hỗ trợ</strong> tại Bảng điều khiển hoặc nhắn tin qua Zalo/Fanpage để được xử lý trong vòng 30 phút.
            </p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #222; text-align: center;">
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Premium Digital Store</p>
            <div style="color: #666; font-size: 11px; line-height: 1.8;">
              © 2024 Boo Account. Tất cả quyền được bảo lưu.<br/>
              Bạn nhận được email này vì đã thực hiện giao dịch tại hệ thống của chúng tôi.
            </div>
          </div>
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
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0e0e0e; color: #ffffff; padding: 40px; border-radius: 32px; border: 1px solid #222;">
          <div style="display: flex; align-items: center; margin-bottom: 40px;">
            <div style="background: #00FFA3; width: 44px; height: 44px; border-radius: 12px; text-align: center; line-height: 44px; margin-right: 12px;">
              <span style="color: #000; font-weight: 900; font-size: 22px;">B</span>
            </div>
            <div>
              <h2 style="margin: 0; font-weight: 900; font-size: 16px; color: #ffffff;">BOO ACCOUNT</h2>
              <p style="margin: 0; font-size: 10px; color: #00FFA3; font-weight: bold; letter-spacing: 1px;">SUPPORT CENTER</p>
            </div>
          </div>

          <p style="color: #adaaaa; font-size: 16px;">Chào bạn <strong>${customerName}</strong>,</p>
          <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 24px 0;">
            Cảm ơn bạn đã liên hệ. Đội ngũ kỹ thuật của Boo Account đã xem xét và có phản hồi cho yêu cầu <strong>"${subject}"</strong> của bạn như sau:
          </p>
          
          <div style="background: #1a1a1a; padding: 28px; border-radius: 20px; margin: 32px 0; border-left: 4px solid #00FFA3; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${replyMessage}</p>
          </div>

          <div style="background: #000; padding: 20px; border-radius: 16px; margin-bottom: 32px; border: 1px dashed #333;">
            <p style="margin: 0 0 10px 0; color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Nội dung bạn đã gửi:</p>
            <p style="margin: 0; color: #777; font-size: 13px; font-style: italic; line-height: 1.5;">"${originalMessage}"</p>
          </div>

          <p style="color: #888; font-size: 14px; line-height: 1.6; text-align: center;">
            Nếu cần trao đổi thêm, bạn có thể trả lời trực tiếp email này.
          </p>
          
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #222; text-align: center;">
            <p style="color: #666; font-size: 11px; text-align: center; line-height: 1.6;">
              © 2024 Boo Account - Đà Nẵng, Việt Nam<br/>
              Thời gian hỗ trợ: 08:00 - 23:00 hàng ngày.
            </p>
          </div>
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
