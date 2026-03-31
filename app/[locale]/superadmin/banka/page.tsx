import { getBankAccounts } from "./actions";
import BankaClient from "./BankaClient";

export const dynamic = "force-dynamic";

export default async function BankaPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const accounts = await getBankAccounts();
  
  return <BankaClient locale={locale} accounts={JSON.parse(JSON.stringify(accounts))} />;
}