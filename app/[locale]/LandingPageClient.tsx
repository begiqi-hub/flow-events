"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, CalendarCheck, TrendingUp, Users, Shield, 
  Bot, MessageSquare, Zap, CheckCircle2, Check, Utensils, BarChart, Quote, Send, Globe 
} from "lucide-react";
import CookieBanner from "../../components/CookieBanner";
import { useState, useEffect } from "react";

const SLIDER_IMAGES = [
  "/slide1.png",
  "/slide2.png", 
  "/slide3.png"
];

export default function LandingPage() {
  const t = useTranslations("Landing"); 
  const locale = useLocale();
  const router = useRouter();

  // =========================================================================
  // Kontrolli PWA: Ridrejto direkt në Login nëse jemi në "standalone" mode
  // =========================================================================
  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) {
      router.replace(`/${locale}/login`);
    }
  }, [locale, router]);
  // =========================================================================

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
          
          {/* Logoja */}
          <Link href={`/${locale}`} className="flex items-center shrink-0">
            <img src="/logo.svg" alt="HALLEVO" className="h-8 sm:h-11 w-auto object-contain" />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href={`/${locale}/login`} className="text-sm font-bold text-gray-900 hover:text-[#FF5C39] transition-colors whitespace-nowrap px-2">
              {t("loginBtn")}
            </Link>
            <Link href={`/${locale}/register`} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl transition-all shadow-sm whitespace-nowrap">
              {t("registerBtn")}
            </Link>
          </div>
        </div>
      </header>

      {/* PJESA KRYESORE */}
      <div className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <main className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-visible">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-br from-indigo-50/50 via-white to-orange-50/50 opacity-80 pointer-events-none rounded-b-[4rem]"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <div className="text-left z-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 text-xs sm:text-sm font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5C39] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5C39]"></span>
                </span>
                {t("badgeText")}
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight mb-6 leading-[1.15]">
                {t("heroTitle1")}<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C39] to-[#ff8c42]">
                  {t("heroTitle2")}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-500 max-w-xl mb-8 font-medium leading-relaxed">
                {t("heroDesc")}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href={`/${locale}/register`} className="w-full sm:w-auto bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_8px_30px_rgb(15,23,42,0.2)] hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                  {t("trialBtn")} <ArrowRight size={20} />
                </Link>
                <Link href="#features" className="w-full sm:w-auto bg-white border-2 border-gray-100 hover:border-gray-200 text-[#0f172a] font-bold py-4 px-8 rounded-2xl transition-all text-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                  {t("demoBtn")}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none mt-12 lg:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-gradient-to-tr from-indigo-100 to-orange-50 rounded-full blur-3xl opacity-60"></div>
              
              <div className="relative z-10 flex justify-center items-center h-auto sm:h-[500px] py-10 sm:py-0">
                <div className="w-[85%] sm:w-[380px] h-[350px] sm:h-auto aspect-[4/5] bg-white rounded-[2rem] border-[6px] border-gray-50 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
                   {SLIDER_IMAGES.map((imgSrc, index) => (
                     <img 
                       key={imgSrc}
                       src={imgSrc} 
                       alt={`Sistemi HallEvo ${index + 1}`} 
                       className={`absolute top-0 left-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
                         currentSlide === index ? "opacity-100" : "opacity-0"
                       }`} 
                     />
                   ))}
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                     {SLIDER_IMAGES.map((_, index) => (
                       <div key={index} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? "w-6 bg-[#FF5C39]" : "w-1.5 bg-gray-300/80"}`}></div>
                     ))}
                   </div>
                </div>

                <div className="absolute top-[5%] sm:top-[10%] left-[-5%] sm:left-[-10%] lg:left-[-5%] bg-white p-2 sm:p-3 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-2 sm:gap-3 z-20 scale-90 sm:scale-100 origin-top-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <CalendarCheck size={18} />
                  </div>
                  <span className="font-bold text-gray-800 text-xs sm:text-sm whitespace-nowrap">{t("heroBadge1")}</span>
                </div>

                <div className="absolute bottom-[10%] sm:bottom-[15%] right-[-5%] sm:right-[-10%] lg:right-[-5%] bg-white p-2 sm:p-3 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-2 sm:gap-3 z-20 scale-90 sm:scale-100 origin-bottom-right">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <span className="font-bold text-gray-800 text-xs sm:text-sm whitespace-nowrap">{t("heroBadge2")}</span>
                </div>

                <div className="absolute top-[35%] right-[-10%] sm:right-[-15%] lg:right-[-8%] bg-white p-2 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-2 z-20 scale-85 sm:scale-100 origin-right">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                     <Shield size={14} />
                  </div>
                  <span className="font-bold text-gray-800 text-[10px] sm:text-xs whitespace-nowrap">{t("heroBadge3")}</span>
                </div>
                
                <div className="absolute bottom-[25%] left-[-10%] sm:left-[-5%] lg:left-0 bg-white p-2 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-2 z-20 scale-85 sm:scale-100 origin-left">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                     <Bot size={14} />
                  </div>
                  <span className="font-bold text-gray-800 text-[10px] sm:text-xs whitespace-nowrap">{t("heroBadge4")}</span>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* 2. FLOW AI SECTION */}
        <section id="ai" className="bg-[#0f172a] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold mb-6">
                  <Bot size={16} /> {t("aiBadge")}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{t("aiTitle")}</h2>
                <p className="text-gray-400 text-lg font-medium mb-10 leading-relaxed">{t("aiDesc")}</p>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20"><MessageSquare size={24} /></div>
                    <div><h4 className="text-white font-bold text-lg">{t("aiStep1Title")}</h4><p className="text-gray-400 text-sm mt-1">{t("aiStep1Desc")}</p></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20"><CalendarCheck size={24} /></div>
                    <div><h4 className="text-white font-bold text-lg">{t("aiStep2Title")}</h4><p className="text-gray-400 text-sm mt-1">{t("aiStep2Desc")}</p></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20"><Zap size={24} /></div>
                    <div><h4 className="text-white font-bold text-lg">{t("aiStep3Title")}</h4><p className="text-gray-400 text-sm mt-1">{t("aiStep3Desc")}</p></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl bg-gray-800/50 p-4 border border-gray-700/50 backdrop-blur-md shadow-2xl relative">
                  <div className="flex items-center gap-3 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white"><Bot size={20} /></div>
                    <div><h4 className="text-white font-bold text-sm">HALL AI Agent</h4><p className="text-emerald-400 text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online</p></div>
                  </div>
                  
                  {/* Biseda lexon përkthimet nga JSON */}
                  <div className="space-y-4 font-medium text-sm">
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                        {t("aiChatUser")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs px-2 mb-2">
                      <Zap size={12} className="text-amber-400" /> {t("aiChatStatus")}
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-700/50 text-gray-200 border border-gray-600/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                        {t("aiChatReply")}
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-6">
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={14} /> {t("aiChatSent")}
                      </div>
                    </div>
                  </div>

                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-[#FF5C39] to-orange-400 rounded-2xl -z-10 blur-xl opacity-50"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES GRID */}
        <section id="features" className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("featuresTitle")}</h2>
              <p className="text-gray-500 mt-4 font-medium text-lg">{t("featuresSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ModuleCard icon={<CalendarCheck size={28} className="text-blue-500" />} title={t("feat1Title")} desc={t("feat1Desc")} bullets={[t("feat1Bullet1"), t("feat1Bullet2"), t("feat1Bullet3")]} bg="bg-blue-50" />
              <ModuleCard icon={<TrendingUp size={28} className="text-emerald-500" />} title={t("feat2Title")} desc={t("feat2Desc")} bullets={[t("feat2Bullet1"), t("feat2Bullet2"), t("feat2Bullet3")]} bg="bg-emerald-50" />
              <ModuleCard icon={<Utensils size={28} className="text-amber-500" />} title={t("feat3Title")} desc={t("feat3Desc")} bullets={[t("feat3Bullet1"), t("feat3Bullet2"), t("feat3Bullet3")]} bg="bg-amber-50" />
              <ModuleCard icon={<BarChart size={28} className="text-purple-500" />} title={t("feat4Title")} desc={t("feat4Desc")} bullets={[t("feat4Bullet1"), t("feat4Bullet2"), t("feat4Bullet3")]} bg="bg-purple-50" />
            </div>
          </div>
        </section>

        {/* 4. TESTIMONIALS */}
        <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-6"><Quote size={24} /></div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 max-w-2xl mx-auto leading-tight">{t("testiTitle")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard text={t("testi1Text")} author={t("testi1Author")} role={t("testi1Role")} />
              <TestimonialCard text={t("testi2Text")} author={t("testi2Author")} role={t("testi2Role")} />
              <TestimonialCard text={t("testi3Text")} author={t("testi3Author")} role={t("testi3Role")} />
            </div>
          </div>
        </section>

        {/* 5. PRICING SECTION */}
        <section id="pricing" className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("pricingTitle")}</h2>
              <p className="text-gray-500 mt-4 font-medium text-lg">{t("pricingSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Starter */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative h-full">
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t("plan1Name")}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-indigo-600">{t("plan1Price")}</span>
                  <span className="text-gray-500 font-bold">/muaj</span>
                </div>
                <div className="inline-block bg-emerald-50 text-emerald-600 font-bold text-xs px-3 py-1 rounded-full mb-8">
                  {t("plan1Save")}
                </div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-4">{t("pricingCapTitle")}</p>
                <div className="space-y-3 mb-8 pb-8 border-b border-gray-100">
                  <PricingCap text={t("capHalls")} val="1" />
                  <PricingCap text={t("capStaff")} val="3" />
                  <PricingCap text={t("capMenu")} val="5 / 5" />
                </div>
                <p className="text-xs font-bold text-indigo-500 tracking-wider mb-4">{t("pricingIncTitle")}</p>
                <ul className="space-y-3 mb-8">
                  <PricingBullet text={t("inc1")} />
                  <PricingBullet text={t("inc2")} />
                  <PricingBullet text={t("inc3")} />
                  <PricingBullet text={t("inc4")} />
                </ul>
              </div>

              {/* Business */}
              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-indigo-100 relative transform md:scale-105 z-10 h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
                  Më e Preferuara
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t("plan2Name")}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-indigo-600">{t("plan2Price")}</span>
                  <span className="text-gray-500 font-bold">/muaj</span>
                </div>
                <div className="inline-block bg-emerald-50 text-emerald-600 font-bold text-xs px-3 py-1 rounded-full mb-8">
                  {t("plan2Save")}
                </div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-4">{t("pricingCapTitle")}</p>
                <div className="space-y-3 mb-8 pb-8 border-b border-gray-100">
                  <PricingCap text={t("capHalls")} val="3" />
                  <PricingCap text={t("capStaff")} val="5" />
                  <PricingCap text={t("capMenu")} val="5 / 5" />
                </div>
                <p className="text-xs font-bold text-indigo-500 tracking-wider mb-4">{t("pricingIncTitle")}</p>
                <ul className="space-y-3 mb-8">
                  <PricingBullet text={t("inc1")} />
                  <PricingBullet text={t("inc2")} />
                  <PricingBullet text={t("inc3")} />
                  <PricingBullet text={t("inc4")} />
                </ul>
              </div>

              {/* Elite */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative h-full">
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t("plan3Name")}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-indigo-600">{t("plan3Price")}</span>
                  <span className="text-gray-500 font-bold">/muaj</span>
                </div>
                <div className="inline-block bg-emerald-50 text-emerald-600 font-bold text-xs px-3 py-1 rounded-full mb-8">
                  {t("plan3Save")}
                </div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-4">{t("pricingCapTitle")}</p>
                <div className="space-y-3 mb-8 pb-8 border-b border-gray-100">
                  <PricingCap text={t("capHalls")} val={t("planLimit")} />
                  <PricingCap text={t("capStaff")} val={t("planLimit")} />
                  <PricingCap text={t("capMenu")} val={t("planLimit")} />
                </div>
                <p className="text-xs font-bold text-indigo-500 tracking-wider mb-4">{t("pricingIncTitle")}</p>
                <ul className="space-y-3 mb-8">
                  <PricingBullet text={t("inc1")} />
                  <PricingBullet text={t("inc2")} />
                  <PricingBullet text={t("inc3")} />
                  <PricingBullet text={t("inc4")} />
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
               <Link href={`/${locale}/register`} className="inline-flex items-center justify-center gap-2 bg-[#FF5C39] hover:bg-[#e84e2d] text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg">
                 {t("trialBtn")} <ArrowRight size={20} />
               </Link>
            </div>
          </div>
        </section>

        {/* 6. FORMA E KONTAKTIT */}
        <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t("contactTitle")}</h2>
            <p className="text-gray-500 font-medium mb-12">{t("contactDesc")}</p>
            
            <form className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-left shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("contactNameLabel")}</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" placeholder="psh. Grand Resort" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("contactEmailLabel")}</label>
                  <input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" placeholder="psh. info@resort.com" />
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t("contactMsgLabel")}</label>
                <textarea rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none" placeholder="..."></textarea>
              </div>
              <button type="button" className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Send size={18} /> {t("contactBtn")}
              </button>
            </form>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            
            {/* Logoja e Zmadhuar në Footer */}
            <div className="md:col-span-2">
              <Link href={`/${locale}`} className="inline-block mb-6">
                <img src="/logo.svg" alt="HALLEVO" className="h-12 sm:h-16 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
              </Link>
              <p className="text-gray-500 text-sm max-w-xs font-medium leading-relaxed">
                {t("heroDesc")}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">{t("footerProduct")}</h4>
              <ul className="space-y-3">
                <li><Link href={`/${locale}/login`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">{t("loginBtn")}</Link></li>
                <li><Link href={`/${locale}/register`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">{t("registerBtn")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">{t("footerLegal")}</h4>
              <ul className="space-y-3">
                <li><Link href={`/${locale}/terms-and-conditions`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">{t("footerTerms")}</Link></li>
                <li><Link href={`/${locale}/privacy`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">{t("footerPrivacy")}</Link></li>
                <li><Link href={`/${locale}/refund`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">Refund Policy</Link></li>
                <li><Link href={`/${locale}/cookies`} className="text-gray-500 hover:text-[#FF5C39] text-sm font-medium transition-colors">{t("footerCookies")}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm font-medium text-center md:text-left">
              &copy; {new Date().getFullYear()} HALLEVO. {t("footerRights")}
            </p>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Globe size={18} className="text-gray-400" />
              <div className="flex items-center gap-3">
                 <Link href="/sq" className={`hover:text-[#FF5C39] transition-colors ${locale === 'sq' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>AL</Link>
                 <Link href="/en" className={`hover:text-[#FF5C39] transition-colors ${locale === 'en' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>EN</Link>
                 <Link href="/el" className={`hover:text-[#FF5C39] transition-colors ${locale === 'el' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>GR</Link>
                 <Link href="/mk" className={`hover:text-[#FF5C39] transition-colors ${locale === 'mk' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>MK</Link>
                 <Link href="/cg" className={`hover:text-[#FF5C39] transition-colors ${locale === 'cg' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>CG</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner 
        title={t("cookieTitle")}
        text={t("cookieText")} 
        customizeBtn={t("cookieCustomize")}
        rejectBtn={t("cookieReject")}
        acceptBtn={t("cookieAccept")} 
      />
    </div>
  );
}

function ModuleCard({ icon, title, desc, bullets, bg }: { icon: React.ReactNode, title: string, desc: string, bullets: string[], bg: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all group">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 font-medium mb-6">{desc}</p>
          <ul className="space-y-3">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Check size={12} className="text-gray-900" /></div>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PricingCap({ text, val }: { text: string, val: string }) {
  return (
    <div className="flex items-center justify-between font-medium text-sm">
       <span className="text-gray-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div> {text}</span>
       <span className="text-gray-900 font-bold">{val}</span>
    </div>
  );
}

function PricingBullet({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 font-medium text-sm text-gray-700">
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500"><Check size={12} strokeWidth={3} /></div>
      {text}
    </li>
  );
}

function TestimonialCard({ text, author, role }: { text: string, author: string, role: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <p className="text-gray-600 font-medium leading-relaxed mb-8 italic">"{text}"</p>
      <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{author.charAt(0)}</div>
        <div><h4 className="font-bold text-gray-900 text-sm">{author}</h4><p className="text-gray-500 text-xs font-medium">{role}</p></div>
      </div>
    </div>
  );
}