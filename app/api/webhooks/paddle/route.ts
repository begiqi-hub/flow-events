import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;

    console.log(`[PADDLE WEBHOOK] Erdhi një event i ri: ${eventType}`);

    // Ne na intereson vetëm kur pagesa përfundon me sukses
    if (eventType === "transaction.completed") {
       
       const customData = body.data.custom_data;
       
       if (customData && customData.businessId) {
          // ID-të tuaja janë String (UUID), ndaj e kalojmë direkt si tekst
          const businessId = customData.businessId;
          const packageId = customData.packageId;
          const billingCycle = customData.billingCycle; // "monthly" ose "yearly"
          
          // KODI I RI: Kapim ID-në e Promo Kodit nga anës i klientit
          const promoCodeId = customData.promoCodeId; 

          // Përcaktojmë datën e skadimit (1 muaj ose 1 vit nga sot)
          const now = new Date();
          const expiresAt = new Date();
          if (billingCycle === 'yearly') {
            expiresAt.setFullYear(now.getFullYear() + 1);
          } else {
            expiresAt.setMonth(now.getMonth() + 1);
          }

          // 1. PËRDITËSOJMË DATABAZËN PËR BIZNESIN
          await prisma.businesses.update({
             where: { id: businessId },
             data: {
                status: "active",           // Ndryshojmë statusin nga 'trial' në 'active'
                packageId: packageId,       // Ruajmë ID-në e paketës së blerë
                trialEndsAt: expiresAt,     // Përditësojmë datën e skadimit
             }
          });

          // 2. KODI I RI: RRISIM NUMËRUESIN E PROMO KODIT (NËSE ËSHTË PËRDORUR)
          if (promoCodeId) {
            await prisma.promoCode.update({
              where: { id: promoCodeId },
              data: {
                usedCount: { increment: 1 } // Rrit numëruesin automatikisht me +1
              }
            });
            console.log(`🎁 Promo kodi me ID ${promoCodeId} u përdor me sukses!`);
          }

          console.log(`✅ SUKSES: Biznesi me ID ${businessId} u aktivizua deri më ${expiresAt}!`);
       }
    }

    // I kthejmë përgjigje Paddle-it që e morëm mesazhin
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Gabim gjatë procesimit të webhook:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}