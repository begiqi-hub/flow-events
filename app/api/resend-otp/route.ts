import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";
import { sendEmail } from "../../../lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Emaili mungon!" }, { status: 400 });
    }

    const safeEmail = email.toLowerCase().trim();
    
    // Gjejmë përdoruesin
    const user = await prisma.users.findUnique({ where: { email: safeEmail } });

    if (!user) {
      return NextResponse.json({ error: "Llogaria nuk u gjet." }, { status: 404 });
    }

    if (user.status !== "pending") {
      return NextResponse.json({ error: "Kjo llogari nuk është në pritje të verifikimit, ose është bllokuar." }, { status: 400 });
    }

    // Gjenerojmë kodin e ri
    const newOtpCode = crypto.randomInt(100000, 999999).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Shton 15 minuta

    // Përditësojmë databazën
    await prisma.users.update({
      where: { email: safeEmail },
      data: {
        otp_code: newOtpCode,
        otp_expires_at: newExpiresAt
      }
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
        <h2 style="color: #333;">Ridërgimi i Kodit - Hallevo</h2>
        <p style="color: #555;">Kodi juaj i ri për verifikimin e llogarisë është:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B5CF6; background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${newOtpCode}
        </div>
        <p style="font-size: 12px; color: #999;">Ky kod skadon për 15 minuta.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: safeEmail,
      subject: "Kodi i ri i verifikimit - Hallevo",
      html: emailHtml
    });

    if (!emailResult.success) {
      console.error("❌ GABIM NË NODEMAILER (RESEND):", emailResult.error);
      return NextResponse.json({ error: "Gabim gjatë dërgimit të email-it." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kodi u ridërgua me sukses!" }, { status: 200 });

  } catch (error) {
    console.error("❌ GABIM KRITIK NË RESEND OTP:", error);
    return NextResponse.json({ error: "Gabim teknik." }, { status: 500 });
  }
}