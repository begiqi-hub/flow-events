"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function updateBusinessInfo(id: string, data: any, locale: string) {
  try {
    await prisma.businesses.update({
      where: { id },
      data: {
        name: data.name,
        nui: data.nui,
        email: data.email,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address,
      }
    });
    
    revalidatePath(`/${locale}/superadmin/bizneset`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gabim gjatë përditësimit të biznesit." };
  }
}

export async function resetBusinessPassword(businessId: string, newPassword: string, locale: string) {
  try {
    const adminUser = await prisma.users.findFirst({
      where: { 
        business_id: businessId, 
        role: "admin" 
      }
    });

    if (!adminUser) {
      return { error: "Nuk u gjet asnjë pronar (admin) për këtë biznes." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    revalidatePath(`/${locale}/superadmin/bizneset`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gabim gjatë ndryshimit të fjalëkalimit." };
  }
}

// --- FUNKSIONI I RI: HYR SI BIZNES (IMPERSONATION) ---
export async function getImpersonationToken(businessId: string) {
  try {
    // 1. Kontrollojmë nëse personi që po e kërkon këtë është vërtet Superadmin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const superadmin = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (superadmin?.role !== "superadmin") {
      return { error: "Nuk keni autorizim për këtë veprim!" };
    }

    // 2. Gjejmë llogarinë e pronarit të biznesit (admin)
    const targetUser = await prisma.users.findFirst({
      where: { 
        business_id: businessId, 
        role: "admin" 
      },
      select: { email: true }
    });

    if (!targetUser) {
      return { error: "Ky biznes nuk ka një administrator të caktuar." };
    }

    // 3. Kthejmë email-in për të bërë login-in automatik në Frontend
    return { success: true, targetEmail: targetUser.email };
  } catch (error) {
    console.error(error);
    return { error: "Ndodhi një gabim gjatë procesit të hyrjes." };
  }
}