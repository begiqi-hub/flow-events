import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Lexon direkt formatin fiks nga .env
      to,
      subject,
      html,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ GABIM NË NODEMAILER:", error);
    return { success: false, error: error.message || error.toString() };
  }
}