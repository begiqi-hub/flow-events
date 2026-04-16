"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/prisma"; 
import { revalidatePath } from "next/cache";

const serializeData = (data: any) => JSON.parse(JSON.stringify(data));

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
    } else return null;

    let hours = 0, minutes = 0;
    const cleanTime = (timeStr || "").toLowerCase().trim();
    if (cleanTime.includes('pm') || cleanTime.includes('am')) {
      const isPM = cleanTime.includes('pm');
      const timeParts = cleanTime.replace(/[a-z]/g, '').trim().split(':');
      let h = parseInt(timeParts[0] || "0");
      let m = parseInt(timeParts[1] || "0");
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      hours = h; minutes = m;
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
        creator: { select: { full_name: true, role: true } }, 
        payments: { include: { users: { select: { full_name: true } } }, orderBy: { paid_at: 'desc' } },
        booking_extras: { include: { extras: true } }
      }
    });

    if (!booking) return null;

    const auditLogs = await prisma.audit_logs.findMany({
        where: { entity_id: id, entity: "bookings" },
        include: { users: { select: { full_name: true, role: true } } }, 
        orderBy: { created_at: 'desc' }
    });

    const allHalls = await prisma.halls.findMany({ where: { business_id: user.business_id } });
    const allExtras = await prisma.extras.findMany({ where: { business_id: user.business_id } });
    const allMenus = await prisma.menus.findMany({ where: { business_id: user.business_id } });
    const allClients = await prisma.clients.findMany({ where: { business_id: user.business_id }, orderBy: { created_at: 'desc' } });

    return serializeData({ booking, allHalls, allExtras, allMenus, allClients, business, auditLogs });
  } catch (error) {
    return null;
  }
}

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

    const existingBooking = await prisma.bookings.findUnique({
        where: { id: id, business_id: businessId },
        select: { client_id: true }
    });

    if (!existingBooking) return { error: "Rezervimi nuk ekziston." };

    const finalTotal = Number(data.total_amount) || 0;
    const historicallyPaid = Number(data.historically_paid) || 0;
    const newPaymentAmount = Number(data.new_payment_amount) || 0;
    
    let totalPaidSoFar = historicallyPaid;
    if (data.payment_type === 'refund') totalPaidSoFar -= newPaymentAmount;
    else totalPaidSoFar += newPaymentAmount;

    let calculatedPaymentStatus = "pending";
    if (totalPaidSoFar >= finalTotal && finalTotal > 0) calculatedPaymentStatus = "paid";
    else if (totalPaidSoFar > 0 && totalPaidSoFar < finalTotal) calculatedPaymentStatus = "deposit";

    let updateData: any = {
      event_type: data.event_type || null,
      participants: data.participants ? Number(data.participants) : undefined,
      total_amount: finalTotal,
      status: data.status || "confirmed", 
      cancel_reason: data.status === 'cancelled' ? data.cancel_reason : null,
      payment_status: calculatedPaymentStatus,
      staff_notes: data.staff_notes || null,
      admin_notes: data.admin_notes || null,
      // ZGJIDHJA PËR SALLËN OSE MENUNË
      hall_id: data.hall_id || null,
      menu_id: data.menu_id || null,
    };

    if (data.event_date && data.start_time && data.end_time) {
       const bStart = parseSafeDateTime(data.event_date, data.start_time);
       const bEnd = parseSafeDateTime(data.event_date, data.end_time);
       if (bStart && bEnd) {
         if (bEnd <= bStart) bEnd.setDate(bEnd.getDate() + 1);
         updateData.event_date = bStart; updateData.start_time = bStart; updateData.end_time = bEnd;
       }
    }

    await prisma.$transaction(async (tx) => {
      if (existingBooking.client_id) {
        await tx.clients.update({
            where: { id: existingBooking.client_id },
            data: {
                name: data.client_name || "I panjohur",
                phone: data.client_phone || null,
                email: data.client_email || null,
                client_type: data.client_type || "individual",
                business_num: data.client_type === 'business' ? (data.business_num || null) : null,
                personal_id: data.client_type === 'individual' ? (data.personal_no || null) : null,
                gender: data.client_type === 'individual' ? (data.gender || null) : null,
                city: data.city || null,
                address: data.address || null
            }
        });
      }

      await tx.bookings.update({ where: { id: id, business_id: businessId }, data: updateData });

      await tx.booking_extras.deleteMany({ where: { booking_id: id } });
      if (data.selectedExtras && data.selectedExtras.length > 0) {
        for (const ext of data.selectedExtras) {
          await tx.booking_extras.create({
            data: { booking_id: id, extra_id: ext.id, qty: 1, unit_price: Number(ext.price), line_total: Number(ext.price) }
          });
        }
      }

      if (newPaymentAmount > 0) {
        await tx.payments.create({
          data: {
            booking_id: id, amount: newPaymentAmount, method: data.payment_method || "cash",
            type: data.payment_type || "payment", recorded_by: user.id 
          }
        });
      }

      let logActionName = "Modifikim Rezervimi";
      let logDetailText = `Përditësoi të dhënat. Statusi: ${data.status}`;
      if (data.status === 'cancelled') logActionName = "Anulim Rezervimi";
      if (data.status === 'quotation') logActionName = "Gjeneroi Ofertë";
      
      await tx.audit_logs.create({
        data: {
          business_id: businessId, user_id: user.id, action: logActionName,
          entity: "bookings", entity_id: id, after_state: JSON.stringify({ detaje: logDetailText })
        }
      });
    });

    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    revalidatePath("/[locale]/biznes/ofertat", "layout"); 
    return { success: true };

  } catch (error: any) {
    return { error: error.message ? error.message.split('\n').pop() : "Gabim i panjohur në ruajtje." };
  }
}