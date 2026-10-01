import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Përshtatni rrugën nëse ndryshon

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json({ error: "Emaili dhe Kodi janë të detyrueshëm!" }, { status: 400 });
    }

    const safeEmail = email.toLowerCase().trim();

    // 1. Gjejmë përdoruesin në databazë
    const user = await prisma.users.findUnique({ where: { email: safeEmail } });

    if (!user) {
      return NextResponse.json({ error: "Përdoruesi nuk u gjet." }, { status: 404 });
    }

    // 2. Kontrollojmë nëse kodi përputhet
    if (user.otp_code !== otpCode) {
      return NextResponse.json({ error: "Kodi i verifikimit është i pasaktë!" }, { status: 400 });
    }

    // 3. Kontrollojmë nëse koha e kodit ka skaduar
    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      return NextResponse.json({ error: "Kodi ka skaduar. Ju lutemi kërkoni një kod të ri." }, { status: 400 });
    }

    // 4. E kalojmë llogarinë në "active" dhe pastrojmë kodin OTP
    await prisma.users.update({
      where: { id: user.id },
      data: {
        status: "active",
        email_verified: new Date(),
        otp_code: null,
        otp_expires_at: null,
      },
    });

    return NextResponse.json({ success: true, message: "Llogaria u verifikua me sukses!" }, { status: 200 });

  } catch (error) {
    console.error("❌ GABIM KRITIK NË VERIFIKIM:", error);
    return NextResponse.json({ 
      error: "Ndodhi një gabim teknik gjatë verifikimit." 
    }, { status: 500 });
  }
}