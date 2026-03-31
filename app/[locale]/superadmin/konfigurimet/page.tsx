import { getSettings } from "./actions";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const settings = await getSettings();
  
  return <SettingsClient locale={locale} settings={JSON.parse(JSON.stringify(settings))} />;
}