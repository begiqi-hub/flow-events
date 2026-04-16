import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Kthehu në faqen kryesore
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Politika e Privatësisë</h1>
        <p className="text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">Përditësuar së fundmi: {new Date().toLocaleDateString('sq-AL')}</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p>Kjo Politikë Privatësie përshkruan se si HALLEVO ("ne", "jonë") mbledh, përdor dhe ndan informacionin tuaj personal kur përdorni faqen tonë dhe platformën SaaS.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Të dhënat që ne mbledhim</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Të Dhënat e Llogarisë:</strong> Kur regjistroheni, ne mbledhim emrin, email-in, emrin e biznesit dhe fjalëkalimin tuaj.</li>
              <li><strong>Të Dhënat e Klientëve Tuaj:</strong> Të dhënat që ju fusni në sistem (emrat e klientëve tuaj, numrat e telefonit për eventet). Ne nuk kemi qasje direkte në to dhe nuk i ndajmë me asnjë palë të tretë.</li>
              <li><strong>Të dhënat e Pagesave:</strong> Detajet e faturimit menaxhohen direkt nga procesorët tanë të pagesave (Paddle/Stripe). Ne nuk ruajmë numra të kartave të kreditit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Si i përdorim të dhënat tuaja?</h2>
            <p>Ne përdorim të dhënat e mbledhura për qëllimet e mëposhtme:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Për të siguruar funksionimin dhe mirëmbajtjen e platformës.</li>
              <li>Për të menaxhuar llogarinë dhe abonimin tuaj.</li>
              <li>Për t'ju dërguar njoftime administrative (psh. faturat, rikthim fjalëkalimi).</li>
              <li>Për të mbrojtur sistemin nga abuzimet dhe sulmet kibernetike.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Ndarja e të Dhënave (Të Tretët)</h2>
            <p>Ne nuk i shesim kurrë të dhënat tuaja personale. Ne mund t'i ndajmë ato vetëm me shërbime thelbësore që bëjnë të mundur funksionimin e platformës:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Ofruesit e pagesave:</strong> (Stripe, Paddle) për të procesuar abonimet.</li>
              <li><strong>Ofruesit e serverëve/Cloud:</strong> (psh. AWS, Vercel, Supabase) për ruajtjen e sigurt të bazës së të dhënave.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Të Drejtat e Tuaja (Përputhshmëria GDPR)</h2>
            <p>Nëse jeni banor në Evropë, ju keni të drejtën të kërkoni akses, korrigjim ose fshirje totale të të dhënave tuaja personale nga serverët tanë. Për ta kërkuar këtë, përdorni email-in tonë të kontaktit.</p>
          </section>

          <section className="pt-8 mt-8 border-t border-gray-100">
            <p className="text-sm">Nëse keni pyetje rreth kësaj politike, na kontaktoni në: <strong className="text-gray-900">hello@hallevo.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}