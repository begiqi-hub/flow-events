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

    // 1. Kontrollojmë nëse emaili ekziston
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Ky email është i regjistruar tashmë!" }, { status: 400 });
    }

    // 2. Kontrollojmë nëse ky NUI (Numër Biznesi) ekziston
    const existingBusiness = await prisma.businesses.findUnique({
      where: { nui: nui }
    });
    
    if (existingBusiness) {
      return NextResponse.json({ 
        error: "Ky Numër Biznesi (NUI) është i regjistruar një herë në sistemin tonë!" 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Krijimi me Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const newBusiness = await tx.businesses.create({
        data: {
          name: name,
          email: email,
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
    // Ruajmë gabimin e plotë të databazës në server (për sytë e tu/logfile)
    console.error("❌ GABIM KRITIK NË REGJISTRIM:", error);

    // Kapim saktësisht gabimin e Foreign Key për aktivitetin (P2003 është kodi i Prisma-s për këtë)
    if (error.code === 'P2003' || (error.message && error.message.includes('activityId'))) {
      return NextResponse.json(
        { error: "Ju lutem zgjidhni një lloj të vlefshëm aktiviteti nga lista." }, 
        { status: 400 }
      );
    }

    // Për çdo gabim tjetër "të frikshëm", i japim përdoruesit një mesazh të qetë e të pastër
    return NextResponse.json({ 
      error: "Ndodhi një gabim teknik gjatë regjistrimit. Ju lutem provoni përsëri." 
    }, { status: 500 });
  }
}