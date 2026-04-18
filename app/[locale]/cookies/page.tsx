import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Legal");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> {t("backHome")}
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("cookies.title")}</h1>
        <p className="text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">
           {t("updatedAt")}: {new Date().toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US')}
        </p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("cookies.sec1Title")}</h2>
            <p>{t("cookies.sec1Desc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("cookies.sec2Title")}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>{t("cookies.sec2Bullet1").split(':')[0]}:</strong>{t("cookies.sec2Bullet1").split(':')[1]}</li>
              <li><strong>{t("cookies.sec2Bullet2").split(':')[0]}:</strong>{t("cookies.sec2Bullet2").split(':')[1]}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("cookies.sec3Title")}</h2>
            <p>{t("cookies.sec3Desc")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}