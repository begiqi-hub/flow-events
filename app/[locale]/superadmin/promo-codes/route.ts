import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
// 1. ZËVENDËSIMI: Përdorim getServerSession për API-të në Server
import { getServerSession } from "next-auth/next"; 
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Përshtate me rrugën ku ke ruajtur konfigurimet e NextAuth

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, promoCodes }, { status: 200 });
  } catch (error) {
    console.error("Gabim në GET /api/promo-codes:", error);
    return NextResponse.json({ error: "Gabim në marrjen e kodeve" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 2. LOGJIKA E SIGURISË (E gatshme për përdorim)
    // Kur të jesh gati ta aktivizosh, hiq komentet e mëposhtme:
    /*
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "E ndaluar! Kërkohet akses superadmin." }, { status: 403 });
    }
    */

    const body = await req.json();
    const { code, discountType, discountValue, maxUses, expiresAt } = body;

    // Valido të dhënat bazë
    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: "Mungojnë të dhënat kryesore" }, { status: 400 });
    }

    // Ruaj në Databazë
    const newPromo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        // Nëse maxUses është bosh ose 0, e ruajmë si null (pa limit)
        maxUses: maxUses ? parseInt(maxUses) : null,
        // Nëse expiresAt ekziston, e kthejmë në format Date
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return NextResponse.json({ success: true, data: newPromo }, { status: 201 });
  } catch (error: any) {
    // Menaxhimi i gabimit nëse kodi ekziston (rregulli @unique)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ky kod ekziston tashmë!" }, { status: 400 });
    }
    
    console.error("Gabim në POST /api/promo-codes:", error);
    return NextResponse.json({ error: "Gabim në server" }, { status: 500 });
  }
}