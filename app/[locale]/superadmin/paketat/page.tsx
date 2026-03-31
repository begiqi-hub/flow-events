import { getPackages } from "./actions";
import PaketatClient from "./PaketatClient";

// Siguron që faqja mos kesh-ohet por të marrë të dhënat e fundit
export const dynamic = "force-dynamic";

export default async function PaketatPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  // Marrim paketat nga databaza
  const packages = await getPackages();
  
  // Serializimi i të dhënave (Decimal -> string/number) për Client Component
  const serializedPackages = JSON.parse(JSON.stringify(packages));
  
  return (
    <PaketatClient 
      locale={locale} 
      packages={serializedPackages} 
    />
  );
}