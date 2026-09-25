// app/[locale]/(public)/bizneset/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LandingPageClient from "@/app/[locale]/LandingPageClient";

export const dynamic = "force-dynamic";

export default async function BiznesetLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // 1. Pyesim databazën/cookies nëse personi është i loguar
  const session = await getServerSession();

  // 2. Nëse është i loguar, çoje direkt në dashboardin e biznesit!
  if (session?.user) {
    redirect(`/${locale}/biznes`);
  }

  // 3. Kalojmë locale si prop në LandingPageClient
  return <LandingPageClient locale={locale} />;
}