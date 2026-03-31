import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, nui, city, activityId } = body;

    // 1. Kontrollojmë nëse emaili ekziston
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Ky email është i regjistruar tashmë!" }, { status: 400 });
    }

    // 2. KONTROLLI I RI: Kontrollojmë nëse ky NUI (Numër Biznesi) ekziston
    if (nui) {
      const existingBusiness = await prisma.businesses.findUnique({
        where: { nui: nui }
      });
      if (existingBusiness) {
        return NextResponse.json({ 
          error: "Ky Numër Biznesi (NUI) është i regjistruar një herë në sistemin tonë!" 
        }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Krijimi me Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const newBusiness = await tx.businesses.create({
        data: {
          name: name,
          email: email,
          phone: phone,
          nui: nui || null,
          city: city || null,
          status: "trial",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      const newUser = await tx.users.create({
        data: {
          full_name: name, 
          email: email,
          password: hashedPassword,
          role: "admin", 
          business_id: newBusiness.id,
          status: "active",
        },
      });

      return { newBusiness, newUser };
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error: any) {
    console.error("❌ GABIM KRITIK NË REGJISTRIM:", error);
    return NextResponse.json({ 
      error: "Gabim teknik: " + (error.message || "Provoni përsëri") 
    }, { status: 500 });
  }
}