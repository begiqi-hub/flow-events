import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Sigurohu që rruga drejt skedarit prisma është e saktë

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

          // Përcaktojmë datën e skadimit (1 muaj ose 1 vit nga sot)
          const now = new Date();
          const expiresAt = new Date();
          if (billingCycle === 'yearly') {
            expiresAt.setFullYear(now.getFullYear() + 1);
          } else {
            expiresAt.setMonth(now.getMonth() + 1);
          }

          // PËRDITËSOJMË DATABAZËN TËNDE
          await prisma.businesses.update({
             where: { id: businessId },
             data: {
                status: "active",           // Ndryshojmë statusin nga 'trial' në 'active'
                packageId: packageId,       // Ruajmë ID-në e paketës së blerë
                trialEndsAt: expiresAt,     // Përditësojmë datën e skadimit
             }
          });

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