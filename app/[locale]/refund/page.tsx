import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RefundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Kthehu në faqen kryesore
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Politika e Anulimit dhe Rimbursimit</h1>
        <p className="text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">Përditësuar së fundmi: {new Date().toLocaleDateString('sq-AL')}</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p>Ne në HALLEVO dëshirojmë që ju të jeni 100% të kënaqur me platformën tonë. Më poshtë gjenden kushtet tona të anulimit dhe rimbursimit për abonimet SaaS.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Periudha e Provës 14-Ditore</h2>
            <p>Çdo llogari e re përfiton një periudhë prove falas prej 14 ditësh me qasje në të gjitha modulet, pa pasur nevojë të vendosni kartën e kreditit paraprakisht. Nëse gjatë kësaj kohe vendosni që platforma nuk është për ju, thjesht mos kaloni në abonim me pagesë. Nuk do të tarifoheni.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Anulimi i Abonimit</h2>
            <p>Ju mund ta anuloni abonimin tuaj në çdo kohë nga paneli juaj i kontrollit (<strong>Profili im ➔ Abonimi Im ➔ Anulo Abonimin</strong>). Sapo të anulohet, ju nuk do të tarifoheni më në ciklin e ardhshëm. Llogaria juaj do të mbetet aktive deri në fund të periudhës për të cilën keni paguar.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Rregullat e Rimbursimit</h2>
            <p>Për shkak të natyrës digjitale të shërbimit, rregulli ynë i përgjithshëm është:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Pagesat Mujore:</strong> Nuk ofrohen rimbursime për tarifën e muajit në të cilin tashmë jeni duke operuar.</li>
              <li><strong>Pagesat Vjetore:</strong> Nëse keni paguar për një vit të tërë dhe ndryshoni mendje brenda <strong>7 ditëve të para</strong> të pagesës, ju mund të na kontaktoni për një rimbursim të plotë ose të pjesshëm (minus ditët e përdorura). Pas kalimit të 7 ditëve nga abonimi vjetor, rimbursimet nuk janë më të mundura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Rastet e Jashtëzakonshme</h2>
            <p>Rimbursime mund të jepen në diskrecionin e kompanisë nëse ka pasur gabime të faturimit nga sistemi ynë ose nëse shërbimi ka qenë plotësisht jashtë funksionit (downtime) për më shumë se 72 orë rresht. Çdo kërkesë shqyrtohet brenda 2-3 ditëve të punës.</p>
          </section>

          <section className="pt-8 mt-8 border-t border-gray-100">
            <p className="text-sm">Për të kërkuar një rimbursim sipas këtyre kushteve, ju lutemi na shkruani te: <strong className="text-gray-900">hellog@hallevo.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}