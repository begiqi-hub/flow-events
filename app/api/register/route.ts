import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, nui, city, activityId } = body;

    // 0. Validimi Baze
    if (!name || !email || !password || !nui || !phone) {
      return NextResponse.json({ error: "Të gjitha fushat obligative duhet të plotësohen!" }, { status: 400 });
    }

    // Siguria 1: Formatojmë emailin
    const safeEmail = email.toLowerCase().trim();

    // 1. Kontrollojmë nëse emaili ekziston te PËRDORUESIT (Staf/Klientë)
    const existingUser = await prisma.users.findUnique({ where: { email: safeEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Ky email është i regjistruar tashmë në sistem!" }, { status: 400 });
    }

    // 2. Kontrollojmë nëse emaili ekziston te BIZNESET
    const existingBusinessEmail = await prisma.businesses.findUnique({ where: { email: safeEmail } });
    if (existingBusinessEmail) {
      return NextResponse.json({ error: "Ky email përdoret nga një Biznes ekzistues!" }, { status: 400 });
    }

    // 3. Kontrollojmë nëse ky NUI (Numër Biznesi) ekziston
    const existingBusinessNui = await prisma.businesses.findUnique({
      where: { nui: nui }
    });
    
    if (existingBusinessNui) {
      return NextResponse.json({ 
        error: "Ky Numër Biznesi (NUI) është i regjistruar një herë në sistemin tonë!" 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Krijimi me Transaction
    const result = await prisma.$transaction(async (tx) => {
      
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

      const newUser = await tx.users.create({
        data: {
          full_name: name, 
          email: safeEmail,
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