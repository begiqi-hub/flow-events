import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    // 1. Validimi bazë
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Të dhënat nuk janë të plota." }, { status: 400 });
    }

    // 2. Kontrollo nëse tokeni ekziston dhe nuk ka skaduar
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: "Ky link është i pavlefshëm ose ka skaduar. Ju lutem kërkoni një link të ri." 
      }, { status: 400 });
    }

    // 3. Hashimi i fjalëkalimit të ri
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Përditësimi i fjalëkalimit në tabelën e përdoruesve
    await prisma.users.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword }
    });

    // 5. Fshirja e tokenit (që të mos përdoret dy herë)
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });

    return NextResponse.json({ success: true, message: "Fjalëkalimi u ndryshua me sukses!" }, { status: 200 });

  } catch (error: any) {
    console.error("❌ GABIM NË RESETIMIN E FJALËKALIMIT:", error);
    return NextResponse.json({ error: "Ndodhi një gabim në server gjatë ruajtjes." }, { status: 500 });
  }
}