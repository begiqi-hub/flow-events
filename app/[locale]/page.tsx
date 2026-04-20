import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LandingPageClient from "./LandingPageClient";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // 1. Pyesim databazën/cookies nëse personi është i loguar
  const session = await getServerSession();

  // 2. Nëse është i loguar, mos ia trego Landing Page, çoje direkt në punë!
  if (session?.user) {
    redirect(`/${locale}/biznes`);
  }

  // 3. Nëse nuk është i loguar (ose doli "Log Out"), tregoji Landing Page-in e bukur
  return <LandingPageClient />;
}