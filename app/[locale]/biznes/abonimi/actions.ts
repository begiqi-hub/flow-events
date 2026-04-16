"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPaymentIntent(data: {
  businessId: string;
  amount: number;
  locale: string;
  packageId?: string; 
}) {
  try {
    // 1. Fjalori i prefikseve për çdo gjuhë që suporton sistemi
    const prefixes: Record<string, string> = {
      sq: "FAT", // Shqip (Faturë)
      en: "INV", // Anglisht (Invoice)
      mk: "FAK", // Maqedonisht (Фактура / Faktura)
      cg: "FAK", // Malazezisht (Faktura)
      el: "TIM", // Greqisht (Τιμολόγιο / Timologio)
      // Mund të shtosh gjuhë të tjera këtu në të ardhmen (psh. de: "REC" për Rechnung)
    };

    // 2. Marrim prefiksin sipas 'locale'. Nëse gjuha nuk ekziston në listë, përdorim 'INV' si Default.
    const prefix = prefixes[data.locale] || "INV";
    
    // 3. Gjenerojmë numrin me prefiksin dinamik
    const invoiceNum = `${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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

    revalidatePath(`/${data.locale}/biznes/abonimi`);
    return { success: true, referenceCode: invoiceNum };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi krijimi i kërkesës për pagesë." };
  }
}