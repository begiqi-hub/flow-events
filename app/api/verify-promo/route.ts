import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Ju lutem shkruani një promo kod." }, { status: 400 });
    }

    // Kërko kodin në databazë, duke injoruar hapësirat dhe shkronjat e vogla
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    // 1. Kontrollo nëse ekziston
    if (!promo) {
      return NextResponse.json({ error: "Kodi i pasaktë ose nuk ekziston." }, { status: 404 });
    }

    // 2. Kontrollo nëse është aktiv
    if (!promo.isActive) {
      return NextResponse.json({ error: "Ky kod nuk është më i vlefshëm." }, { status: 400 });
    }

    // 3. Kontrollo datën e skadencës
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: "Ky promo kod ka skaduar." }, { status: 400 });
    }

    // 4. Kontrollo limitin e përdorimeve
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Limiti i përdorimeve për këtë kod është arritur." }, { status: 400 });
    }

    // Zgjedhja e biznesit: Këtu mund të shtohet logjika për të verifikuar nëse klienti
    // po bën abonimin e parë (duke kontrolluar historikun e tij në databazë).

    // Kthe të dhënat e zbritjes për të llogaritur çmimin në UI
    return NextResponse.json({ 
      success: true, 
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      promoId: promo.id
    }, { status: 200 });

  } catch (error) {
    console.error("Gabim në verifikimin e promo kodit:", error);
    return NextResponse.json({ error: "Gabim në server. Provoni përsëri." }, { status: 500 });
  }
}