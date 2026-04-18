import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Legal");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> {t("backHome")}
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("privacy.title")}</h1>
        <p className="text-gray-500 font-medium mb-8 border-b border-gray-100 pb-8">
          {t("updatedAt")}: {new Date().toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US')}
        </p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
             <p>{t("privacy.intro")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("privacy.sec1Title")}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>{t("privacy.sec1Desc1").split(':')[0]}:</strong>{t("privacy.sec1Desc1").split(':')[1]}</li>
              <li><strong>{t("privacy.sec1Desc2").split(':')[0]}:</strong>{t("privacy.sec1Desc2").split(':')[1]}</li>
              <li><strong>{t("privacy.sec1Desc3").split(':')[0]}:</strong>{t("privacy.sec1Desc3").split(':')[1]}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("privacy.sec2Title")}</h2>
            <p>{t("privacy.sec2Desc")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("privacy.sec2Bullet1")}</li>
              <li>{t("privacy.sec2Bullet2")}</li>
              <li>{t("privacy.sec2Bullet3")}</li>
              <li>{t("privacy.sec2Bullet4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("privacy.sec3Title")}</h2>
            <p>{t("privacy.sec3Desc")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>{t("privacy.sec3Bullet1").split(':')[0]}:</strong>{t("privacy.sec3Bullet1").split(':')[1]}</li>
              <li><strong>{t("privacy.sec3Bullet2").split(':')[0]}:</strong>{t("privacy.sec3Bullet2").split(':')[1]}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("privacy.sec4Title")}</h2>
            <p>{t("privacy.sec4Desc")}</p>
          </section>

          <section className="pt-8 mt-8 border-t border-gray-100">
            <p className="text-sm">{t("privacy.contact")} <strong className="text-gray-900">hello@hallevo.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}