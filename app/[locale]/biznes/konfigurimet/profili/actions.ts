"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBusinessProfileAction(data: any) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Nuk jeni i loguar!" };

    // 1. Gjejmë User-in e loguar për të marrë ID-në e biznesit të tij
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { business_id: true }
    });

    if (!user || !user.business_id) return { error: "Biznesi nuk u gjet për këtë përdorues." };

    // 2. Tani gjejmë Biznesin e saktë me anë të ID-së
    const business = await prisma.businesses.findUnique({
      where: { id: user.business_id }
    });

    if (!business) return { error: "Biznesi nuk ekziston në databazë." };

    // Kontrolli i emailit
    if (data.email && data.email !== business.email) {
      const emailExists = await prisma.businesses.findUnique({ where: { email: data.email } });
      if (emailExists) return { error: "Ky email po përdoret nga një biznes tjetër!" };
    }
    
    // Kontrolli i NUI
    if (data.nui && data.nui !== business.nui) {
      const nuiExists = await prisma.businesses.findUnique({ where: { nui: data.nui } });
      if (nuiExists) return { error: "Ky NUI ekziston në sistem!" };
    }

    // 3. Përditësojmë të dhënat e biznesit, duke përfshirë VULËN dhe FIRMËN E BIZNESIT
    await prisma.businesses.update({
      where: { id: business.id },
      data: {
        name: data.name,
        nui: data.nui,
        email: data.email,
        phone: data.phone,
        city: data.city,
        cancel_penalty: Number(data.cancel_penalty) || 0,
        cancel_days: Number(data.cancel_days) || 0,
        
        vat_number: data.vat_number || null,
        vat_rate: data.vat_rate ? Number(data.vat_rate) : 0,
        business_type: data.business_type || null,
        responsible_person: data.responsible_person || null,
        website: data.website || null,
        country: data.country || null,
        address: data.address || null,
        currency: data.currency || "EUR",
        logo_url: data.logo_url || null,

        // === FUSHAT E REJA PËR VULËN DHE FIRMËN E BIZNESIT ===
        stamp_url: data.stamp_url || null, // Shtegu i PNG së Vulës
        stamp_description: data.stamp_description || null, // Përshkrimi
        signature_url: data.signature_url || null, // Shtegu i PNG së Firmës së Pronarit

        // Të dhënat bankare
        bank_name: data.bank_name || null,
        account_holder: data.account_holder || null,
        iban: data.iban || null,
        swift: data.swift || null,
      }
    });

    revalidatePath("/[locale]/biznes/konfigurimet/profili", "page");
    return { success: true };
  } catch (error: any) {
    console.error("GABIM:", error);
    return { error: "Ndodhi një gabim gjatë përditësimit të profilit." };
  }
}