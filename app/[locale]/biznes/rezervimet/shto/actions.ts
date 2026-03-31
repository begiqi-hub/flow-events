"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 0. FUNKSIONET NDIHMËSE (PA TIMEZONES!)
// ==========================================
function normalizeDate(dateStr: string) {
  if (dateStr.includes('.')) {
    const [d, m, y] = dateStr.split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (dateStr.includes('/')) {
    const [m, d, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

function timeToMinutes(timeStr: string) {
  const clean = (timeStr || "").toLowerCase().trim();
  let h = 0, m = 0;
  if (clean.includes('am') || clean.includes('pm')) {
    const isPM = clean.includes('pm');
    const parts = clean.replace(/[a-z]/g, '').trim().split(':');
    h = parseInt(parts[0] || "0");
    m = parseInt(parts[1] || "0");
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
  } else {
    const parts = clean.split(':');
    h = parseInt(parts[0] || "0");
    m = parseInt(parts[1] || "0");
  }
  return (h * 60) + m;
}

// ==========================================
// 1. KONTROLLI I ORARIT (MATEMATIKË E PASTËR)
// ==========================================
export async function checkAvailabilityAction(hallId: string, dateStr: string, startTime: string, endTime: string) {
  try {
    const reqDate = normalizeDate(dateStr);
    const reqStartMin = timeToMinutes(startTime);
    let reqEndMin = timeToMinutes(endTime);

    if (reqEndMin <= reqStartMin) reqEndMin += 1440; 

    const bookings = await prisma.bookings.findMany({
      where: {
        hall_id: hallId,
        status: { notIn: ['cancelled', 'draft'] } 
      }
    });

    let hasQuotation = false;

    for (const b of bookings) {
      if (!b.event_date || !b.start_time || !b.end_time) continue;

      const dbDate = b.event_date.toISOString().split('T')[0];

      if (dbDate === reqDate) {
        const bStartMin = (b.start_time.getUTCHours() * 60) + b.start_time.getUTCMinutes();
        let bEndMin = (b.end_time.getUTCHours() * 60) + b.end_time.getUTCMinutes();

        if (bEndMin <= bStartMin) bEndMin += 1440;

        if (reqStartMin < bEndMin && reqEndMin > bStartMin) {
          
          if (b.status === 'quotation') {
            hasQuotation = true;
          } else {
            const h = String(Math.floor(bStartMin / 60)).padStart(2, '0');
            const m = String(bStartMin % 60).padStart(2, '0');
            return { available: false, message: `⛔️ Salla është e zënë! Një event fillon në orën ${h}:${m}.` };
          }
        }
      }
    }

    if (hasQuotation) {
      return { 
        available: true, 
        warning: true, 
        message: "Kujdes: Për këtë orar ekziston 1 Ofertë e hapur. Nëse vazhdoni dhe e konfirmoni, oferta e vjetër do të anulohet automatikisht." 
      };
    }

    return { available: true };
  } catch (error) {
    console.error(error);
    return { available: false, message: "Ndodhi një gabim gjatë verifikimit!" };
  }
}

// ==========================================
// 2. RUAJTJA E REZERVIMIT
// ==========================================
export async function saveReservationAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    const user = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet." };
    const businessId = user.business_id;

    const reqDate = normalizeDate(data.event_date);
    const reqStartMin = timeToMinutes(data.start_time);
    const reqEndMin = timeToMinutes(data.end_time);

    const eventDateObj = new Date(`${reqDate}T12:00:00.000Z`);
    
    const startH = String(Math.floor(reqStartMin / 60)).padStart(2, '0');
    const startM = String(reqStartMin % 60).padStart(2, '0');
    const startTimeObj = new Date(`${reqDate}T${startH}:${startM}:00.000Z`);

    const diffMins = (reqEndMin < reqStartMin ? reqEndMin + 1440 : reqEndMin) - reqStartMin;
    const endTimeObj = new Date(startTimeObj.getTime() + (diffMins * 60000));

    const result = await prisma.$transaction(async (tx) => {
      
      const fullPhone = `${data.client_phone_prefix} ${data.client_phone}`;
      let client = await tx.clients.findFirst({ where: { business_id: businessId, phone: fullPhone } });

      if (!client) {
        client = await tx.clients.create({
          data: {
            business_id: businessId,
            name: data.client_type === 'business' ? `${data.client_business_name} (Përfaqësues: ${data.client_representative})` : data.client_name,
            phone: fullPhone,
            email: data.client_email || null,
            client_type: data.client_type || 'individual',
            business_num: data.client_type === 'business' ? data.client_business_num : null,
            address: data.client_type === 'business' ? data.client_address : null,
            personal_id: data.client_type === 'individual' ? data.client_personal_id : null,
            gender: data.client_type === 'individual' ? data.client_gender : null,
            city: data.client_city || null,
          }
        });
      } else {
        client = await tx.clients.update({
          where: { id: client.id },
          data: {
            client_type: data.client_type || 'individual',
            name: data.client_type === 'business' ? `${data.client_business_name} (Përfaqësues: ${data.client_representative})` : data.client_name,
            email: data.client_email || null,
            business_num: data.client_type === 'business' ? data.client_business_num : null,
            address: data.client_type === 'business' ? data.client_address : null,
            personal_id: data.client_type === 'individual' ? data.client_personal_id : null,
            gender: data.client_type === 'individual' ? data.client_gender : null,
            city: data.client_city || null,
          }
        });
      }

      // =====================================
      // LLOGARITJA E SIGURT NË SERVER
      // =====================================
      let menuTotal = 0;
      let hallRentValue = 0;
      
      if (data.billing_model === 'per_person' && data.menu_id && data.menu_id !== "") {
        const menu = await tx.menus.findUnique({ where: { id: data.menu_id } });
        if (menu) menuTotal = Number(data.participants) * Number(menu.price_per_person);
      }
      
      if (data.billing_model === 'flat_rent') {
         hallRentValue = Number(data.hall_rent) || 0;
      }
      
      let extrasTotal = 0;
      if (data.extras && data.extras.length > 0) {
        extrasTotal = data.extras.reduce((sum: number, ext: any) => sum + Number(ext.price), 0);
      }

      const subTotal = (data.billing_model === 'flat_rent' ? hallRentValue : menuTotal) + extrasTotal;
      const discountAmount = Number(data.discount_amount) || 0;
      const finalTotal = subTotal > discountAmount ? (subTotal - discountAmount) : 0;

      let deposit = Number(data.deposit_amount) || 0;
      let calculatedPaymentStatus = "pending";
      
      if (data.payment_status === "paid" || (deposit >= finalTotal && finalTotal > 0)) {
        calculatedPaymentStatus = "paid";
      } else if (data.payment_status === "deposit" || (deposit > 0 && deposit < finalTotal)) {
        calculatedPaymentStatus = "deposit";
      }

      let finalStatus = data.payment_status === "pending" ? "pending" : "confirmed";
      if (data.is_quotation) {
        finalStatus = "quotation";
        calculatedPaymentStatus = "pending";
      }

      // KRIJIMI I REZERVIMIT ME FUSHAT E REJA
      const booking = await tx.bookings.create({
        data: {
          business_id: businessId,
          hall_id: data.hall_id,
          client_id: client.id,
          event_date: eventDateObj,
          start_time: startTimeObj,
          end_time: endTimeObj,
          participants: Number(data.participants),
          status: finalStatus as any,
          
          total_amount: finalTotal,
          payment_status: calculatedPaymentStatus,
          discount_amount: discountAmount, // <--- ZBRITJA E SHTUAR
          
          setup_type: data.setup_type || "banket", // <--- SETUP SHTUAR
          billing_model: data.billing_model || "per_person", // <--- MODELI SHTUAR
          hall_rent: hallRentValue, // <--- QIRAJA SHTUAR
          
          menu_id: data.billing_model === 'flat_rent' ? null : (data.menu_id || null),
          event_type: data.event_type || null,
          staff_notes: data.staff_notes || null, 
          admin_notes: data.admin_notes || null, 
        }
      });

      if (data.extras && data.extras.length > 0) {
        for (const extra of data.extras) {
          await tx.booking_extras.create({
            data: { booking_id: booking.id, extra_id: extra.id, qty: 1, unit_price: Number(extra.price), line_total: Number(extra.price) }
          });
        }
      }

      if (!data.is_quotation && deposit > 0) {
        await tx.payments.create({
          data: { 
            booking_id: booking.id, 
            amount: calculatedPaymentStatus === 'paid' ? finalTotal : deposit, 
            method: data.payment_method || "cash", 
            type: "payment", // Sigurohemi që regjistrohet si pagesë, jo si refund
            recorded_by: user.id 
          }
        });
      }

      if (!data.is_quotation) {
        const quotations = await tx.bookings.findMany({ where: { hall_id: data.hall_id, status: 'quotation' } });
        const qIds = quotations.filter(q => q.event_date && q.event_date.toISOString().split('T')[0] === reqDate).map(q => q.id);
        if (qIds.length > 0) {
          await tx.bookings.updateMany({ where: { id: { in: qIds } }, data: { status: 'cancelled' } });
        }
      }

      return booking;
    });

    revalidatePath("/[locale]/biznes/rezervimet", "layout");
    revalidatePath("/[locale]/biznes/ofertat", "page"); 
    
    return { success: true, bookingId: result.id };
  } catch (error: any) {
    console.error(error);
    return { error: "Gabim gjatë ruajtjes." };
  }
}