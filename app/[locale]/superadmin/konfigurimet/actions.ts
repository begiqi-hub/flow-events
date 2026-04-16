"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  let settings = await prisma.system_settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.system_settings.create({
      data: { id: 1, platform_name: "HALLEVO" }
    });
  }
  return settings;
}

export async function updateSettings(data: any, locale: string) {
  try {
    await prisma.system_settings.update({
      where: { id: 1 },
      data: {
        platform_name: data.platform_name,
        platform_slogan: data.platform_slogan,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address,
        vat_rate: parseFloat(data.vat_rate),
        currency: data.currency,
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        website_url: data.website_url,
        maintenance_mode: data.maintenance_mode,
        allow_registration: data.allow_registration,
      }
    });
    revalidatePath(`/${locale}/superadmin/konfigurimet`);
    return { success: true };
  } catch (error) {
    return { error: "Dështoi ruajtja." };
  }
}