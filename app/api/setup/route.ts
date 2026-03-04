import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Këtu po e fshehim fjalëkalimin përpara se ta ruajmë në databazë
    const hashedPassword = await bcrypt.hash("Hajr2025", 10);
    
    await prisma.user.create({
      data: {
        name: "Adnan Begiqi",
        email: "adnanbegiqi@gmail.com",
        password: hashedPassword,
        role: "admin"
      }
    });
    
    return NextResponse.json({ message: "Llogaria e administratorit u krijua me sukses! Tani mund te hyni." });
  } catch (error) {
    return NextResponse.json({ error: "Llogaria ekziston tashmë ose ka një gabim tjetër." });
  }
}