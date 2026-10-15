import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, name, title, description, desktopImage, targetUrl, targetCities } = body;

    if (!businessId || !name || !desktopImage || !targetUrl) {
      return NextResponse.json({ error: "Plotësoni të gjitha fushat e detyrueshme" }, { status: 400 });
    }

    const newAd = await prisma.advertisement.create({
      data: {
        businessId,
        name,
        title,
        description,
        type: 'MEGABANNER', // Mund ta bëjmë dinamike më vonë nëse shton lloje të tjera
        status: 'ACTIVE',
        desktopImage,
        targetUrl,
        targetCities: targetCities || 'ALL',
      }
    });

    return NextResponse.json({ success: true, ad: newAd });
  } catch (error) {
    console.error("Gabim gjatë krijimit të reklamës:", error);
    return NextResponse.json({ error: "Gabim në server" }, { status: 500 });
  }
}