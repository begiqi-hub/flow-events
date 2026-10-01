import { NextResponse } from 'next/server';
import { sendMarketplaceOfferEmail } from '@/lib/mailer';
// import { prisma } from '@/lib/prisma'; // ZBLLOKOJENI KËTË RRESHT KUR TË KRIJONI TABELËN NË PRISMA

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ekstraktimi i sigurt i të dhënave nga kërkesa
    const { 
      businessEmail, 
      fullName, 
      phone, 
      date, 
      guests, 
      eventType, 
      requestMessage 
    } = body;

    // 1. Validimi: Mos lejo ekzekutimin nëse mungojnë të dhënat bazë
    if (!businessEmail || !fullName || !phone || !eventType) {
      return NextResponse.json(
        { error: "Të dhënat e detyrueshme mungojnë. Ju lutem plotësoni formën saktë." }, 
        { status: 400 }
      );
    }

    // 2. Ruajtja në Databazë (Praktika më e mirë për SaaS)
    // Këshillë: Edhe nëse nuk e keni gati tabelën tani, lëreni këtë kod si koment për ta aktivizuar më vonë.
    /*
    await prisma.offerRequests.create({
      data: {
        businessEmail,
        fullName,
        phone,
        date: date ? new Date(date) : null,
        guests: guests ? parseInt(guests, 10) : null,
        eventType,
        message: requestMessage || "",
        status: "pending" // Status për t'u shfaqur në Dashboard të biznesit
      }
    });
    */

    // 3. Dërgimi i emailit te biznesi (Duke vendosur vlera default (fallback) për fushat jo-obligative)
    const result = await sendMarketplaceOfferEmail({
      businessEmail,
      fullName,
      phone,
      date: date || "E papërcaktuar",
      guests: guests || "E papërcaktuar",
      eventType,
      requestMessage: requestMessage || "Nuk ka mesazh shtesë nga klienti."
    });

    // 4. Menaxhimi i dështimit të dërgimit
    if (!result.success) {
       console.error("❌ GABIM: Dështoi dërgimi i emailit te biznesi:", result.error);
       return NextResponse.json(
         { error: "Kërkesa u regjistrua, por pati një problem në dërgimin e emailit." }, 
         { status: 500 }
       );
    }

    // 5. Përgjigjja e suksesit
    return NextResponse.json(
      { success: true, message: "Kërkesa u dërgua me sukses!" }, 
      { status: 201 }
    );

  } catch (error: any) {
    // Logimi i domosdoshëm për të gjetur gabimet në Vercel Logs
    console.error("❌ GABIM KRITIK NË API E OFERTAVE:", error);
    
    return NextResponse.json(
      { error: "Ndodhi një gabim teknik në server gjatë procesimit të kërkesës." }, 
      { status: 500 }
    );
  }
}