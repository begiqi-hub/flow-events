import { getFinancialStats } from "./actions";
import RaportetClient from "./RaportetClient";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function RaportetPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const data = await getFinancialStats();
  
  // Tërheqim të dhënat e platformës
  const systemSettings = await prisma.system_settings.findFirst() || {};

  return (
    <RaportetClient 
      locale={locale} 
      data={data} 
      systemSettings={JSON.parse(JSON.stringify(systemSettings))} 
    />
  );
}