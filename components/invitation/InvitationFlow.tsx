"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft, ArrowRight, Baby, BriefcaseBusiness, Cake, Check, ChevronDown,
  Crown, Filter, Gift, Heart, Menu, Search, Sparkles, Star, Users, X, MoreHorizontal, Plus
} from "lucide-react";

const InvitationStudio = dynamic(
  () => import("@/components/invitation/InvitationStudio"),
  { ssr: false }
);

export type TemplateStyle =
  | "editorial"
  | "romantic"
  | "luxury"
  | "garden"
  | "midnight"
  | "celebration"
  | "baby"
  | "corporate"
  | "minimal";

export type TemplateDef = {
  id: number;
  name: string;
  category: string;
  styleType: TemplateStyle;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  fontPair: string;
  demoData: {
    title: string;
    subtitle: string;
    date: string;
    venue: string;
  };
};

const categories = [
  { name: "Dasma", icon: Heart, tone: "rose" },
  { name: "Fejesa", icon: Heart, tone: "pink" },
  { name: "Ditëlindje", icon: Cake, tone: "amber" },
  { name: "Syneti", icon: Users, tone: "sky" },
  { name: "Përvjetor", icon: Gift, tone: "red" },
  { name: "Baby Shower", icon: Baby, tone: "violet" },
  { name: "Event familjar", icon: Users, tone: "emerald" },
  { name: "Evente biznesi", icon: BriefcaseBusiness, tone: "indigo" },
  { name: "Evente të tjera", icon: Sparkles, tone: "slate" },
];

export const invitationTemplates: TemplateDef[] = [
  {
    id: 1, name: "Maison", category: "Dasma", styleType: "editorial",
    bgColor: "#f7f3ed", borderColor: "#b89b72", textColor: "#2c2925", accentColor: "#9f8159",
    fontPair: "Cormorant Garamond + Montserrat",
    demoData: { title: "Arben & Sara", subtitle: "KEMI KËNAQËSINË T'JU FTOJMË", date: "15 Qershor 2026 · 19:00", venue: "Hotel Emerald · Prishtinë" }
  },
  {
    id: 2, name: "Rosé Garden", category: "Dasma", styleType: "garden",
    bgColor: "#fbf5f5", borderColor: "#c9878f", textColor: "#5b343b", accentColor: "#b96d78",
    fontPair: "DM Serif Display + Poppins",
    demoData: { title: "Drin & Blerta", subtitle: "NJË DITË. NJË DASHURI. NJË JETË.", date: "20 Korrik 2026 · 20:00", venue: "Garden 5 · Prishtinë" }
  },
  {
    id: 3, name: "Noir Gold", category: "Dasma", styleType: "luxury",
    bgColor: "#171613", borderColor: "#caa66a", textColor: "#f7efe1", accentColor: "#d6b274",
    fontPair: "Cinzel + Montserrat",
    demoData: { title: "Lirim & Vlora", subtitle: "SAVE THE DATE", date: "25 Shtator 2026 · 19:30", venue: "Sirius Hotel · Prishtinë" }
  },
  {
    id: 4, name: "Celeste", category: "Fejesa", styleType: "midnight",
    bgColor: "#11162b", borderColor: "#9aa8e8", textColor: "#f3f4ff", accentColor: "#a8b4f1",
    fontPair: "Cormorant Garamond + Inter",
    demoData: { title: "Krenar & Hana", subtitle: "NËN DRITËN E YJEVE", date: "12 Gusht 2026 · 20:00", venue: "Emerald Terrace" }
  },
  {
    id: 5, name: "Atelier", category: "Fejesa", styleType: "romantic",
    bgColor: "#f8eee9", borderColor: "#a97968", textColor: "#4b332b", accentColor: "#a06f5d",
    fontPair: "Playfair Display + Manrope",
    demoData: { title: "Blerimi & Era", subtitle: "ME KËNAQËSI JU FTOJMË", date: "05 Maj 2026 · 19:00", venue: "Garden Hall · Prishtinë" }
  },
  {
    id: 6, name: "Afterglow", category: "Ditëlindje", styleType: "celebration",
    bgColor: "#171329", borderColor: "#f59ac5", textColor: "#fff7fc", accentColor: "#f39ac4",
    fontPair: "DM Serif Display + Poppins",
    demoData: { title: "Era's 21st", subtitle: "LET'S CELEBRATE", date: "10 Korrik 2026 · 21:00", venue: "Duplex Club · Prishtinë" }
  },
  {
    id: 7, name: "Little Moon", category: "Baby Shower", styleType: "baby",
    bgColor: "#f4f6fb", borderColor: "#94a9d8", textColor: "#34425e", accentColor: "#7f96ca",
    fontPair: "Lora + Manrope",
    demoData: { title: "Baby Liam", subtitle: "A LITTLE STAR IS ON THE WAY", date: "02 Prill 2026 · 16:00", venue: "Family Lounge" }
  },
  {
    id: 8, name: "Executive", category: "Evente biznesi", styleType: "corporate",
    bgColor: "#f4f7fb", borderColor: "#5c6ee0", textColor: "#172033", accentColor: "#4659c7",
    fontPair: "Inter + Manrope",
    demoData: { title: "Tech Summit 2026", subtitle: "ANNUAL INNOVATION CONFERENCE", date: "18 Nëntor 2026 · 09:00", venue: "Emerald Congress" }
  },
  {
    id: 9, name: "Pure", category: "Evente biznesi", styleType: "minimal",
    bgColor: "#ffffff", borderColor: "#d7d9df", textColor: "#18191c", accentColor: "#2d3138",
    fontPair: "Libre Baskerville + Inter",
    demoData: { title: "Business Dinner", subtitle: "YOU ARE INVITED", date: "04 Dhjetor 2026 · 19:00", venue: "The Olive · Prishtinë" }
  },
];

const toneClasses: Record<string, string> = {
  rose: "bg-rose-50 text-rose-600",
  pink: "bg-pink-50 text-pink-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  slate: "bg-slate-100 text-slate-600",
};

export function TemplatePreview({ template }: { template: TemplateDef }) {
  const isDark = ["luxury", "midnight", "celebration"].includes(template.styleType);
  const bg =
    template.styleType === "garden"
      ? "radial-gradient(circle at 10% 10%, rgba(190,115,125,.18), transparent 28%), radial-gradient(circle at 90% 85%, rgba(190,115,125,.13), transparent 28%), #fbf5f5"
      : template.styleType === "midnight"
        ? "radial-gradient(circle at 50% 0%, rgba(129,140,248,.22), transparent 35%), #11162b"
        : template.styleType === "celebration"
          ? "radial-gradient(circle at 15% 15%, rgba(245,154,197,.16), transparent 25%), radial-gradient(circle at 85% 75%, rgba(167,139,250,.16), transparent 25%), #171329"
          : template.bgColor;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: bg, color: template.textColor }}>
      <div className="absolute inset-3 border opacity-70" style={{ borderColor: template.borderColor, borderRadius: "6px" }} />
      <div className="absolute inset-5 border opacity-25" style={{ borderColor: template.borderColor, borderRadius: "4px" }} />
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-8 text-center">
        <div>
          <div className="mb-5 flex justify-center">
            {template.styleType === "luxury" ? <Crown size={17} /> :
             template.styleType === "midnight" ? <Star size={16} /> :
             template.styleType === "celebration" ? <Sparkles size={18} /> :
             template.styleType === "garden" ? <Heart size={16} fill="currentColor" className="text-rose-400" /> :
             <span className="h-px w-14" style={{ background: template.accentColor }} />}
          </div>
          <p className="mb-3 text-[6px] font-semibold tracking-[.32em] opacity-70">{template.demoData.subtitle}</p>
          <h3 className="max-w-[145px] text-[20px] leading-[1.05]" style={{ fontFamily: "Georgia, serif" }}>
            {template.demoData.title}
          </h3>
        </div>
        <div className="space-y-2">
          <div className="mx-auto h-px w-10 opacity-50" style={{ background: template.borderColor }} />
          <p className="text-[7px] font-medium tracking-[.08em] opacity-80">{template.demoData.date}</p>
          <p className="text-[7px] opacity-65">{template.demoData.venue}</p>
        </div>
      </div>
      {template.styleType === "garden" && (
        <>
          <div className="absolute -left-7 top-10 h-20 w-20 rounded-full border opacity-20" style={{ borderColor: template.accentColor }} />
          <div className="absolute -right-8 bottom-16 h-28 w-28 rounded-full border opacity-20" style={{ borderColor: template.accentColor }} />
        </>
      )}
    </div>
  );
}

export default function InvitationFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState("Të gjitha");
  const [query, setQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef | null>(null);
  const [myInvitationsOpen, setMyInvitationsOpen] = useState(false);

  const filteredTemplates = useMemo(() => {
    return invitationTemplates.filter((tpl) => {
      const matchesCategory = selectedCategory === "Të gjitha" || tpl.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesSearch = !q || `${tpl.name} ${tpl.category} ${tpl.fontPair}`.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, query]);

  if (step === 3) {
    return <InvitationStudio template={selectedTemplate} onBack={() => setStep(2)} />;
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => step === 2 ? setStep(1) : undefined} className="rounded-xl p-2 hover:bg-slate-100">
              {step === 2 ? <ArrowLeft size={19} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="HALLEVO" className="h-7 w-auto object-contain" />
              <div className="hidden sm:block">
                <div className="text-sm font-bold tracking-tight">HALLEVO</div>
                <div className="text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">Invitation Studio</div>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${step >= 1 ? "border-slate-200 bg-white" : "text-slate-400"}`}><span className="grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-[9px] text-white">1</span> Eventi</div>
            <ArrowRight size={13} className="text-slate-300" />
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${step >= 2 ? "border-slate-200 bg-white" : "text-slate-400"}`}><span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${step >= 2 ? "bg-slate-950 text-white" : "bg-slate-100"}`}>2</span> Template</div>
            <ArrowRight size={13} className="text-slate-300" />
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-400"><span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[9px]">3</span> Studio</div>
          </div>
          <button onClick={() => setMyInvitationsOpen(true)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-slate-50">
            Ftesat e mia
          </button>
        </div>
      </header>

      {/* MODALI PËR FTESAT E MIA NË FAQEN E PARË */}
      {myInvitationsOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white shadow-2xl h-full animate-in slide-in-from-right duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <h2 className="text-sm font-bold">Ftesat e mia</h2>
              <button onClick={() => setMyInvitationsOpen(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto h-[calc(100vh-64px)] space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 shadow-sm flex justify-between items-center bg-white hover:border-indigo-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 font-serif font-bold text-sm shrink-0">🎉</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dasma e Arben & Sara</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">15 Qershor 2026 · Hotel Emerald</p>
                  </div>
                </div>
                <MoreHorizontal size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 ? (
        <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-12">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[#11131a] px-6 py-9 text-white shadow-[0_25px_80px_rgba(15,23,42,.16)] sm:px-10 lg:px-14 lg:py-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-6 -bottom-36 h-96 w-96 rounded-full border border-white/5" />
            <div className="relative max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-white/70"><Sparkles size={12} /> Creative invitation studio</div>
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">Krijo një ftesë që duket si e bërë vetëm për ty.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Zgjidh eventin, nis nga një dizajn profesional dhe personalizo çdo detaj. Pa regjistrim në fillim.</p>
              <div className="mt-7 flex flex-wrap gap-2 text-[11px] font-medium text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">1 foto personale</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Web + PDF + PNG</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">QR + Share</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Mobile-first</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Hapi i parë</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">Çfarë po feston?</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.name} onClick={() => { setSelectedCategory(item.name); setStep(2); }}
                    className="group flex min-h-[112px] flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClasses[item.tone]}`}><Icon size={18} /></span>
                    <span className="text-xs font-bold">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Zgjidh bazën e dizajnit</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Template profesionale</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500">Template të strukturuara, jo thjesht fotografi. Çdo element mund të personalizohet në Studio.</p>
            </div>
            <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <Search size={17} className="text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kërko template..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              <Filter size={15} className="text-slate-400" />
            </div>
          </div>

          <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
            {["Të gjitha", ...categories.map(c => c.name)].map((tab) => (
              <button key={tab} onClick={() => setSelectedCategory(tab)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${selectedCategory === tab ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredTemplates.map((tpl) => (
              <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl); setStep(3); }}
                className="group min-w-0 text-left">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
                  <TemplatePreview template={tpl} />
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                    <span className="text-[10px] font-semibold">Përdor këtë template</span><ArrowRight size={13} />
                  </div>
                </div>
                <div className="px-1 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-xs font-bold text-slate-900">{tpl.name}</h3>
                    <span className="text-[9px] text-slate-400">{tpl.styleType}</span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-400">{tpl.fontPair}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto text-slate-300" size={28} />
              <p className="mt-3 text-sm font-semibold">Nuk u gjet asnjë template.</p>
              <button onClick={() => { setSelectedCategory("Të gjitha"); setQuery(""); }} className="mt-2 text-xs font-bold text-indigo-600">Pastro filtrat</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}