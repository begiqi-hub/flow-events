"use server";

import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function addPaymentAction(data: { booking_id: string; amount: number; method: string }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { error: "Nuk jeni i loguar!" };
    }

    // 1. Gjejmë përdoruesin (Stafin) që po regjistron pagesën
    const currentUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    // Nëse është pronari, mund të kërkojmë te bizneset si fallback, 
    // por nëse logimin e keni bërë që edhe pronari të jetë në tabelën `users`, currentUser do gjendet.
    let recordedById = currentUser?.id || null;

    // 2. Gjejmë rezervimin dhe llogarisim sa është paguar deri tani
    const booking = await prisma.bookings.findUnique({
      where: { id: data.booking_id },
      include: { payments: true }
    });

    if (!booking) {
      return { error: "Rezervimi nuk u gjet!" };
    }

    const totalAmount = Number(booking.total_amount);
    const alreadyPaid = booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const leftToPay = totalAmount - alreadyPaid;

    // Siguri: Nuk e lëmë stafin të fusë më shumë lekë sesa borxhi
    if (data.amount > leftToPay) {
      return { error: `Kujdes! Nuk mund të regjistroni shumë më të madhe se borxhi. (Borxhi: ${leftToPay})` };
    }

    // 3. Krijojmë pagesën e re në databazë (dhe e lidhim me stafin që e regjistroi)
    await prisma.payments.create({
      data: {
        booking_id: data.booking_id,
        amount: data.amount,
        method: data.method as "cash" | "bank" | "pos",
        recorded_by: recordedById // Mban mend kush e mori pagesën (për Audit)
      }
    });

    // 4. Llogarisim nëse klienti sapo e shleu të gjithë borxhin
    const newTotalPaid = alreadyPaid + data.amount;
    let newPaymentStatus = booking.payment_status;

    if (newTotalPaid >= totalAmount) {
      newPaymentStatus = "paid"; // U la e gjitha!
    } else if (newTotalPaid > 0) {
      newPaymentStatus = "deposit"; // Mbetet ende borxh
    }

    // 5. Përditësojmë statusin e rezervimit nëse ka ndryshuar
    if (newPaymentStatus !== booking.payment_status) {
      await prisma.bookings.update({
        where: { id: data.booking_id },
        data: { payment_status: newPaymentStatus }
      });
    }

    // 6. Rifreskojmë tabelën në mënyrë që stafi ta shohë rezultatin direkt (pa i bërë refresh faqes)
    revalidatePath("/[locale]/biznes/rezervimet", "page");
    
    return { success: true };

  } catch (error: any) {
    console.error("Gabim në ruajtjen e pagesës:", error);
    return { error: "Ndodhi një problem në server gjatë ruajtjes së pagesës!" };
  }
}

// =========================================================================
// AKSIONI I RI: RUAJTJA E SHËNIMEVE TË STAFIT DHE ADMINIT
// =========================================================================
export async function updateNotesAction(data: { booking_id: string; staff_notes: string; admin_notes: string }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { error: "Nuk jeni i loguar!" };
    }

    // Përditësojmë rezervimin me shënimet e reja
    await prisma.bookings.update({
      where: { id: data.booking_id },
      data: {
        staff_notes: data.staff_notes,
        admin_notes: data.admin_notes
      }
    });

    // Rifreskojmë faqen që të shfaqen ndryshimet direkt
    revalidatePath("/[locale]/biznes/rezervimet", "page");
    
    return { success: true };
  } catch (error: any) {
    console.error("Gabim në ruajtjen e shënimeve:", error);
    return { error: "Ndodhi një problem në server gjatë ruajtjes së shënimeve!" };
  }
}