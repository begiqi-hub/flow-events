import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    if (!id || action !== 'click') {
      return NextResponse.json({ error: "Të dhëna të pavlefshme" }, { status: 400 });
    }

    // Përditësojmë klikimet në mënyrë asinkrone
    await prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gabim në gjurmimin e reklamës:", error);
    return NextResponse.json({ error: "Dështoi përditësimi" }, { status: 500 });
  }
}