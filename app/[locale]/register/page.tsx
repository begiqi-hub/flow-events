"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl"; 
import { ChevronDown, Globe, ShieldCheck, ArrowRight, Briefcase, X, FileText } from "lucide-react";

// KONFIGURIMET
const GJUHET = [
  { code: "sq", name: "AL", flag: "al", defaultCountry: "XK" }, 
  { code: "en", name: "EN", flag: "gb", defaultCountry: "GB" }, 
  { code: "mk", name: "MK", flag: "mk", defaultCountry: "MK" }, 
  { code: "cg", name: "CG", flag: "me", defaultCountry: "ME" }, 
  { code: "el", name: "GR", flag: "gr", defaultCountry: "GR" } 
];

const SHTETET = [
  { id: "XK", name: "Kosovë", dialCode: "+383", flag: "xk" },
  { id: "AL", name: "Shqipëri", dialCode: "+355", flag: "al" },
  { id: "GB", name: "United Kingdom", dialCode: "+44", flag: "gb" },
  { id: "MK", name: "Maqedoni e V.", dialCode: "+389", flag: "mk" },
  { id: "ME", name: "Mali i Zi", dialCode: "+382", flag: "me" },
  { id: "GR", name: "Greqi", dialCode: "+30", flag: "gr" },
];

const QYTETET: Record<string, string[]> = {
  "XK": ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Mitrovicë", "Gjilan", "Ferizaj"],
  "AL": ["Tiranë", "Durrës", "Vlorë", "Elbasan", "Shkodër", "Korçë"],
  "MK": ["Shkup", "Tetovë", "Gostivar", "Kumanovë", "Strugë"],
  "ME": ["Ulqin", "Tuz", "Podgoricë", "Tivar"],
  "GR": ["Athinë", "Selanik", "Janinë"],
};

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "sq";
  
  const t = useTranslations("Register");
  const tAct = useTranslations("Activities");
  
  const logoPath = "/logo-register.svg"; 

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(SHTETET[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>(QYTETET["XK"]);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "", nui: "", activityId: "", city: "", 
    email: "", password: "", confirmPassword: "", acceptedTerms: false
  });

  const activityIds = ["1", "2", "3", "4"];

  useEffect(() => {
    const currentLangCfg = GJUHET.find(g => g.code === locale);
    if (currentLangCfg) {
      const targetCountry = SHTETET.find(s => s.id === currentLangCfg.defaultCountry);
      if (targetCountry) {
        setSelectedCountry(targetCountry);
        setAvailableCities(QYTETET[targetCountry.id] || []);
      }
    }
  }, [locale]);

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
    setAvailableCities(QYTETET[country.id] || []);
    setFormData({ ...formData, city: "" });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !phoneNumber || !formData.activityId || !formData.city) {
      setError(t("errorRequired"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t("errorMatch"));
      return;
    }
    if (!formData.acceptedTerms) {
      setError(t("errorTerms"));
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = phoneNumber.replace(/^0+/, '');
      const fullPhone = `${selectedCountry.dialCode}${formattedPhone}`;
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: fullPhone }),
      });

      if (res.ok) router.push(`/${locale}/login?registered=true`);
      else {
        const data = await res.json();
        setError(data.error || "Gabim!");
        setLoading(false);
      }
    } catch (err) {
      setError("Gabim në server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden text-gray-900">
      
      {showTermsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><FileText size={24} /></div>
                <h2 className="text-xl font-black text-gray-900">Kushtet e Përdorimit</h2>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 leading-relaxed space-y-6">
              <p>Mirësevini në HALLEVO. Duke krijuar një llogari, ju pajtoheni të respektoni kushtet e mëposhtme.</p>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-2">1. Llogaria Juaj dhe Përgjegjësitë</h4>
                <p>Ju jeni përgjegjës për ruajtjen e konfidencialitetit të fjalëkalimit tuaj. Çdo veprim i kryer nga llogaria juaj është përgjegjësia e biznesit tuaj.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-2">2. Abonimi dhe Pagesat</h4>
                <p>Sistemi ofrohet në bazë abonimi (SaaS). Pas përfundimit të periudhës së provës, biznesi juaj duhet të zgjedhë një paketë.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex justify-end">
              <button onClick={() => setShowTermsModal(false)} className="bg-[#0F172A] hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all">U Kuptua</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR MAJTAS (Me ngjyrën e duhur dhe dritën e sfondit) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="relative z-10">
          
          {/* Logoja në sfond të zi - E pastër brenda një karte të bardhë */}
          <Link href={`/${locale}`} className="inline-block bg-white rounded-2xl shadow-xl px-5 py-3 mb-16">
            <img src={logoPath} alt="HALLEVO" className="h-8 w-auto object-contain" />
          </Link>

          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-white/80 text-[11px] font-black uppercase tracking-[0.1em]">{t("edition")}</span>
            </div>
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">{t("managePro")}</h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">{t("digitizeEvents")}</p>
          </div>
        </div>
        <div className="relative z-10 pt-10 border-t border-white/5"><p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">© 2026 HALLEVO</p></div>
      </div>

      {/* FORM SECTION DJATHTAS */}
      <div className="w-full lg:w-7/12 h-screen overflow-y-auto bg-white flex flex-col items-center py-12 px-6 md:px-16 relative">
        <div className="absolute top-8 right-8 z-[100]">
           <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl font-bold text-xs hover:bg-gray-100 transition-all uppercase">
                <Globe size={14} className="text-indigo-500" /> {locale} <ChevronDown size={14} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2">
                  {GJUHET.map((g) => (
                    <Link key={g.code} href={`/${g.code}/register`} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold ${locale === g.code ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <img src={`https://flagcdn.com/w20/${g.flag}.png`} className="w-4 rounded-sm" alt="" /> {g.name}
                    </Link>
                  ))}
                </div>
              )}
           </div>
        </div>

        <div className="w-full max-w-[540px]">
          
          {/* Logo për Mobile - E pastër pa prapavijë */}
          <div className="lg:hidden mb-12 flex justify-start">
            <Link href={`/${locale}`}>
              <img src={logoPath} alt="HALLEVO" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black tracking-tight mb-3 text-gray-900">{t("title")}</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 font-bold border border-red-100 flex items-center gap-2">
               <ShieldCheck size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2"><Briefcase size={14} /> {t("busNameLabel")}</label>
              <input type="text" placeholder={t("busNamePlaceholder")} className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("activityLabel")}</label>
              <select className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 appearance-none cursor-pointer" value={formData.activityId} onChange={(e) => setFormData({...formData, activityId: e.target.value})}>
                <option value="">{t("select")}</option>
                {activityIds.map((id) => (
                  <option key={id} value={id}>{tAct(id)}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50">
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">{t("countryLabel")}</label>
                <div className="relative">
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`} alt="" className="w-5 rounded-sm" />
                      <span className="font-bold text-gray-800 text-sm">{selectedCountry.name}</span>
                    </div>
                    <ChevronDown size={14} className="text-indigo-400" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 max-h-60 overflow-y-auto">
                      {SHTETET.map((s) => (
                        <button key={s.id} type="button" className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center gap-3 text-sm font-bold" onClick={() => handleCountryChange(s)}>
                          <img src={`https://flagcdn.com/w20/${s.flag}.png`} className="w-5 rounded-sm" alt="" /> {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">{t("phoneLabel")}</label>
                <div className="flex bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                  <div className="bg-indigo-50/50 px-3 flex items-center border-r border-indigo-100 font-black text-indigo-600 text-xs">{selectedCountry.dialCode}</div>
                  <input type="number" placeholder="4x xxx xxx" className="w-full p-3.5 outline-none font-bold text-sm bg-transparent" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("cityLabel")}</label>
              <select className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                <option value="">{t("select")}</option>
                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("nuiLabel")}</label>
                <input type="text" placeholder={t("nuiPlaceholder")} className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none font-medium" value={formData.nui} onChange={(e) => setFormData({...formData, nui: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("emailLabel")}</label>
              <input type="email" placeholder={t("emailPlaceholder")} className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("passLabel")}</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none font-medium" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("confPassLabel")}</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl outline-none font-medium" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 mt-4">
              <input type="checkbox" id="terms" checked={formData.acceptedTerms} onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})} className="w-5 h-5 rounded-lg accent-[#0F172A] cursor-pointer" />
              <label htmlFor="terms" className="text-sm text-gray-500 font-bold cursor-pointer">
                {t("termsBefore")}{" "}
                <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 hover:underline mx-1">{t("termsLink")}</button>
                {" "}{t("termsAfter")}
              </label>
            </div>

            <div className="md:col-span-2 mt-8">
              <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white font-black text-lg py-5 rounded-[2rem] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3">
                {loading ? t("btnLoading") : t("btnText")}
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>
          
          <p className="text-center text-sm font-bold text-gray-400 mt-10 mb-10">
            {t("loginText")} <Link href={`/${locale}/login`} className="text-indigo-600 font-bold">{t("loginLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}