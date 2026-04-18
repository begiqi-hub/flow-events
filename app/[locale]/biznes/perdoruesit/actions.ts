"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { checkBusinessLimit } from "../../../../lib/limits"; 

// =======================================================================
// 1. SHTO PUNONJËS
// =======================================================================
export async function addStaffAction(businessId: string, data: any) {
  try {
    const limitCheck = await checkBusinessLimit(businessId, "users");
    if (!limitCheck.allowed) {
      return { 
        error: limitCheck.message, 
        isLimitError: limitCheck.isLimitError,
        limitTitle: limitCheck.title
      };
    }

    // 1. Formatojmë emailin për siguri
    const safeEmail = data.email.toLowerCase().trim();

    // 2. A ekziston ky email te Përdoruesit?
    const existingUser = await prisma.users.findFirst({ where: { email: safeEmail } });
    if (existingUser) return { error: "Ky email po përdoret nga një llogari tjetër në sistem!" };

    // 3. A ekziston ky email te Bizneset?
    const existingBusiness = await prisma.businesses.findFirst({ where: { email: safeEmail } });
    if (existingBusiness) return { error: "Ky email i përket një biznesi të regjistruar!" };

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    await prisma.users.create({
      data: {
        full_name: data.full_name,
        email: safeEmail,
        password: hashedPassword,
        role: data.role,
        status: "active",
        business_id: businessId
      }
    });
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: "Pati një problem gjatë ruajtjes." };
  }
}

// =======================================================================
// 2. NDRYSHO PUNONJËS
// =======================================================================
export async function editStaffAction(userId: string, data: any) {
  try {
    const updateData: any = {
      full_name: data.full_name,
      role: data.role,
      status: data.status,
    };

    // Kontrolli i Sigurisë kur ndryshohet emaili
    if (data.email) {
      const safeEmail = data.email.toLowerCase().trim();
      
      const existingUser = await prisma.users.findFirst({ where: { email: safeEmail } });
      if (existingUser && existingUser.id !== userId) {
        return { error: "Ky email po përdoret nga një llogari tjetër në sistem!" };
      }

      const existingBusiness = await prisma.businesses.findFirst({ where: { email: safeEmail } });
      if (existingBusiness) {
        return { error: "Ky email i përket një biznesi të regjistruar!" };
      }

      updatePayload.email = safeEmail;
      updateData.email = safeEmail;
    }

    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.users.update({
      where: { id: userId },
      data: updateData
    });
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: "Pati një problem gjatë ndryshimit." };
  }
}

// =======================================================================
// 3. FSHIJ PUNONJËS (SOFT DELETE)
// =======================================================================
export async function deleteStaffAction(userId: string) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { status: "inactive" }
    });
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Nuk mund të çaktivizohet ky përdorues." };
  }
}