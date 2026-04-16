import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Kthehu në faqen kryesore
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Politika e Cookies</h1>
        <p className="text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">Përditësuar së fundmi: {new Date().toLocaleDateString('sq-AL')}</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Çfarë janë Cookies?</h2>
            <p>Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj (kompjuter apo celular) kur vizitoni faqen tonë. Ato na ndihmojnë të njohim pajisjen tuaj, të përmirësojmë eksperiencën e navigimit dhe të analizojmë se si përdoret platforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Si i përdorim ne Cookies?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookies thelbësore (Strictly Necessary):</strong> Të domosdoshme për funksionimin e sistemit. Pa to, ju nuk mund të hyni në llogarinë tuaj (Login) ose të përdorni platformën.</li>
              <li><strong>Cookies për performancë dhe analitikë:</strong> Na tregojnë cilat pjesë të platformës vizitohen më shpesh, duke na ndihmuar ta bëjmë atë më të shpejtë dhe më të lehtë për ju.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">A mund t'i refuzoni?</h2>
            <p>Po, përmes banerit tonë të Cookies ju keni mundësinë të zgjidhni "Refuzoj të Gjitha". Sidoqoftë, cookies thelbësore për funksionimin e programit do të mbeten aktive, përndryshe platforma nuk mund t'ju ofrojë shërbimin.</p>
          </section>
        </div>
      </div>
    </div>
  );
}