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

    let recordedById = currentUser?.id || null;
    let businessId = currentUser?.business_id;

    if (!recordedById || !businessId) {
      return { error: "Përdoruesi ose biznesi nuk u gjet." };
    }

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

    // 3. PËRDORIM TRANSACTION: Që Pagesa, Statusi dhe Historiku të ruhen njëherësh
    await prisma.$transaction(async (tx) => {
      
      // Krijojmë pagesën
      await tx.payments.create({
        data: {
          booking_id: data.booking_id,
          amount: data.amount,
          method: data.method as "cash" | "bank" | "pos",
          recorded_by: recordedById
        }
      });

      // Llogarisim nëse klienti sapo e shleu të gjithë borxhin
      const newTotalPaid = alreadyPaid + data.amount;
      let newPaymentStatus = booking.payment_status;

      if (newTotalPaid >= totalAmount) {
        newPaymentStatus = "paid"; 
      } else if (newTotalPaid > 0) {
        newPaymentStatus = "deposit"; 
      }

      // Përditësojmë statusin e rezervimit nëse ka ndryshuar
      if (newPaymentStatus !== booking.payment_status) {
        await tx.bookings.update({
          where: { id: data.booking_id },
          data: { payment_status: newPaymentStatus }
        });
      }

      // ZGJIDHJA KYÇE (PIKA 1): Hedhim një rresht në Histori/Performancë
      await tx.audit_logs.create({
        data: {
          business_id: businessId,
          user_id: recordedById,
          action: "Shtim Pagese (E Shpejtë)",
          entity: "bookings",
          entity_id: data.booking_id,
          after_state: JSON.stringify({ 
            detaje: `Shtoi pagesën prej ${data.amount}€. Metoda: ${data.method === 'cash' ? 'Cash' : data.method === 'pos' ? 'POS/Kartë' : 'Bankë'}`
          })
        }
      });

    });

    // 4. Rifreskojmë tabelën në mënyrë që stafi ta shohë rezultatin direkt
    revalidatePath("/[locale]/biznes/rezervimet", "page");
    revalidatePath("/[locale]/biznes/raportet/stafi/performanca", "page");
    
    return { success: true };

  } catch (error: any) {
    console.error("Gabim në ruajtjen e pagesës:", error);
    return { error: "Ndodhi një problem në server gjatë ruajtjes së pagesës!" };
  }
}

export async function updateNotesAction(data: { booking_id: string; staff_notes: string; admin_notes: string }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { error: "Nuk jeni i loguar!" };
    }

    const currentUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    // Përditësojmë rezervimin me shënimet e reja
    await prisma.bookings.update({
      where: { id: data.booking_id },
      data: {
        staff_notes: data.staff_notes,
        admin_notes: data.admin_notes
      }
    });

    // Hedhim ndryshimin e shënimeve në histori
    if (currentUser?.business_id) {
       await prisma.audit_logs.create({
         data: {
           business_id: currentUser.business_id,
           user_id: currentUser.id,
           action: "Ndryshimi i Shënimeve",
           entity: "bookings",
           entity_id: data.booking_id,
           after_state: JSON.stringify({ detaje: "U përditësuan shënimet e rezervimit." })
         }
       });
    }

    revalidatePath("/[locale]/biznes/rezervimet", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Gabim në ruajtjen e shënimeve:", error);
    return { error: "Ndodhi një problem në server gjatë ruajtjes së shënimeve!" };
  }
}