"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { checkBusinessLimit } from "../../../../lib/limits"; // <-- Importi i Rojës së Limiteve

// 1. SHTO PUNONJËS
export async function addStaffAction(businessId: string, data: any) {
  try {
    // =======================================================================
    // 1. KONTROLLI I LIMITIT TË PAKETËS (PËR PËRDORUESIT)
    // =======================================================================
    const limitCheck = await checkBusinessLimit(businessId, "users");
    if (!limitCheck.allowed) {
      // Kthejmë të dhënat e plota te frontend-i për të hapur Pop-upin
      return { 
        error: limitCheck.message, 
        isLimitError: limitCheck.isLimitError,
        limitTitle: limitCheck.title
      };
    }

    // =======================================================================
    // 2. Nëse lejohet, krijojmë përdoruesin
    // =======================================================================
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.users.create({
      data: {
        full_name: data.full_name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        status: "active",
        business_id: businessId
      }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Ky email ekziston tashmë në sistem!" };
    return { error: "Pati një problem gjatë ruajtjes." };
  }
}

// 2. NDRYSHO PUNONJËS
export async function editStaffAction(userId: string, data: any) {
  try {
    const updateData: any = {
      full_name: data.full_name,
      role: data.role,
      status: data.status,
    };

    // Nëse ka shkruar fjalëkalim të ri, e ndryshojmë, përndryshe mbetet i vjetri
    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.users.update({
      where: { id: userId },
      data: updateData
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Pati një problem gjatë ndryshimit." };
  }
}

// 3. FSHIJ PUNONJËS
export async function deleteStaffAction(userId: string) {
  try {
    await prisma.users.delete({
      where: { id: userId }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Nuk mund të fshihet ky përdorues." };
  }
}