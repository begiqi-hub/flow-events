"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { startOfDay, endOfDay, addDays, format, startOfMonth, endOfMonth } from "date-fns";

export async function askAssistantAction(message: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { reply: "Nuk jeni i loguar." };

    let business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) {
      const staff = await prisma.users.findUnique({ where: { email: session.user.email } });
      if (staff && staff.business_id) {
        business = await prisma.businesses.findUnique({ where: { id: staff.business_id } });
      }
    }
    if (!business) return { reply: "Biznesi nuk u gjet." };

    const text = message.toLowerCase().trim();

    // ========================================================
    // 1. LOGJIKA PËR KËRKESAT E RECEPSIONIT (PENDING)
    // ========================================================
    if (text.includes("kërkes") || text.includes("kerkes") || text.includes("recepsion") || text.includes("pritje")) {
      const pendingBookings = await prisma.bookings.findMany({
        where: { business_id: business.id, status: "pending" },
        include: { clients: true }
      });

      if (pendingBookings.length === 0) {
        return { reply: "Nuk keni asnjë kërkesë në pritje nga recepsioni. Gjithçka është e pastër! ✨" };
      } else {
        let replyStr = `Keni ${pendingBookings.length} kërkesë/a të reja që presin shqyrtim:\n\n`;
        pendingBookings.forEach(b => {
          replyStr += `🔹 ${b.clients?.name} (Data: ${format(new Date(b.event_date), 'dd.MM.yyyy')})\n`;
        });
        
        return { 
          reply: replyStr,
          actionLink: "rezervimet?filter=pending",
          actionText: "Shqyrto Kërkesat Tani"
        };
      }
    }

    // ========================================================
    // 2. LOGJIKA PËR BORXHET
    // ========================================================
    if (text.includes("borxh") || text.includes("mbetje") || text.includes("papaguar") || text.includes("pagesa")) {
      const allBookings = await prisma.bookings.findMany({
        where: { business_id: business.id, status: { not: "cancelled" } },
        include: { payments: true }
      });

      let debtCount = 0;
      let totalDebt = 0;

      allBookings.forEach(b => {
        const total = Number(b.total_amount) || 0;
        let paid = 0;
        b.payments?.forEach((p: any) => {
          if (p.type === 'refund') paid -= Number(p.amount);
          else paid += Number(p.amount);
        });
        const left = total - paid;
        if (left > 0) {
          debtCount++;
          totalDebt += left;
        }
      });

      if (debtCount === 0) {
        return { reply: "🎉 Lajm i shkëlqyer! Nuk keni asnjë klient me borxhe të mbetura." };
      } else {
        return { 
          reply: `Keni ${debtCount} klientë që ju detyrohen para. Totali i borxheve është ${totalDebt.toFixed(2)}.\n(Kujdes: Kjo përfshin të gjitha kohërat, jo vetëm këtë muaj).`,
          actionLink: "rezervimet?filter=debt",
          actionText: "Shiko Borxhlinjtë"
        };
      }
    }

    // ========================================================
    // 3. LOGJIKA PËR RAPORTIN DHE QARKULLIMIN E MUAJIT AKTUAL
    // ========================================================
    if (text.includes("fitim") || text.includes("raport") || text.includes("këtë muaj") || text.includes("kete muaj") || text.includes("qarkullim")) {
      const now = new Date();
      const firstDay = startOfMonth(now);
      const lastDay = endOfMonth(now);

      const monthBookings = await prisma.bookings.findMany({
        where: { 
          business_id: business.id, 
          event_date: { gte: firstDay, lte: lastDay },
          status: { notIn: ["cancelled", "draft", "quotation", "pending"] } 
        },
        include: { payments: true } // E SIGURTË! (Nuk kërkojmë menus/extras)
      });

      if (monthBookings.length === 0) {
        return { reply: "Për këtë muaj nuk keni asnjë event të konfirmuar ende, prandaj nuk ka të dhëna financiare." };
      }

      let qarkullimiTotal = 0;
      let arketuar = 0;

      monthBookings.forEach(b => {
        qarkullimiTotal += Number(b.total_amount) || 0;

        b.payments?.forEach((p: any) => {
          if (p.type === 'refund') arketuar -= Number(p.amount);
          else arketuar += Number(p.amount);
        });
      });

      const mbetjet = Math.max(0, qarkullimiTotal - arketuar);
      const monthName = format(now, 'MMMM yyyy');

      let replyStr = `📊 **Raporti i shpejtë për ${monthName}:**\n\n`;
      replyStr += `• Evente të Konfirmuara: ${monthBookings.length}\n`;
      replyStr += `• Qarkullimi (Vlera e Kontratave): ${qarkullimiTotal.toLocaleString('de-DE', {minimumFractionDigits: 2})} €\n`;
      replyStr += `• **Të Arkëtuara (Para në dorë): ${arketuar.toLocaleString('de-DE', {minimumFractionDigits: 2})} €**\n\n`;
      
      if (mbetjet > 0) {
        replyStr += `⚠️ Kujdes: Keni ende ${mbetjet.toLocaleString('de-DE', {minimumFractionDigits: 2})} € të pa arkëtuara për eventet e këtij muaji.`;
      } else {
        replyStr += `✅ Të gjitha paratë e këtij muaji janë arkëtuar!`;
      }

      return { 
        reply: replyStr,
        actionLink: "raportet",
        actionText: "Shiko Raportin e Plotë"
      };
    }

    // ========================================================
    // 4. LOGJIKA PËR DATAT (Psh: "Sot", "Neser", "15 Gusht")
    // ========================================================
    let targetDate: Date | null = null;
    let dateText = "";

    if (text.includes("sot")) {
      targetDate = new Date();
      dateText = "Sot";
    } else if (text.includes("neser") || text.includes("nesër") || text.includes("nesere")) {
      targetDate = addDays(new Date(), 1);
      dateText = "Nesër";
    } else {
      const months = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "nentor", "dhjetor"];
      const regex = new RegExp(`(\\d{1,2})\\s+(${months.join('|')})`, 'i');
      const match = text.match(regex);

      if (match) {
        const day = parseInt(match[1]);
        const monthStr = match[2].toLowerCase();
        let monthIndex = months.indexOf(monthStr);
        if (monthIndex === 11) monthIndex = 10; 
        
        const year = new Date().getFullYear();
        targetDate = new Date(year, monthIndex, day);
        dateText = `${day} ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}`;
      }
    }

    if (targetDate) {
      const allHalls = await prisma.halls.findMany({ where: { business_id: business.id } });
      const bookingsOnDate = await prisma.bookings.findMany({
        where: {
          business_id: business.id,
          status: { notIn: ["cancelled"] },
          event_date: {
            gte: startOfDay(targetDate),
            lte: endOfDay(targetDate)
          }
        },
        include: { halls: true, clients: true }
      });

      if (bookingsOnDate.length === 0) {
        return { 
          reply: `Për datën ${dateText} jeni plotësisht i LIRË! Të gjitha sallat janë në dispozicion.`,
          actionLink: "rezervimet/shto",
          actionText: `Shto Rezervim për ${dateText}`
        };
      }

      const bookedHallIds = bookingsOnDate.map(b => b.hall_id);
      const freeHalls = allHalls.filter(h => !bookedHallIds.includes(h.id));
      
      let replyStr = `Për datën ${dateText}, keni ${bookingsOnDate.length} evente:\n`;
      bookingsOnDate.forEach(b => {
        replyStr += `- Salla ${b.halls?.name || 'e pacaktuar'}: e zënë nga ${b.clients?.name} (${b.status === 'pending' ? 'KËRKESË' : 'E KONFIRMUAR'}).\n`;
      });

      if (freeHalls.length > 0) {
        replyStr += `\n✅ Salla të Lira: ${freeHalls.map(h => h.name).join(', ')}.`;
      } else {
        replyStr += `\n❌ Jeni PLOT! Të gjitha sallat janë të zëna.`;
      }

      return { reply: replyStr };
    }

    // ========================================================
    // 5. PËRGJIGJA DEFAULT (Nëse nuk kupton)
    // ========================================================
    return { 
      reply: "Më falni, nuk ju kuptova plotësisht. Mund të më pyesni për:\n- Kërkesat nga recepsioni\n- A kemi sallë të lirë më [Datë Muaj]?\n- Kush ka borxhe?\n- Çfarë eventesh kemi sot?" 
    };

  } catch (error) {
    console.error(error);
    return { reply: "Ndodhi një gabim gjatë lidhjes me sistemin." };
  }
}