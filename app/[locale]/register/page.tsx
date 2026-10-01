"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl"; 
import { ChevronDown, Globe, ShieldCheck, ArrowRight, Briefcase, X, FileText } from "lucide-react";
import { CITIES } from "@/lib/constants/cities";

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

const QYTETET: Record<string, { id: string; name: string }[]> = {
  "XK": [...CITIES], 
  "AL": [
    { id: "tirane", name: "Tiranë" }, 
    { id: "durres", name: "Durrës" }, 
    { id: "vlore", name: "Vlorë" }, 
    { id: "elbasan", name: "Elbasan" }, 
    { id: "shkoder", name: "Shkodër" }, 
    { id: "korce", name: "Korçë" }
  ],
  "MK": [
    { id: "shkup", name: "Shkup" }, 
    { id: "tetove", name: "Tetovë" }, 
    { id: "gostivar", name: "Gostivar" }, 
    { id: "kumanove", name: "Kumanovë" }, 
    { id: "struge", name: "Strugë" }
  ],
  "ME": [
    { id: "ulqin", name: "Ulqin" }, 
    { id: "tuz", name: "Tuz" }, 
    { id: "podgorice", name: "Podgoricë" }, 
    { id: "tivar", name: "Tivar" }
  ],
  "GR": [
    { id: "athine", name: "Athinë" }, 
    { id: "selanik", name: "Selanik" }, 
    { id: "janine", name: "Janinë" }
  ],
  "GB": [
    { id: "londer", name: "London" }
  ],
};

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "sq";
  
  const t = useTranslations("Register");
  const tAct = useTranslations("Activities");
  
  const logoPath = "/logo-register.svg"; 

  const [step, setStep] = useState<1 | 2>(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(SHTETET[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availableCities, setAvailableCities] = useState<{id: string, name: string}[]>(QYTETET["XK"]);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "", nui: "", activityId: "", city: "", 
    email: "", password: "", confirmPassword: "", acceptedTerms: false
  });

  // State për OTP-në me 6 kuti
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Funksionet e OTP-së
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1); 
    setOtpValues(newOtpValues);
    setOtpCode(newOtpValues.join(""));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, ""); 
    if (pastedData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      setOtpCode(newOtpValues.join(""));
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Kodi i verifikimit u dërgua me sukses!");
        setStep(2); 
      } else {
        setError(data.error || "Gabim!");
      }
    } catch (err) {
      setError("Gabim në server");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otpCode: otpCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Llogaria u verifikua me sukses! Po ridrejtoheni...");
        setTimeout(() => {
          router.push(`/${locale}/login?registered=true`);
        }, 2000);
      } else {
        setError(data.error || "Kodi është i pasaktë ose ka skaduar.");
      }
    } catch (err) {
      setError("Gabim në lidhje me serverin.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }), 
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Kodi i ri u dërgua në emailin tuaj.");
      } else {
        setError(data.error || "Ndodhi një gabim gjatë ridërgimit.");
      }
    } catch (err) {
      setError("Gabim në server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden text-gray-900">
      
      {/* Modal i Kushteve të Përdorimit (I pandryshuar) */}
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

      {/* ANËSORI I MAJTË - I PANDRYSHUAR */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="relative z-10">
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

      {/* ANËSORI I DJATHTË - ZVOGËLIM I FUSHAVE DHE STRUKTURË E RE */}
      <div className="w-full lg:w-7/12 h-screen overflow-y-auto bg-white flex flex-col items-center py-10 px-6 md:px-12 relative">
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

        <div className="w-full max-w-[560px]">
          
          <div className="lg:hidden mb-10 flex justify-start">
            <Link href={`/${locale}`}>
              <img src={logoPath} alt="HALLEVO" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Titujt e rinj profesionalë dhe interesantë */}
          <div className="mb-8 text-left">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-gray-900">
              {step === 1 ? "Krijo llogarinë e biznesit" : "Verifikimi i sigurisë"}
            </h2>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              {step === 1 
                ? "Bashkohuni me platformën lider dhe dixhitalizoni menaxhimin e eventeve në më pak se 2 minuta." 
                : <>Kemi dërguar një kod unik 6-shifror në adresën: <br/><span className="text-gray-900 font-bold">{formData.email}</span></>
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-6 font-bold border border-red-100 flex items-center gap-2">
               <ShieldCheck size={18} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl text-sm mb-6 font-bold border border-emerald-100 flex items-center gap-2">
               <ShieldCheck size={18} /> {successMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Rreshti 1: Emri dhe Industria përkrah njëra tjetrës për të kursyer hapësirë */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5"><Briefcase size={12} /> {t("busNameLabel")}</label>
                <input type="text" placeholder={t("busNamePlaceholder")} className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm placeholder:text-gray-400 placeholder:font-medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("activityLabel")}</label>
                <select className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm appearance-none cursor-pointer" value={formData.activityId} onChange={(e) => setFormData({...formData, activityId: e.target.value})}>
                  <option value="">{t("select")}</option>
                  {activityIds.map((id) => (
                    <option key={id} value={id}>{tAct(id)}</option>
                  ))}
                </select>
              </div>

              {/* Rreshti 2: Kutia e Shtetit dhe Telefonit (Më e vogël) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50">
                <div>
                  <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">{t("countryLabel")}</label>
                  <div className="relative">
                    <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all outline-none">
                      <div className="flex items-center gap-2">
                        <img src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`} alt="" className="w-4 rounded-sm shadow-sm" />
                        <span className="font-semibold text-gray-900 text-sm">{selectedCountry.name}</span>
                      </div>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 max-h-48 overflow-y-auto">
                        {SHTETET.map((s) => (
                          <button key={s.id} type="button" className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-3 text-sm font-semibold text-gray-700" onClick={() => handleCountryChange(s)}>
                            <img src={`https://flagcdn.com/w20/${s.flag}.png`} className="w-4 rounded-sm shadow-sm" alt="" /> {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">{t("phoneLabel")}</label>
                  <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 transition-all">
                    <div className="bg-gray-50/80 px-3 flex items-center border-r border-gray-200 font-bold text-gray-600 text-sm">{selectedCountry.dialCode}</div>
                    <input type="number" placeholder="4x xxx xxx" className="w-full px-3 py-2.5 outline-none font-semibold text-sm bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:font-medium" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Rreshti 3: Qyteti & NIPT */}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("cityLabel")}</label>
                <select className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm appearance-none cursor-pointer" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                  <option value="">{t("select")}</option>
                  {availableCities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("nuiLabel")}</label>
                  <input type="text" placeholder={t("nuiPlaceholder")} className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm placeholder:text-gray-400 placeholder:font-medium" value={formData.nui} onChange={(e) => setFormData({...formData, nui: e.target.value})} />
              </div>

              {/* Rreshti 4: Email */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("emailLabel")}</label>
                <input type="email" placeholder={t("emailPlaceholder")} className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm placeholder:text-gray-400 placeholder:font-medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              {/* Rreshti 5: Fjalëkalimet përkrah njëri tjetrit */}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("passLabel")}</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm placeholder:text-gray-400" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t("confPassLabel")}</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white transition-all shadow-sm font-semibold text-gray-900 text-sm placeholder:text-gray-400" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>

              {/* Kushtet dhe Butoni */}
              <div className="md:col-span-2 flex items-center gap-3 mt-2">
                <input type="checkbox" id="terms" checked={formData.acceptedTerms} onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})} className="w-4 h-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" />
                <label htmlFor="terms" className="text-[13px] text-gray-600 font-semibold cursor-pointer">
                  {t("termsBefore")}{" "}
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 hover:text-indigo-700 hover:underline mx-1 transition-colors">{t("termsLink")}</button>
                  {" "}{t("termsAfter")}
                </label>
              </div>

              <div className="md:col-span-2 mt-4">
                <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white font-black text-[15px] py-3.5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? t("btnLoading") : t("btnText")}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              
              {/* KUTITË 6-SHIFRORE OTP */}
              <div className="flex justify-between sm:justify-center sm:gap-4 my-8" dir="ltr">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all outline-none shadow-sm"
                    placeholder="0"
                  />
                ))}
              </div>

              <div className="mt-8">
                <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full bg-[#0F172A] text-white font-black text-[15px] py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? "Po verifikohet..." : "Verifiko Llogarinë"}
                  {!loading && <ShieldCheck size={20} />}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Nuk e morët kodin?</p>
                  <button type="button" onClick={handleResendOtp} disabled={loading} className="text-blue-600 hover:underline text-sm font-bold mt-1 disabled:opacity-50 transition-colors">
                    {loading ? "Duke dërguar..." : "Ridërgo Kodin"}
                  </button>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
                  Kthehu mbrapa ose ndrysho email-in
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-[13px] font-bold text-gray-400 mt-8 mb-6">
            {t("loginText")} <Link href={`/${locale}/login`} className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">{t("loginLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}