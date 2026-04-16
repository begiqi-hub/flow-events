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

// =======================================================================
// 2. NDRYSHO PUNONJËS
// =======================================================================
export async function editStaffAction(userId: string, data: any) {
  try {
    const updateData: any = {
      full_name: data.full_name,
      email: data.email, // <--- SHTUAM EMAIL-IN KËTU
      role: data.role,
      status: data.status,
    };

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
    // SHTUAM MBROJTJEN NËSE ADMINI VENDOS NJË EMAIL QË EKZISTON
    if (error.code === 'P2002') return { error: "Ky email ekziston tashmë në sistem dhe i përket një përdoruesi tjetër!" };
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