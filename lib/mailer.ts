import nodemailer from "nodemailer";

// 1. Konfigurimi juaj origjinal i transporter-it
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 2. Funksioni juaj origjinal i dërgimit
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Lexon direkt nga .env
      to,
      subject,
      html,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ GABIM NË NODEMAILER:", error);
    return { success: false, error: error.message || error.toString() };
  }
}

// ==========================================
// SHABLLONI BAZË HTML (Me ngjyrat e Hallevo)
// ==========================================
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hallevo.com';
const LOGO_URL = `${APP_URL}/logo.png`; 

const baseHtmlTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #155be7; }
    .header img { max-height: 45px; }
    .content { padding: 32px; color: #333333; line-height: 1.6; }
    .content h2 { color: #0c2347; margin-top: 0; font-size: 22px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #155be7; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
    .promo-box { background-color: #fbf5fc; border: 2px dashed #cd5ac9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0; }
    .promo-code { font-size: 26px; font-weight: 900; color: #0c2347; letter-spacing: 2px; margin-top: 8px; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .data-table td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
    .data-table td:first-child { font-weight: bold; color: #0c2347; width: 35%; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Hallevo Logo" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Keni pyetje? Na kontaktoni në support@hallevo.com</p>
      <p>&copy; ${new Date().getFullYear()} Hallevo. Të gjitha të drejtat e rezervuara.</p>
    </div>
  </div>
</body>
</html>
`;

// ==========================================
// 3. FUNKSIONET SPECIFIKE TË EMAILEVE
// ==========================================

// Email 1: Kërkesë nga Marketplace
export interface OfferRequestData {
  businessEmail: string;
  fullName: string;
  phone: string;
  date: string;
  guests: string;
  eventType: string;
  requestMessage: string;
}

export const sendMarketplaceOfferEmail = async (data: OfferRequestData) => {
  const content = `
    <h2>Keni një kërkesë të re për Ofertë!</h2>
    <p>Përshëndetje,</p>
    <p>Një klient nga platforma Hallevo ka kërkuar shërbimet tuaja. Më poshtë gjeni detajet e kërkesës:</p>
    
    <table class="data-table">
      <tr><td>Emri i plotë:</td><td>${data.fullName}</td></tr>
      <tr><td>Numri i Telefonit:</td><td>${data.phone}</td></tr>
      <tr><td>Data e Eventit:</td><td>${data.date}</td></tr>
      <tr><td>Të Ftuar:</td><td>${data.guests}</td></tr>
      <tr><td>Lloji i Eventit:</td><td>${data.eventType}</td></tr>
      <tr><td>Kërkesa:</td><td><i>"${data.requestMessage}"</i></td></tr>
    </table>
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard/requests" class="btn">Shiko Kërkesën në Platformë</a>
    </div>
  `;

  return sendEmail({
    to: data.businessEmail,
    subject: `Ofertë e re nga ${data.fullName} - Hallevo`,
    html: baseHtmlTemplate(content)
  });
};

// Email 2: Mirësevini + Kodi Promo
export const sendWelcomePromoEmail = async (to: string, name: string) => {
  const content = `
    <h2>Mirësevini në Hallevo, ${name}!</h2>
    <p>Llogaria juaj është krijuar me sukses. Ne jemi këtu për t'ju ndihmuar të menaxhoni biznesin tuaj të eventeve në mënyrë më inteligjente.</p>
    <p>Për ta nisur rrugëtimin tuaj me ne në mënyrën më të mirë, po ju dhurojmë <strong>50% Zbritje</strong> në abonimin tuaj të parë!</p>
    
    <div class="promo-box">
      <p style="margin:0; color:#cd5ac9; font-weight: bold;">Kodi juaj i zbritjes (50% OFF):</p>
      <div class="promo-code">Hallevo50</div>
    </div>
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard/subscription" class="btn">Abonohuni Tani</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Mirësevini në Hallevo! Përfito 50% Zbritje 🎉',
    html: baseHtmlTemplate(content)
  });
};

// Email 3: Resetimi i Fjalëkalimit
export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
  const content = `
    <h2>Ndryshimi i Fjalëkalimit</h2>
    <p>Kemi marrë një kërkesë për të ndryshuar fjalëkalimin e llogarisë suaj. Nëse jeni ju, klikoni butonin më poshtë për të vendosur fjalëkalimin e ri:</p>
    <div style="text-align: center;">
      <a href="${resetLink}" class="btn">Ndërro Fjalëkalimin</a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Ky link skadon pas 1 ore. Nëse nuk e keni kërkuar këtë ndryshim, injorojeni këtë email.</p>
  `;

  return sendEmail({
    to,
    subject: 'Ndryshimi i Fjalëkalimit - Hallevo',
    html: baseHtmlTemplate(content)
  });
};

// Email 4: Skadimi i Provës + Kodi Promo
export const sendTrialExpiredEmail = async (to: string, name: string) => {
  const content = `
    <h2>Koha e provës ka përfunduar!</h2>
    <p>Përshëndetje ${name},</p>
    <p>Periudha juaj e provës sapo përfundoi, por kjo nuk do të thotë që bashkëpunimi ynë duhet të ndalet këtu.</p>
    <p>Ne duam t'ju mbajmë si partner, ndaj po ju ofrojmë <strong>50% Zbritje</strong> për abonimin tuaj:</p>
    
    <div class="promo-box">
      <p style="margin:0; color:#cd5ac9; font-weight: bold;">Aplikoni këtë kod gjatë pagesës:</p>
      <div class="promo-code">Hallevo50</div>
    </div>
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard/subscription" class="btn">Vazhdo Abonimin</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Koha e provës përfundoi - Përfito 50% Zbritje! ⏳',
    html: baseHtmlTemplate(content)
  });
};