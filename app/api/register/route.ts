import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../../lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, nui, city, activityId } = body;

    if (!name || !email || !password || !nui || !phone) {
      return NextResponse.json({ error: "Të gjitha fushat obligative duhet të plotësohen!" }, { status: 400 });
    }

    const safeEmail = email.toLowerCase().trim();

    const existingUser = await prisma.users.findUnique({ where: { email: safeEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Ky email është i regjistruar tashmë në sistem!" }, { status: 400 });
    }

    const existingBusinessEmail = await prisma.businesses.findUnique({ where: { email: safeEmail } });
    if (existingBusinessEmail) {
      return NextResponse.json({ error: "Ky email përdoret nga një Biznes ekzistues!" }, { status: 400 });
    }

    const existingBusinessNui = await prisma.businesses.findUnique({
      where: { nui: nui }
    });
    
    if (existingBusinessNui) {
      return NextResponse.json({ 
        error: "Ky Numër Biznesi (NUI) është i regjistruar një herë në sistemin tonë!" 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const newBusiness = await tx.businesses.create({
        data: {
          name: name,
          email: safeEmail,
          phone: phone,
          nui: nui, 
          city: city || null,
          activityId: activityId || null, 
          status: "trial",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.users.create({
        data: {
          full_name: name, 
          email: safeEmail,
          password: hashedPassword,
          role: "admin", 
          business_id: newBusiness.id,
          status: "pending",
          otp_code: otpCode,
          otp_expires_at: expiresAt,
        },
      });
    });

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
        <h2 style="color: #333;">Mirësevini në Hallevo!</h2>
        <p style="color: #555;">Kodi juaj për verifikimin e llogarisë është:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B5CF6; background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #999;">Ky kod skadon për 15 minuta. Mos ia jepni askujt tjetër këtë kod.</p>
      </div>
    `;

    // 5. Email bhejne ka process aur error handling
    const emailResult = await sendEmail({
      to: safeEmail,
      subject: "Kodi juaj i verifikimit - Hallevo",
      html: emailHtml
    });

    // Kontrolloni nëse dërgimi dështoi
    if (!emailResult.success) {
      console.error("❌ GABIM NË NODEMAILER:", emailResult.error);
      return NextResponse.json({ 
        error: "Llogaria u krijua, por emaili dështoi. Shiko terminalin." 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kodi OTP u dërgua me sukses!" }, { status: 201 });

  } catch (error: any) {
    console.error("❌ GABIM KRITIK NË REGJISTRIM:", error);

    if (error.code === 'P2003' || (error.message && error.message.includes('activityId'))) {
      return NextResponse.json(
        { error: "Ju lutem zgjidhni një lloj të vlefshëm aktiviteti nga lista." }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      error: "Ndodhi një gabim teknik gjatë regjistrimit. Ju lutem provoni përsëri." 
    }, { status: 500 });
  }
}