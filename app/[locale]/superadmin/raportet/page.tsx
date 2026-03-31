import { getFinancialStats } from "./actions";
import RaportetClient from "./RaportetClient";

export const dynamic = "force-dynamic";

export default async function RaportetPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const data = await getFinancialStats();
  
  return <RaportetClient locale={locale} data={data} />;
}