"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

export async function getBookingAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return null;

    const booking = await prisma.bookings.findUnique({
      where: { id: id, business_id: business.id },
      include: {
        clients: true,
        halls: true,
        payments: true, 
        booking_extras: { include: { extras: true } }
      }
    });

    const allHalls = await prisma.halls.findMany({ where: { business_id: business.id } });
    const allExtras = await prisma.extras.findMany({ where: { business_id: business.id } });
    const allMenus = await prisma.menus.findMany({ where: { business_id: business.id } });

    return serializeData({ booking, allHalls, allExtras, allMenus, business });
  } catch (error) {
    console.error("Gabim në leximin e rezervimit:", error);
    return null;
  }
}

export async function updateBookingAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) return { error: "Biznesi nuk u gjet." };

    const finalTotal = Number(data.total_amount) || 0;
    const historicallyPaid = Number(data.historically_paid) || 0;
    const newPayment = Number(data.new_payment_amount) || 0;
    const totalPaidSoFar = historicallyPaid + newPayment;

    let calculatedPaymentStatus = "pending";
    if (totalPaidSoFar >= finalTotal && finalTotal > 0) {
      calculatedPaymentStatus = "paid";
    } else if (totalPaidSoFar > 0 && totalPaidSoFar < finalTotal) {
      calculatedPaymentStatus = "deposit";
    }

    await prisma.$transaction(async (tx) => {
      
      const updateData: any = {
        event_type: data.event_type || null,
        event_date: data.event_date ? new Date(data.event_date) : undefined,
        start_time: data.start_time ? new Date(`${data.event_date}T${data.start_time}:00`) : undefined,
        end_time: data.end_time ? new Date(`${data.event_date}T${data.end_time}:00`) : undefined,
        participants: data.participants ? Number(data.participants) : undefined,
        total_amount: finalTotal,
        status: data.status || "confirmed", 
        cancel_reason: data.status === 'cancelled' ? data.cancel_reason : null,
        payment_status: calculatedPaymentStatus,
      };

      // Lidhja e saktë për Sallën
      if (data.hall_id && data.hall_id !== "") {
        updateData.halls = { connect: { id: data.hall_id } };
      }

      // ==========================================
      // KUJDES: Kam çaktivizuar ruajtjen e Menusë!
      // ==========================================
      // Pasi të bësh hapat e Databazës më poshtë, hiqja dy vizat (//) këtij rreshti:
      // if (data.menu_id && data.menu_id !== "") updateData.menu_id = data.menu_id;

      // 1. Përditësojmë Rezervimin
      await tx.bookings.update({
        where: { id: id, business_id: business.id },
        data: updateData
      });

      // 2. Rifreskojmë Ekstrat
      await tx.booking_extras.deleteMany({ where: { booking_id: id } });
      if (data.selectedExtras && data.selectedExtras.length > 0) {
        for (const ext of data.selectedExtras) {
          await tx.booking_extras.create({
            data: {
              booking_id: id,
              extra_id: ext.id,
              qty: 1,
              unit_price: Number(ext.price),
              line_total: Number(ext.price)
            }
          });
        }
      }

      // 3. Regjistrojmë Pagesën e Re
      if (newPayment > 0) {
        await tx.payments.create({
          data: {
            booking_id: id,
            amount: newPayment,
            method: data.payment_method || "cash",
          }
        });
      }
    });

    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    revalidatePath("/[locale]/biznes/raportet", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("GABIM DB:", error);
    return { error: error.message ? error.message.split('\n').pop() : "Gabim i panjohur në ruajtje." };
  }
}