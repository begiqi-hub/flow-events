"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePayment(paymentId: string, locale: string) {
  try {
    const payment = await prisma.sa_payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) return { error: "Pagesa nuk u gjet!" };

    // Tërheqim paketën bazuar në description (që mban ID-në e paketës)
    const pkg = await prisma.package.findUnique({
      where: { id: payment.description || "" }
    });

    // ==========================================
    // LOGJIKA E SAKTË E SKADENCËS PËR ABONIMET
    // ==========================================
    let monthsToAdd = 1; // Default është 1 muaj

    // Kontrolli 1: Lexojmë vlerën që lamë si "gjurmë" te payment_method (bank_yearly)
    if (payment.payment_method === "bank_yearly") {
       monthsToAdd = 12;
    } 
    // Kontrolli 2 (Backup): Kontrollojmë shumën matematikisht nëse nuk ka gjurmë
    else if (pkg && Number(payment.amount) > (Number(pkg.monthly_price) * 6)) {
       monthsToAdd = 12;
    }

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);

    // 1. Përditëso pagesën si "e përfunduar"
    await prisma.sa_payments.update({
      where: { id: paymentId },
      data: { status: "completed", paid_at: new Date() }
    });

    // 2. Aktivizojmë Biznesin dhe i japim pakon + skadencën e re
    await prisma.businesses.update({
      where: { id: payment.business_id },
      data: {
        status: "active",
        trialEndsAt: expirationDate,
        ...(pkg ? { packageId: pkg.id } : {})
      }
    });

    // 3. Dërgojmë Njoftim te Biznesi (Nëse moduli ekziston)
    try {
      await prisma.notifications.create({
         data: {
           business_id: payment.business_id,
           title: "Pagesa u Aprovua",
           message: `Pagesa juaj prej ${payment.amount}€ u konfirmua me sukses. Abonimi juaj është aktivizuar deri më ${expirationDate.toLocaleDateString('sq-AL')}.`,
           type: "payment_success",
           is_read: false
         }
      });
    } catch (e) { /* Ignored */ }

    revalidatePath(`/${locale}/superadmin/pagesat`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi aprovimi i pagesës." };
  }
}

export async function rejectPayment(paymentId: string, locale: string) {
  try {
    const payment = await prisma.sa_payments.findUnique({ where: { id: paymentId } });
    if (!payment) return { error: "Pagesa nuk u gjet!" };

    await prisma.sa_payments.update({
      where: { id: paymentId },
      data: { status: "rejected" }
    });

    // Njoftojmë biznesin për refuzimin
    try {
      await prisma.notifications.create({
         data: {
           business_id: payment.business_id,
           title: "Pagesa u Refuzua",
           message: `Transaksioni juaj prej ${payment.amount}€ është refuzuar. Ju lutem kontrolloni të dhënat e transfertes ose na kontaktoni në Qendrën e Ndihmës.`,
           type: "payment_rejected",
           is_read: false
         }
      });
    } catch (e) { /* Ignored */ }

    revalidatePath(`/${locale}/superadmin/pagesat`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Dështoi refuzimi i pagesës." };
  }
}