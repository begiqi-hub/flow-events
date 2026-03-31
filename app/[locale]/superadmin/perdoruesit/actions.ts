"use server";

import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// 1. NDRYSHIMI I ROLIT
export async function updateUserRole(userId: string, newRole: any, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const currentUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    
    // Siguresë: Nuk mund t'ia heqësh rolin vetes
    if (currentUser?.id === userId) {
      return { error: "Nuk mund t'ia ndryshosh rolin vetes!" };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error) {
    return { error: "Ndodhi një gabim gjatë përditësimit të rolit." };
  }
}

// 2. KRIJIMI I PËRDORUESIT TË RI
export async function createNewUser(data: any, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const creator = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!creator) return { error: "Krijuesi nuk u gjet në sistem." };

    const existingUser = await prisma.users.findUnique({ where: { email: data.email } });
    if (existingUser) return { error: "Ky email është i regjistruar!" };

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.users.create({
      data: {
        full_name: data.full_name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        business_id: creator.business_id, 
        status: "active",
        hall_scope: "all"
      }
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    return { error: "Gabim teknik: Sigurohu që të gjitha fushat janë plotësuar saktë." };
  }
}

// 3. FSHIRJA E PËRDORUESIT
export async function deleteUser(userId: string, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const currentUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    
    if (currentUser?.id === userId) {
      return { error: "Nuk mund ta fshini veten nga sistemi!" };
    }

    await prisma.users.delete({
      where: { id: userId }
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error) {
    return { error: "Nuk u fshi dot. Mund të jetë i lidhur me të dhëna të tjera (psh. pagesa ose rezervime)." };
  }
}

// 4. NDRYSHIMI I TË DHËNAVE (STATUSI, FJALËKALIMI, EMRI, EMAIL)
export async function updateUserDetails(userId: string, data: { full_name?: string, email?: string, status?: any, password?: string }, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const currentUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    
    if (currentUser?.id === userId && data.status === 'inactive') {
      return { error: "Nuk mund ta çaktivizoni llogarinë tuaj!" };
    }

    // Siguresë për emailin: Kontrollojmë nëse emaili i ri është i zënë nga dikush tjetër
    if (data.email) {
      const existingEmail = await prisma.users.findUnique({ where: { email: data.email } });
      if (existingEmail && existingEmail.id !== userId) {
        return { error: "Ky email po përdoret nga një përdorues tjetër në sistem!" };
      }
    }

    const updatePayload: any = {};
    
    if (data.full_name) updatePayload.full_name = data.full_name;
    if (data.email) updatePayload.email = data.email;
    if (data.status) updatePayload.status = data.status;
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.users.update({
      where: { id: userId },
      data: updatePayload
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error) {
    return { error: "Dështoi përditësimi i të dhënave." };
  }
}