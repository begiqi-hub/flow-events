import { getAlerts } from "./actions";
import NjoftimetClient from "./NjoftimetClient";

export const dynamic = "force-dynamic";

export default async function NjoftimetPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const alerts = await getAlerts();
  
  // Serializojmë datën për siguri gjatë kalimit në Client Component
  const serializedAlerts = JSON.parse(JSON.stringify(alerts));
  
  return <NjoftimetClient locale={locale} alerts={serializedAlerts} />;
}