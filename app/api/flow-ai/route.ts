import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";

import sqMessages from "../../../messages/sq.json";
import enMessages from "../../../messages/en.json";

function format(str: string, vars: any) {
  if (!str) return "";
  return str.replace(/{(\w+)}/g, (_, k) => vars[k] || "");
}

const contains = (text: string, words: string[]) => {
  return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ reply: "Unauthorized" }, { status: 401 });

    let userRole = "admin";
    let business = await prisma.businesses.findUnique({ where: { email: session.user.email } });

    if (!business) {
      const staffUser = await prisma.users.findUnique({ where: { email: session.user.email } });
      if (staffUser && staffUser.business_id) {
        userRole = staffUser.role;
        business = await prisma.businesses.findUnique({ where: { id: staffUser.business_id } });
      }
    }

    if (!business) return NextResponse.json({ reply: "Business not found" }, { status: 404 });

    const { messages, locale } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    const cleanMessage = lastMessage.toLowerCase().trim();
    
    // Sigurohemi që po marrim saktësisht bllokun FlowAI nga JSON
    const allMessages: any = locale === "en" ? enMessages : sqMessages;
    const t = allMessages.FlowAI || {};

    let reply = "";
    let actionLink = "";
    let actionText = "";

    const formatTime = (timeData: any) => {
      if (!timeData) return "?";
      if (typeof timeData === 'string' && timeData.length <= 8) return timeData;
      try {
        const d = new Date(timeData);
        if (!isNaN(d.getTime())) {
          const hh = d.getHours().toString().padStart(2, '0');
          const mm = d.getMinutes().toString().padStart(2, '0');
          return `${hh}:${mm}`;
        }
        return String(timeData);
      } catch {
        return String(timeData);
      }
    };

    const buildEventDetails = (e: any, currency: string, role: string) => {
      const total = Number(e.total_amount) || 0;
      const paid = e.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
      const debt = total - paid;
      
      const finStatus = debt > 0 ? `⚠️ Mbetje: ${debt} ${currency}` : `✔️ Paguar plotësisht`;
      const participants = e.participants ? `${e.participants} persona` : "E pacaktuar";
      
      const sTime = formatTime(e.start_time);
      const eTime = formatTime(e.end_time);
      const time = (e.start_time || e.end_time) ? `${sTime} - ${eTime}` : "E pacaktuar";

      let text = `\n\n👤 **${e.clients?.name || 'Klient i panjohur'}** |  🏛️ Salla: **${e.halls?.name || '-'}**`;
      text += `\n   • 👥 Të ftuar: ${participants}`;
      text += `\n   • 🕒 Orari: ${time}`;
      
      if (role !== 'manager') {
        text += `\n   • 💳 Financat: ${total} ${currency}  (${finStatus})`;
      }
      
      return text;
    };

    // =======================================================================
    // 1. EVENTET E SOTME / NESËR
    // =======================================================================
    if (contains(cleanMessage, ["sot", "neser", "nesër", "sonte", "kemi sot", "evente sot"])) {
      const isTomorrow = contains(cleanMessage, ["neser", "nesër"]);
      const targetDate = new Date();
      if (isTomorrow) targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const events = await prisma.bookings.findMany({
        where: { business_id: business.id, event_date: { gte: targetDate, lt: nextDay }, status: { notIn: ['cancelled', 'draft'] } },
        include: { clients: true, halls: true, payments: true }
      });

      if (events.length > 0) {
        reply = format(t.busy_day, { date: isTomorrow ? "Nesër" : "Sot", count: events.length });
        events.forEach(e => reply += buildEventDetails(e, business.currency || '€', userRole));
        actionLink = "kalendari"; actionText = t.action_calendar;
      } else {
        reply = format(t.free_day, { date: isTomorrow ? "Nesër" : "Sot" });
        actionLink = "rezervimet/shto"; actionText = t.add_booking_btn;
      }
    }

    // =======================================================================
    // 2. DATAT SPECIFIKE (Psh. 1 Prill, 5 Prill)
    // =======================================================================
    else if (cleanMessage.match(/(\d{1,2})[\s\-/\.]*([a-zçë]+)/i)) {
      const dateMatch = cleanMessage.match(/(\d{1,2})[\s\-/\.]*([a-zçë]+)/i);
      const day = parseInt(dateMatch![1]);
      const monthStr = dateMatch![2];
      let monthIndex = -1;
      
      if (monthStr.startsWith("jan")) monthIndex = 0;
      else if (monthStr.startsWith("shk") || monthStr.startsWith("feb")) monthIndex = 1;
      else if (monthStr.startsWith("mar")) monthIndex = 2;
      else if (monthStr.startsWith("pri") || monthStr.startsWith("apr")) monthIndex = 3;
      else if (monthStr.startsWith("maj") || monthStr.startsWith("may")) monthIndex = 4;
      else if (monthStr.startsWith("qer") || monthStr.startsWith("jun")) monthIndex = 5;
      else if (monthStr.startsWith("kor") || monthStr.startsWith("jul")) monthIndex = 6;
      else if (monthStr.startsWith("gus") || monthStr.startsWith("aug")) monthIndex = 7;
      else if (monthStr.startsWith("sht") || monthStr.startsWith("sep")) monthIndex = 8;
      else if (monthStr.startsWith("tet") || monthStr.startsWith("oct")) monthIndex = 9;
      else if (monthStr.startsWith("nen") || monthStr.startsWith("nën") || monthStr.startsWith("nov")) monthIndex = 10;
      else if (monthStr.startsWith("dhj") || monthStr.startsWith("dec")) monthIndex = 11;

      if (monthIndex !== -1) {
        const d = new Date(new Date().getFullYear(), monthIndex, day);
        const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
        const eventsOnDate = await prisma.bookings.findMany({
          where: { business_id: business.id, event_date: { gte: d, lt: nextD }, status: { notIn: ['cancelled', 'draft'] } },
          include: { clients: true, halls: true, payments: true }
        });
        if (eventsOnDate.length > 0) {
          reply = format(t.busy_day, { date: `${day} ${monthStr}`, count: eventsOnDate.length });
          eventsOnDate.forEach(e => reply += buildEventDetails(e, business.currency || '€', userRole));
          actionLink = "kalendari"; actionText = t.action_calendar;
        } else {
          reply = format(t.free_day, { date: `${day} ${monthStr}` });
          actionLink = "rezervimet/shto"; actionText = t.add_booking_btn;
        }
      }
    }

    // =======================================================================
    // 3. STATISTIKAT DHE BORXHET
    // =======================================================================
    else if (contains(cleanMessage, ["borxh", "debt", "paguar", "paid", "pa la"])) {
        const bks = await prisma.bookings.findMany({
          where: { business_id: business.id, status: { notIn: ['cancelled', 'draft'] } },
          include: { clients: true, payments: true }
        });
        let totalDebt = 0, count = 0, details = "";
        bks.forEach((b: any) => {
          const debt = (Number(b.total_amount) || 0) - (b.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0);
          if (debt > 0) { 
            totalDebt += debt; 
            count++; 
            if (count <= 5) details += `\n- **${b.clients?.name || 'Klient'}**: ${debt} ${business.currency || '€'}`; 
          }
        });
        if (totalDebt > 0) {
          reply = format(t.has_debt, { total: totalDebt, currency: business.currency || '€', count: count, details: details });
          actionLink = "rezervimet"; actionText = t.action_debts;
        } else { 
          reply = t.no_debt; 
        }
    }
    else if (contains(cleanMessage, ["fitim", "profit", "lek", "pare", "revenue", "xhiro", "arkime"])) {
        if (userRole === 'manager') {
          reply = "Më falni, por raportet financiare dhe fitimet mujore janë konfidenciale dhe mund të aksesohen vetëm nga Administratori i biznesit. 🔒";
        } else {
          const now = new Date();
          const reports = await prisma.bookings.findMany({
            where: { business_id: business.id, event_date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }, status: { notIn: ['cancelled', 'draft'] } },
            include: { payments: true }
          });
          let rev = reports.reduce((s: number, b: any) => s + (b.payments?.reduce((ss: number, p: any) => ss + Number(p.amount), 0) || 0), 0);
          reply = format(t.revenue, { amount: rev, currency: business.currency || '€', count: reports.length });
          actionLink = "raportet"; actionText = t.action_reports;
        }
    }
    else if (contains(cleanMessage, ["ofert", "offer", "quotation"])) {
        reply = t.add_offer_guide; 
        actionLink = "ofertat"; 
        actionText = t.add_offer_btn;
    }

    // =======================================================================
    // 4. UDHËZUESIT E DETAIJUAR NË HAPA
    // =======================================================================
    else if (contains(cleanMessage, ["limit", "lejon", "upgrade", "abonim", "pako", "abonohem", "abonu"])) {
        if (userRole === 'manager') {
          reply = "Çështjet e limitit të paketës dhe abonimeve menaxhohen ekskluzivisht nga Administratori i biznesit.";
        } else {
          reply = t.abonim_guide; 
          actionLink = "abonimi"; 
          actionText = "Menaxho Abonimin";
        }
    }
    else if (contains(cleanMessage, ["perdorues", "user", "staf", "punonjes"])) {
        reply = t.add_user_guide; 
        actionLink = "perdoruesit"; 
        actionText = t.add_user_btn;
    }
    else if (contains(cleanMessage, ["menu", "cmim", "ushqim", "pije"])) {
        reply = t.add_menu_guide; 
        actionLink = "menut"; 
        actionText = t.add_menu_btn;
    }
    else if (contains(cleanMessage, ["sall", "hapesir", "ambient"])) {
        reply = "Për të menaxhuar sallat:\n1. Shkoni te 'Konfigurimet' në menunë e majtë.\n2. Klikoni 'Sallat'.\n3. Shtoni një sallë të re ose përditësoni kapacitetin e saj."; 
        actionLink = "sallat"; actionText = "Menaxho Sallat";
    }
    else if (contains(cleanMessage, ["ekstra", "sherbim", "shtes", "dekor", "muzik"])) {
        reply = "Për të shtuar shërbime ekstra:\n1. Shkoni te 'Konfigurimet' në menunë e majtë.\n2. Klikoni 'Ekstra'.\n3. Krijoni shërbimin e ri dhe vendosni çmimin përkatës."; 
        actionLink = "ekstra"; actionText = "Menaxho Ekstra";
    }
    else if (contains(cleanMessage, ["klient", "client"])) {
        reply = "Për të menaxhuar klientët:\n1. Shkoni tek 'Klientët' në menunë e majtë.\n2. Klikoni butonin për të shtuar një klient të ri.\n*(Këshillë: Klientët shtohen automatikisht edhe gjatë krijimit të një rezervimi)*."; 
        actionLink = "klientet"; actionText = "Menaxho Klientët";
    }
    else if (contains(cleanMessage, ["blloko", "shto rezervim", "rezervo", "dua te bllokoj", "krijo rezervim", "ndryshoj rezervim", "ndrysho rezervim", "rezervimin"])) {
        reply = t.add_booking_guide;
        actionLink = "rezervimet"; 
        actionText = t.action_calendar;
    }
    else if (contains(cleanMessage, ["pages", "paguaj", "bej pagese", "shto pagese"])) {
        reply = "Për të regjistruar një pagesë të re:\n1. Hapni detajet e atij rezervimi ('Modifiko').\n2. Shkoni poshtë te seksioni i financave.\n3. Klikoni 'Shto Pagesë' dhe shënoni shumën e dhënë nga klienti.";
        actionLink = "rezervimet"; actionText = "Shko te Rezervimet";
    }
    // Fallback vetëm nëse thotë "si te" ose "qysh" por nuk përmend asnjë nga fjalët e mësipërme (p.sh. "qysh ta bej ket gje")
    else if (contains(cleanMessage, ["si te", "si të", "qysh", "how to"])) {
        reply = "Këtë funksion mund ta gjeni lehtësisht duke naviguar në menunë e majtë. Nëse keni nevojë për diçka specifike (psh. Menu, Salla, Ekstra, Staf), thjesht më shkruani emrin e saj!";
    }

    // =======================================================================
    // 5. KËRKIMI I KLIENTIT ME EMËR
    // =======================================================================
    else if (cleanMessage.length >= 3) {
      const searchName = cleanMessage
        .replace(/a ka/gi, "").replace(/rezervim/gi, "").replace(/kur e ka/gi, "")
        .replace(/per/gi, "").replace(/për/gi, "").replace(/\?/g, "").trim();

      if (searchName.length >= 3) {
          const allActiveBookings = await prisma.bookings.findMany({
            where: { business_id: business.id, status: { notIn: ['cancelled', 'draft'] } },
            include: { clients: true, halls: true, payments: true }, 
            orderBy: { event_date: 'desc' }
          });

          const clientBooking = allActiveBookings.find(b => 
             b.clients?.name?.toLowerCase().includes(searchName)
          );

          if (clientBooking && clientBooking.clients) {
            const d = new Date(clientBooking.event_date);
            const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            
            reply = format(t.client_found, {
              name: clientBooking.clients.name,
              date: formattedDate,
              hall: clientBooking.halls?.name || "Sallë"
            });
            
            reply += buildEventDetails(clientBooking, business.currency || '€', userRole);

            actionLink = `rezervimet/${clientBooking.id}`;
            actionText = t.action_view_client;
          } else if (contains(cleanMessage, ["kur", "a ka", "kush"])) {
            reply = format(t.client_not_found, { name: searchName });
          }
      }
    }

    // =======================================================================
    // 6. FALLBACK I FUNDIT
    // =======================================================================
    if (!reply) {
      reply = t.fallback;
    }

    return NextResponse.json({ reply, actionLink, actionText });

  } catch (error) {
    console.error("AI MASTER CRITICAL ERROR:", error);
    return NextResponse.json({ 
      reply: "Sistemi po rifreskohet për momentin. Ju lutem provoni përsëri në pak sekonda! 🔄",
      actionLink: "", actionText: "" 
    }, { status: 200 });
  }
}