import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import BusinessLayoutUI from "./BusinessLayoutUI";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect(`/${locale}/login`);

  const business = await prisma.businesses.findUnique({
    where: { email: session.user.email }
  });

  if (!business) redirect(`/${locale}/login`);

  return (
    <BusinessLayoutUI business={business}>
      {children}
    </BusinessLayoutUI>
  );
}