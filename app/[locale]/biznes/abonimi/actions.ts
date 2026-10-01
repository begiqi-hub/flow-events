"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPaymentIntent(data: {
  businessId: string;
  amount: number;
  locale: string;
  packageId?: string; 
  promoCodeId?: string; // <--- SHTUAR: Pranojmë ID-në e kodit promocional
}) {
  try {
    const prefixes: Record<string, string> = {
      sq: "FAT", 
      en: "INV", 
      mk: "FAK", 
      cg: "FAK", 
      el: "TIM", 
    };

    const prefix = prefixes[data.locale] || "INV";
    
    const invoiceNum = `${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 1. Krijimi i faturës siç e kishit
    const newPayment = await prisma.sa_payments.create({
      data: {
        business_id: data.businessId,
        amount: data.amount,
        status: "pending", 
        invoice_number: invoiceNum, 
        payment_method: "bank",
        description: data.packageId || "Abonim i thjeshtë", 
      }
    });

    // ==========================================
    // KODI I RI: Rrit numëruesin e Promo Kodit
    // ==========================================
    if (data.promoCodeId) {
      await prisma.promoCode.update({
        where: { id: data.promoCodeId },
        data: {
          usedCount: { increment: 1 } // Rrit automatikisht numrin e përdorimeve në databazë
        }
      });
      console.log(`🎁 Promo kodi u regjistrua me sukses për faturën ${invoiceNum}`);
    }

    revalidatePath(`/${data.locale}/biznes/abonimi`);
    return { success: true, referenceCode: invoiceNum };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi krijimi i kërkesës për pagesë." };
  }
}

// ==========================================
// FUNKSIONI I RI PËR ANULIMIN E ABONIMIT
// ==========================================
export async function cancelSubscriptionAction(data: { businessId: string; locale: string }) {
  try {
    // Ruajmë statusin si 'cancelled_subscription'. Përdoruesi ende mund ta përdorë deri
    // në 'trialEndsAt', por platforma di që ky nuk do të rinovojë më.
    await prisma.businesses.update({
      where: { id: data.businessId },
      data: {
        status: "cancelled_subscription"
      }
    });

    revalidatePath(`/${data.locale}/biznes/abonimi`);
    revalidatePath(`/${data.locale}/biznes`); // Rifresko edhe dashboardin
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi procesi i anulimit të abonimit." };
  }
}