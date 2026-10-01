import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/mailer";

export async function GET() {
  try {
    const result = await sendEmail({
      to: process.env.SMTP_USER as string, // Dërgoja një email vetvetes për test
      subject: "Testimi i Lidhjes Hostinger",
      html: "<h1>Lidhja funksionon me sukses!</h1><p>Nëse po e lexoni këtë, SMTP është konfiguruar saktë.</p>"
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Emaili u dërgua! Kontrollo inbox-in." }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}