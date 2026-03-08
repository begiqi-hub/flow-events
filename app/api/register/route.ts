import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Hoqëm activityId që të mos bllokojë databazën
    const { name, nui, phone, city, email, password } = body; 

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    // 1. Krijojmë User-in
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: "business_owner",
      },
    });

    // 2. Krijojmë Biznesin (Pa activityId për momentin)
    await prisma.businesses.create({
      data: {
        name,
        nui,
        email,
        phone,
        city,
        status: "trial",
        trialEndsAt: trialEnds,
      },
    });

    return NextResponse.json({ success: true, message: "Regjistrimi u krye!" });
  } catch (error) {
    console.error("Gabim në regjistrim:", error);
    
    // Fshijmë userin nëse biznesi dështon, që të mos mbeten llogari "gjysmë"
    const body = await req.json().catch(() => ({}));
    if (body.email) {
      await prisma.user.deleteMany({ where: { email: body.email } });
    }
    
    return NextResponse.json({ error: "Ky email ose NUI ekziston tashmë!" }, { status: 400 });
  }
}