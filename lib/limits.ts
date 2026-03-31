import { prisma } from "./prisma";

export async function checkBusinessLimit(
  businessId: string, 
  resource: "halls" | "menus" | "users" | "extras"
) {
  const business = await prisma.businesses.findUnique({
    where: { id: businessId },
    include: { package: true }
  });

  if (!business) {
    return { allowed: false, isLimitError: true, title: "Gabim", message: "Biznesi nuk u gjet." };
  }

  // ==============================================================
  // 1. KONTROLLI PËR BIZNESET NË PROVË (TRIAL)
  // ==============================================================
  if (business.status === 'trial') {
    let limit = 0;
    let currentCount = 0;
    let resourceName = "";

    // Limitet manuale për periudhën e provës
    if (resource === "halls") {
      limit = 1;
      currentCount = await prisma.halls.count({ where: { business_id: businessId } });
      resourceName = "Sallave";
    } else if (resource === "menus") {
      limit = 2;
      currentCount = await prisma.menus.count({ where: { business_id: businessId } });
      resourceName = "Menuve";
    } else if (resource === "users") {
      limit = 2;
      currentCount = await prisma.users.count({ where: { business_id: businessId } });
      resourceName = "Përdoruesve (Stafit)";
    } else if (resource === "extras") {
      limit = 5;
      currentCount = await prisma.extras.count({ where: { business_id: businessId } });
      resourceName = "Ekstrave";
    }

    // Nëse e kalon limitin e provës
    if (currentCount >= limit) {
      return { 
        allowed: false, 
        isLimitError: true, 
        title: `Keni arritur limitin e ${resourceName}!`,
        message: `Në versionin e Provës (Trial) ju lejohet të shtoni maksimumi ${limit} ${resourceName.toLowerCase()}. Për të shtuar më shumë dhe për të përdorur sistemin pa kufizime, ju lutem abonohuni.`
      };
    }
    
    // Nëse s'e ka kaluar limitin, lejoje
    return { allowed: true };
  }

  // ==============================================================
  // 2. KONTROLLI PËR BIZNESET "ACTIVE" (QË KANË BLERË PAKETË)
  // ==============================================================
  if (!business.package || business.status !== 'active') {
    return { 
      allowed: false, 
      isLimitError: true,
      title: "Abonimi juaj nuk është aktiv",
      message: "Për të përdorur sistemin dhe për të shtuar të dhëna, ju lutem aktivizoni një nga paketat tona." 
    };
  }

  let limit = 0;
  let currentCount = 0;
  let resourceName = "";

  if (resource === "halls") {
    limit = business.package.halls_limit;
    currentCount = await prisma.halls.count({ where: { business_id: businessId } });
    resourceName = "Sallave";
  } else if (resource === "menus") {
    limit = business.package.menus_limit;
    currentCount = await prisma.menus.count({ where: { business_id: businessId } });
    resourceName = "Menuve";
  } else if (resource === "users") {
    limit = business.package.users_limit;
    currentCount = await prisma.users.count({ where: { business_id: businessId } });
    resourceName = "Përdoruesve (Stafit)";
  } else if (resource === "extras") {
    limit = business.package.extras_limit;
    currentCount = await prisma.extras.count({ where: { business_id: businessId } });
    resourceName = "Ekstrave";
  }

  // -1 zakonisht do të thotë "Pa limit"
  if (limit === -1) return { allowed: true };

  // NËSE ARRIN LIMITIN E PAKETËS:
  if (currentCount >= limit) {
    return { 
      allowed: false, 
      isLimitError: true, 
      title: `Keni arritur limitin e ${resourceName}!`,
      message: `Paketa juaj aktuale "${business.package.name}" ju lejon të shtoni maksimumi ${limit} ${resourceName.toLowerCase()}. Për të shtuar më shumë dhe për të rritur biznesin tuaj, ju ftojmë të kaloni në një paketë më të lartë.`
    };
  }

  return { allowed: true };
}