import { getTranslations } from "next-intl/server";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("LegalPages");

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 font-sans">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{t("termsTitle")}</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">{t("termsUpdated")}</p>
        
        <p className="text-lg text-gray-600 font-medium mb-10 leading-relaxed">
          {t("termsIntro")}
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("termsSection1Title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("termsSection1Desc")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("termsSection2Title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("termsSection2Desc")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("termsSection3Title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("termsSection3Desc")}</p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} ADX POSITIVE SH.P.K. Të gjitha të drejtat e rezervuara.
        </div>
      </div>
    </main>
  );
}