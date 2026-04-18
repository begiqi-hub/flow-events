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
    
    if (currentUser?.id === userId) {
      return { error: "Nuk mund t'ia ndryshosh rolin vetes!" };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error: any) {
    return { error: `Gabim databaze: ${error.message}` };
  }
}

// 2. KRIJIMI I PËRDORUESIT TË RI (Me Siguri Maksimale)
export async function createNewUser(data: any, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    // Siguria 1: Kthejmë emailin në shkronja të vogla dhe pa hapësira
    const safeEmail = data.email.toLowerCase().trim();

    const creator = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!creator) return { error: "Krijuesi nuk u gjet në sistem." };

    // Siguria 2: Kontrollojmë te Përdoruesit
    const existingUser = await prisma.users.findUnique({ where: { email: safeEmail } });
    if (existingUser) return { error: "Siguri: Ky email po përdoret nga një përdorues tjetër!" };

    // Siguria 3: Kontrollojmë te Bizneset
    const existingBusiness = await prisma.businesses.findUnique({ where: { email: safeEmail } });
    if (existingBusiness) return { error: "Siguri: Ky email i përket një Biznesi të regjistruar!" };

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.users.create({
      data: {
        full_name: data.full_name,
        email: safeEmail,
        password: hashedPassword,
        role: data.role,
        business_id: null,
        status: "active",
        hall_scope: "all"
      }
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    return { error: `Gabim teknik: ${error.message.substring(0, 100)}...` }; 
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
    return { error: "Nuk u fshi dot. Mund të jetë i lidhur me të dhëna të tjera." };
  }
}

// 4. NDRYSHIMI I TË DHËNAVE
export async function updateUserDetails(userId: string, data: { full_name?: string, email?: string, status?: any, password?: string }, locale: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "I paautorizuar" };

    const currentUser = await prisma.users.findUnique({ where: { email: session.user.email } });
    
    if (currentUser?.id === userId && data.status === 'inactive') {
      return { error: "Nuk mund ta çaktivizoni llogarinë tuaj!" };
    }

    const updatePayload: any = {};

    if (data.email) {
      const safeEmail = data.email.toLowerCase().trim();
      
      const existingUser = await prisma.users.findUnique({ where: { email: safeEmail } });
      if (existingUser && existingUser.id !== userId) {
        return { error: "Ky email po përdoret nga një përdorues tjetër në sistem!" };
      }

      const existingBusiness = await prisma.businesses.findUnique({ where: { email: safeEmail } });
      if (existingBusiness) {
        return { error: "Ky email po përdoret nga një Biznes në sistem!" };
      }

      updatePayload.email = safeEmail;
    }

    if (data.full_name) updatePayload.full_name = data.full_name;
    if (data.status) updatePayload.status = data.status;
    if (data.password) updatePayload.password = await bcrypt.hash(data.password, 10);

    await prisma.users.update({
      where: { id: userId },
      data: updatePayload
    });

    revalidatePath(`/${locale}/superadmin/perdoruesit`);
    return { success: true };
  } catch (error: any) {
    return { error: `Dështoi përditësimi: ${error.message}` };
  }
}