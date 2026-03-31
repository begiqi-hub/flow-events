"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

// ==========================================
// 0. PARSERI UNIVERSAL (Për Sigurinë e Datave)
// ==========================================
function parseSafeDateTime(dateStr: string, timeStr: string) {
  try {
    let year = 0, month = 0, day = 0;
    
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      day = parseInt(parts[0]); month = parseInt(parts[1]); year = parseInt(parts[2]);
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      month = parseInt(parts[0]); day = parseInt(parts[1]); year = parseInt(parts[2]); 
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      year = parseInt(parts[0]); month = parseInt(parts[1]); day = parseInt(parts[2]); 
    } else {
      return null;
    }

    let hours = 0, minutes = 0;
    const cleanTime = (timeStr || "").toLowerCase().trim();
    
    if (cleanTime.includes('pm') || cleanTime.includes('am')) {
      const isPM = cleanTime.includes('pm');
      const timeParts = cleanTime.replace(/[a-z]/g, '').trim().split(':');
      let h = parseInt(timeParts[0] || "0");
      let m = parseInt(timeParts[1] || "0");
      
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      
      hours = h;
      minutes = m;
    } else {
      const timeParts = cleanTime.split(':');
      hours = parseInt(timeParts[0] || "0");
      minutes = parseInt(timeParts[1] || "0");
    }

    const finalDate = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(finalDate.getTime())) return null;
    
    return finalDate;
  } catch (e) {
    return null;
  }
}

// ==========================================
// 1. MARRJA E REZERVIMIT
// ==========================================
export async function getBookingAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return null;

    const business = await prisma.businesses.findUnique({
      where: { id: user.business_id }
    });

    if (!business) return null;

    const booking = await prisma.bookings.findUnique({
      where: { id: id, business_id: user.business_id },
      include: {
        clients: true,
        halls: true,
        payments: true, 
        booking_extras: { include: { extras: true } }
      }
    });

    if (!booking) return null;

    const allHalls = await prisma.halls.findMany({ where: { business_id: user.business_id } });
    const allExtras = await prisma.extras.findMany({ where: { business_id: user.business_id } });
    const allMenus = await prisma.menus.findMany({ where: { business_id: user.business_id } });

    return serializeData({ booking, allHalls, allExtras, allMenus, business });
  } catch (error) {
    console.error("Gabim në leximin e rezervimit:", error);
    return null;
  }
}

// ==========================================
// 2. PËRDITËSIMI I REZERVIMIT
// ==========================================
export async function updateBookingAction(id: string, data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi ose përdoruesi nuk u gjet." };
    const businessId = user.business_id;

    // Llogaritja e Buxhetit me Rimbursimet e Përfshira
    const finalTotal = Number(data.total_amount) || 0;
    const historicallyPaid = Number(data.historically_paid) || 0;
    const newPaymentAmount = Number(data.new_payment_amount) || 0;
    
    let totalPaidSoFar = historicallyPaid;
    
    if (data.payment_type === 'refund') {
        totalPaidSoFar -= newPaymentAmount;
    } else {
        totalPaidSoFar += newPaymentAmount;
    }

    let calculatedPaymentStatus = "pending";
    if (totalPaidSoFar >= finalTotal && finalTotal > 0) {
      calculatedPaymentStatus = "paid";
    } else if (totalPaidSoFar > 0 && totalPaidSoFar < finalTotal) {
      calculatedPaymentStatus = "deposit";
    }

    let updateData: any = {
      event_type: data.event_type || null,
      participants: data.participants ? Number(data.participants) : undefined,
      total_amount: finalTotal,
      status: data.status || "confirmed", 
      cancel_reason: data.status === 'cancelled' ? data.cancel_reason : null,
      payment_status: calculatedPaymentStatus,
      staff_notes: data.staff_notes || null,
      admin_notes: data.admin_notes || null,
    };

    if (data.event_date && data.start_time && data.end_time) {
       const bStart = parseSafeDateTime(data.event_date, data.start_time);
       const bEnd = parseSafeDateTime(data.event_date, data.end_time);
       
       if (bStart && bEnd) {
         if (bEnd <= bStart) bEnd.setDate(bEnd.getDate() + 1);
         updateData.event_date = bStart; 
         updateData.start_time = bStart;
         updateData.end_time = bEnd;
       }
    }

    if (data.hall_id && data.hall_id !== "") updateData.halls = { connect: { id: data.hall_id } };
    if (data.menu_id && data.menu_id !== "") updateData.menu_id = data.menu_id;

    await prisma.$transaction(async (tx) => {
      
      // 1. Përditësojmë Rezervimin
      await tx.bookings.update({
        where: { id: id, business_id: businessId },
        data: updateData
      });

      // 2. Rifreskojmë Ekstrat
      await tx.booking_extras.deleteMany({ where: { booking_id: id } });
      if (data.selectedExtras && data.selectedExtras.length > 0) {
        for (const ext of data.selectedExtras) {
          await tx.booking_extras.create({
            data: { booking_id: id, extra_id: ext.id, qty: 1, unit_price: Number(ext.price), line_total: Number(ext.price) }
          });
        }
      }

      // 3. Regjistrojmë Pagesën ose Rimbursimin (Refund)
      if (newPaymentAmount > 0) {
        await tx.payments.create({
          data: {
            booking_id: id,
            amount: newPaymentAmount,
            method: data.payment_method || "cash",
            type: data.payment_type || "payment", // KËTU HYN NË LOJË "REFUND"
            recorded_by: user.id
          }
        });
      }

      // 4. Regjistrimi në Logfile
      let logActionName = "Modifikim Booking";
      let logDetailText = `U ndryshuan të dhënat e rezervimit. Statusi: ${data.status}`;

      if (data.status === 'cancelled') logActionName = "Anulim Booking";
      if (data.payment_type === 'refund' && newPaymentAmount > 0) {
         logDetailText += ` | U rimbursohet klienti me: ${newPaymentAmount}`;
      }

      await tx.audit_logs.create({
        data: {
          business_id: businessId,
          user_id: user.id,
          action: logActionName,
          entity: "bookings",
          entity_id: id,
          after_state: JSON.stringify({ detaje: logDetailText })
        }
      });
      
    });

    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    revalidatePath("/[locale]/biznes/raportet", "layout");
    revalidatePath("/[locale]/biznes/logfile", "page"); 
    
    return { success: true };

  } catch (error: any) {
    console.error("GABIM DB:", error);
    return { error: error.message ? error.message.split('\n').pop() : "Gabim i panjohur në ruajtje." };
  }
}