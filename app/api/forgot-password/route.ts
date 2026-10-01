import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sigurohuni që rruga e importit është e saktë
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer'; // Sigurohuni që rruga është e saktë

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // 1. Validimi i email-it
    if (!email) {
      return NextResponse.json({ error: "Email-i është i detyrueshëm." }, { status: 400 });
    }

    const safeEmail = email.toLowerCase().trim();

    // 2. Gjetja e përdoruesit në sistem
    const existingUser = await prisma.users.findUnique({
      where: { email: safeEmail }
    });

    if (!existingUser) {
      // Për arsye sigurie (të mos zbulojmë cilët emaile ekzistojnë), shpesh kthehet sukses edhe nëse nuk gjendet.
      // Por për tani, le të kthejmë një error të qartë për lehtësi zhvillimi.
      return NextResponse.json({ error: "Ky email nuk ekziston në sistemin tonë." }, { status: 404 });
    }

    // 3. Gjenerimi i një tokeni unik
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // Tokeni skadon pas 1 ore

    // 4. Ruajtja e tokenit në databazë
    // SUPOZIM: Keni shtuar modelin PasswordResetToken siç e tregova më lart
    
    // Fshini tokenat e vjetër për këtë email (për të shmangur grumbullimin)
    await prisma.passwordResetToken.deleteMany({
      where: { email: safeEmail }
    });

    await prisma.passwordResetToken.create({
      data: {
        email: safeEmail,
        token: resetToken,
        expiresAt: tokenExpiresAt
      }
    });
    

    // 5. Dërgimi i email-it
    const emailResult = await sendPasswordResetEmail(safeEmail, resetToken);

    if (!emailResult.success) {
      console.error("Gabim në dërgimin e email-it për resetim:", emailResult.error);
      return NextResponse.json({ error: "Dështoi dërgimi i email-it. Provoni përsëri." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email-i për resetimin e fjalëkalimit u dërgua!" }, { status: 200 });

  } catch (error: any) {
    console.error("GABIM NË API E FORGOT PASSWORD:", error);
    return NextResponse.json({ error: "Ndodhi një gabim në server." }, { status: 500 });
  }
}