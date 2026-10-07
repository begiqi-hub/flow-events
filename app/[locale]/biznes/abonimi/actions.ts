"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPaymentIntent(data: {
  businessId: string;
  amount: number;
  locale: string;
  packageId?: string; 
  promoCodeId?: string; 
  billingCycle?: string; // <--- SHTUAR: Pranojmë llojin e abonimit (monthly/yearly) nga frontend
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

    // Formatimi inteligjent: Nëse është vjetore, e ruajmë si "bank_yearly", përndryshe "bank_monthly"
    const methodWithCycle = data.billingCycle ? `bank_${data.billingCycle}` : "bank";

    // 1. Krijimi i faturës me ciklin e faturimit të inkorporuar
    const newPayment = await prisma.sa_payments.create({
      data: {
        business_id: data.businessId,
        amount: data.amount,
        status: "pending", 
        invoice_number: invoiceNum, 
        payment_method: methodWithCycle, // <--- RUAJMË CIKLIN KËTU
        description: data.packageId || "Abonim i thjeshtë", // E lëmë të pastër që mos të prishet frontend-i
      }
    });

    // 2. Rrit numëruesin e Promo Kodit (nëse ka)
    if (data.promoCodeId) {
      await prisma.promoCode.update({
        where: { id: data.promoCodeId },
        data: {
          usedCount: { increment: 1 } 
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
// FUNKSIONI PËR ANULIMIN E ABONIMIT
// ==========================================
export async function cancelSubscriptionAction(data: { businessId: string; locale: string }) {
  try {
    await prisma.businesses.update({
      where: { id: data.businessId },
      data: {
        status: "cancelled_subscription"
      }
    });

    revalidatePath(`/${data.locale}/biznes/abonimi`);
    revalidatePath(`/${data.locale}/biznes`); 
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi procesi i anulimit të abonimit." };
  }
}