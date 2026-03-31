import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";

const containsAny = (text: string, words: string[]) => {
  return words.some(word => text.includes(word));
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ reply: "Duhet të jeni të kyçur për të përdorur asistentin." }, { status: 401 });
    }

    const business = await prisma.businesses.findUnique({
      where: { email: session.user.email }
    });

    if (!business) {
      return NextResponse.json({ reply: "Nuk u gjet biznesi juaj." }, { status: 404 });
    }

    const { messages } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";

    let reply = "";
    let actionLink = "";
    let actionText = "";

    // =======================================================================
    // 1. DETEKTORI INTELIGJENT I DATAVE
    // =======================================================================
    const dateRegex = /(\d{1,2})[\s\-/\.]*([a-zçë]+)/i;
    const dateMatch = lastMessage.match(dateRegex);

    let targetDate = null;
    let targetDay = null;
    let targetMonthName = "";

    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthStr = dateMatch[2];
      let monthIndex = -1;

      if (monthStr.startsWith("jan")) { monthIndex = 0; targetMonthName = "Janar"; }
      else if (monthStr.startsWith("shk")) { monthIndex = 1; targetMonthName = "Shkurt"; }
      else if (monthStr.startsWith("mar")) { monthIndex = 2; targetMonthName = "Mars"; }
      else if (monthStr.startsWith("pri")) { monthIndex = 3; targetMonthName = "Prill"; }
      else if (monthStr.startsWith("maj")) { monthIndex = 4; targetMonthName = "Maj"; }
      else if (monthStr.startsWith("qer")) { monthIndex = 5; targetMonthName = "Qershor"; }
      else if (monthStr.startsWith("kor")) { monthIndex = 6; targetMonthName = "Korrik"; }
      else if (monthStr.startsWith("gush")) { monthIndex = 7; targetMonthName = "Gusht"; }
      else if (monthStr.startsWith("sht")) { monthIndex = 8; targetMonthName = "Shtator"; }
      else if (monthStr.startsWith("tet")) { monthIndex = 9; targetMonthName = "Tetor"; }
      else if (monthStr.startsWith("nen") || monthStr.startsWith("nën")) { monthIndex = 10; targetMonthName = "Nëntor"; }
      else if (monthStr.startsWith("dhj")) { monthIndex = 11; targetMonthName = "Dhjetor"; }

      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        targetDay = day;
        targetDate = new Date(new Date().getFullYear(), monthIndex, day);
      }
    }

    // =======================================================================
    // 2. LLOGJIKA E TRURIT
    // =======================================================================

    // SKENARI 1: U gjet një datë specifike (Psh. "5 prill")
    if (targetDate && targetDay) {
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const eventsOnDate = await prisma.bookings.findMany({
        where: {
          business_id: business.id,
          event_date: { gte: targetDate, lt: nextDay },
          status: { notIn: ['cancelled', 'draft'] }
        },
        include: { clients: true, halls: true }
      });

      if (eventsOnDate.length > 0) {
        reply = `Me datë **${targetDay} ${targetMonthName}** nuk jeni plotësisht të lirë. Keni ${eventsOnDate.length} evente: 📅`;
        eventsOnDate.forEach((e: any) => {
          reply += `\n📍 ${e.clients?.name || 'Klient'} - ${e.halls?.name || 'Sallë'} (${e.participants} veta)`;
        });
        reply += `\n\nA mund t'ju ndihmoj me ndonjë datë tjetër, apo dëshironi të hapni kalendarin?`;
        actionLink = "kalendari";
        actionText = "Hap Kalendarin";
      } else {
        reply = `Super lajm! 🎉 Me datë **${targetDay} ${targetMonthName}** jeni plotësisht i lirë. Asnjë sallë nuk është e rezervuar.\n\nA dëshironi ta bllokojmë këtë datë tani?`;
        actionLink = "rezervimet/shto";
        actionText = `Bëj rezervim për ${targetDay} ${targetMonthName}`;
      }

    // SKENARI 2: Pyetje rreth Limiteve / "Pse nuk më lejon?"
    } else if (containsAny(lastMessage, ["nuk me lejon", "sme lejon", "s'me lejon", "nuk po mund", "bllokuar", "limit", "s'po me le", "spo me lejon"])) {
      reply = "Nëse sistemi nuk ju lejon të shtoni më shumë salla, menu, shërbime apo përdorues, kjo zakonisht ndodh sepse keni arritur **limitin e paketës suaj aktuale**. 🛑\n\nMos u shqetësoni! Për të hequr këto limite dhe për të shfrytëzuar potencialin e plotë të sistemit, ju ftoj të shikoni paketat tona më të mëdha.";
      actionLink = "abonimi";
      actionText = "Shiko Paketat (Upgrade)";

    // SKENARI 3: Abonimet dhe Paketat
    } else if (containsAny(lastMessage, ["abonohem", "abonimi", "abonim", "pako", "paket", "paketë", "ndryshoj pako", "upgrade", "blej"])) {
      reply = "Për të menaxhuar abonimin tuaj, për të kaluar në një paketë më të madhe, ose për të parë ditët e mbetura, vizitoni panelin e Abonimeve. 🚀\n\nAty mund të zgjidhni planin që i përshtatet më së miri rritjes së biznesit tuaj!";
      actionLink = "abonimi";
      actionText = "Menaxho Abonimin";

    // SKENARI 4: UDHËZUESI I SISTEMIT (Si të bëj...?)
    } else if (containsAny(lastMessage, ["si të", "si te", "qysh", "si mund", "udhezim", "udhëzim", "si ta", "si behet", "si bëhet"])) {
      
      if (containsAny(lastMessage, ["rezervim", "event", "dasem"])) {
        reply = "Për të shtuar një rezervim të ri:\n1. Shkoni tek 'Rezervimet'.\n2. Klikoni 'Shto Rezervim'.\n3. Plotësoni datën, sallën dhe menunë.\n4. Klikoni 'Ruaj'.\n\nMund të shkoni direkt aty duke klikuar butonin më poshtë: 👇";
        actionLink = "rezervimet/shto";
        actionText = "Hap Formularin e Rezervimit";
      
      // SHIKONI KËTU: U shtua udhëzimi për Ofertat
      } else if (containsAny(lastMessage, ["ofert", "oferte", "oferta", "ofet"])) {
        reply = "Për të krijuar një Ofertë të re (Quotation) për një klient:\n1. Shkoni tek paneli 'Ofertat'.\n2. Klikoni butonin 'Shto Ofertë' (ose ekuivalentin e tij).\n3. Plotësoni detajet e klientit, sallën e dëshiruar dhe shërbimet.\n4. Ruajeni dhe dërgojani klientit! 📄\n\nMund të shkoni direkt aty duke klikuar këtu: 👇";
        actionLink = "ofertat";
        actionText = "Krijo Ofertë të Re";

      } else if (containsAny(lastMessage, ["perdorues", "përdorues", "staf", "punetor", "punëtor", "kamerier"])) {
        reply = "Për të shtuar staf të ri:\n1. Shkoni tek 'Konfigurimet' > 'Stafi'.\n2. Klikoni 'Shto Përdorues'.\n3. Shënoni emrin, emailin dhe zgjidhni rolin.\n\nMund ta bëni direkt nga këtu: 👇";
        actionLink = "perdoruesit";
        actionText = "Shto Përdorues të Ri";
      } else if (containsAny(lastMessage, ["menu", "cmim", "çmim", "pjat"])) {
        reply = "Për të ndryshuar çmimin ose krijuar Menu të re:\n1. Hapni 'Konfigurimet' > 'Menutë'.\n2. Klikoni 'Shto Menu' ose ikonën e lapsit ✏️ tek një menu ekzistuese.\n\nHapni menutë duke klikuar këtu: 👇";
        actionLink = "menut";
        actionText = "Menaxho Menutë";
      } else if (containsAny(lastMessage, ["ekstra", "sherbim", "shërbim", "dekor", "muzik"])) {
        reply = "Për të shtuar shërbime (Dekorim, Muzikë, etj):\n1. Shkoni tek 'Konfigurimet' > 'Shërbime Ekstra'.\n2. Klikoni 'Shto Ekstra' dhe vendosni çmimin.";
        actionLink = "ekstra";
        actionText = "Menaxho Shërbimet Ekstra";
      } else if (containsAny(lastMessage, ["sall", "hapesir"])) {
        reply = "Për të menaxhuar Sallat:\n1. Hapni 'Konfigurimet' > 'Sallat'.\n2. Këtu mund të shtoni salla ose të ndryshoni kapacitetin e tyre.";
        actionLink = "sallat";
        actionText = "Menaxho Sallat";
      } else if (containsAny(lastMessage, ["bank", "llogari", "iban", "fature"])) {
        reply = "Për të përditësuar bankën (për faturat):\n1. Hapni profilin (lart djathtas) > 'Llogaria Bankare'.\n2. Shënoni Bankën dhe IBAN-in.";
        actionLink = "banka";
        actionText = "Konfiguro Bankën";
      } else {
        reply = "Duket se po kërkoni një udhëzim! 💡\nProvoni të më pyesni më specifikisht: 'Si të shtoj një ofertë?' ose 'Si të ndryshoj çmimin?'";
      }

    // SKENARI 5: Borxhet
    } else if (containsAny(lastMessage, ["borxh", "papaguar", "pa paguar", "pa la", "pala", "mbet", "pambledhur", "pa marr"])) {
      const allBookings = await prisma.bookings.findMany({
        where: { business_id: business.id, status: { notIn: ['cancelled', 'draft'] } },
        include: { clients: true, payments: true }
      });

      let totalDebt = 0;
      let debtorsCount = 0;
      let debtDetails = "";

      allBookings.forEach((b: any) => {
        const total = Number(b.total_amount) || 0;
        const paid = b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        const mbetja = total - paid;
        
        if (mbetja > 0 && b.clients?.name) {
          totalDebt += mbetja;
          debtorsCount++;
          if (debtorsCount <= 3) { 
            debtDetails += `\n- ${b.clients.name}: ${mbetja} ${business.currency || '€'}`;
          }
        }
      });

      if (totalDebt > 0) {
        reply = `Keni gjithsej ${totalDebt} ${business.currency || '€'} borxhe nga ${debtorsCount} klientë. 💰\nDisa prej tyre janë:${debtDetails}${debtorsCount > 3 ? `\n...dhe ${debtorsCount - 3} të tjerë.` : ''}\n\nA dëshironi t'i shikoni të detajuara?`;
        actionLink = "rezervimet?filter=debt";
        actionText = "Shiko Borxhet";
      } else {
        reply = "Lajme të shkëlqyera! 🎉 Nuk keni asnjë borxh të pambledhur në sistem.";
      }

    // SKENARI 6: Kalendari fiks Sot ose Nesër
    } else if (containsAny(lastMessage, ["sot", "nesër", "neser", "sotme", "neserme", "sonte"])) {
      const isTomorrow = lastMessage.includes("nesër") || lastMessage.includes("neser");
      const targetDate = new Date();
      if (isTomorrow) targetDate.setDate(targetDate.getDate() + 1);
      
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const events = await prisma.bookings.findMany({
        where: {
          business_id: business.id,
          event_date: { gte: targetDate, lt: nextDay },
          status: { notIn: ['cancelled', 'draft'] }
        },
        include: { clients: true, halls: true }
      });

      if (events.length > 0) {
        reply = `Për ${isTomorrow ? 'nesër' : 'sot'} keni ${events.length} evente të planifikuara: 📅\n`;
        events.forEach((e: any) => {
          reply += `\n📍 ${e.clients?.name || 'Klient i panjohur'} - ${e.halls?.name || 'Sallë'}`;
        });
        actionLink = "kalendari";
        actionText = "Hap Kalendarin";
      } else {
        reply = `Për ${isTomorrow ? 'nesër' : 'sot'} jeni plotësisht të lirë! Asnjë event në kalendar. 🏖️`;
        actionLink = "rezervimet/shto";
        actionText = "Shto një Event";
      }

    // SKENARI 7: Raportet dhe Fitimet
    } else if (containsAny(lastMessage, ["fitim", "raport", "xhiro", "lek", "pare", "euro", "muaj", "ardhura", "fitoj"])) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const monthBookings = await prisma.bookings.findMany({
        where: {
          business_id: business.id,
          event_date: { gte: firstDay, lte: lastDay },
          status: { notIn: ['cancelled', 'draft'] }
        },
        include: { payments: true }
      });

      let revenue = 0;
      monthBookings.forEach((b: any) => {
        const paid = b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        revenue += paid;
      });

      reply = `Për këtë muaj keni gjeneruar **${revenue} ${business.currency || '€'}** të ardhura nga ${monthBookings.length} evente. 📈`;
      actionLink = "raportet";
      actionText = "Shiko Raportin e Plotë";

    // SKENARI 8: Pyetja sa Ofertat (Quotations) kemi?
    } else if (containsAny(lastMessage, ["ofert", "oferte", "oferta", "ofet", "ofeta"]) && !containsAny(lastMessage, ["si", "qysh"])) {
      const pendingOffers = await prisma.bookings.count({
        where: { business_id: business.id, status: 'quotation' }
      });

      if (pendingOffers > 0) {
        reply = `Aktualisht keni ${pendingOffers} oferta aktive në sistem. 📄`;
        actionLink = "ofertat";
        actionText = "Shiko Ofertat";
      } else {
        reply = "Nuk keni asnjë ofertë aktive për momentin. Mund të krijoni një të re kurdoherë! 📝";
        actionLink = "ofertat"; 
        actionText = "Hap panelin e Ofertave";
      }

    // SKENARI 9: Pyetje e Përgjithshme për "Datë"
    } else if (containsAny(lastMessage, ["dat", "datë", "date", "cilen", "kur", "cila", "dit", "ditë"])) {
      reply = "Për të kontrolluar kalendarin, më duhet një datë specifike! 📅\nJu lutem më shkruani ditën dhe muajin (psh. 'A kemi të lirë me 20 Maj?').";
      actionLink = "kalendari";
      actionText = "Hap Kalendarin";

    // SKENARI 10: Rezervim pa specifikuar datë
    } else if (containsAny(lastMessage, ["rezerv", "shto", "blloko", "dasem", "dasm", "aheng", "lirë", "lire", "sall"])) {
      reply = "Nëse dëshironi të shihni a është salla e lirë, thjesht më thoni datën (psh. 'A kemi të lirë me 5 Prill?').\nPërndryshe, mund të shtoni rezervimin direkt:";
      actionLink = "rezervimet/shto";
      actionText = "Krijo Rezervim";

    // SKENARI 11: Kërkesat (Recepsioni)
    } else if (containsAny(lastMessage, ["recepsion", "kerkes", "kërkes", "pritje"])) {
      const pendingRequests = await prisma.bookings.count({
        where: { business_id: business.id, status: 'pending' }
      });

      if (pendingRequests > 0) {
        reply = `Keni ${pendingRequests} kërkesa "Në Pritje" nga recepsioni. 🔔`;
        actionLink = "rezervimet?filter=pending";
        actionText = "Shqyrto Kërkesat";
      } else {
        reply = "Nuk keni asnjë kërkesë të re nga recepsioni. ✅";
      }

    // =======================================================================
    // FALLBACK
    // =======================================================================
    } else {
      reply = `Nuk e kapa dot plotësisht këtë që shkruat. 🤔 Por unë jam këtu për t'ju ndihmuar!\n\nMund të më pyesni për:\n\n📅 **Kalendarin:** "A jemi të lirë me 15 Prill?"\n💰 **Financat:** "Kush na ka borxh?"\n⚙️ **Udhëzime:** "Si të shtoj një ofertë?"\n🚀 **Abonimin:** "Si të ndryshoj paketë?"\n\nSi mund t'ju ndihmoj sot?`;
    }

    return NextResponse.json({ reply, actionLink, actionText });

  } catch (error) {
    console.error("Flow AI Algorithm Error:", error);
    return NextResponse.json({ reply: "Ups! Pati një problem me serverin e të dhënave.", actionLink: "", actionText: "" });
  }
}