"use client";

import { useState } from "react";
import { Save, FileText, CheckCircle2, Building2, MapPin, Calendar, Clock, Banknote, ShieldCheck } from "lucide-react";
import { updateContractTemplateAction } from "./actions";

// Teksti Default për Rregullat e Sallës
const DEFAULT_RULES = `1. Ndalohet rreptësisht sjellja e ushqimeve apo pijeve nga jashtë pa miratimin e menaxhmentit.
2. Qiramarrësi mban përgjegjësi të plotë financiare për çdo dëmtim të pronës ose inventarit të shkaktuar nga ai ose të ftuarit.
3. Dekorimet duhet të aprovohen paraprakisht dhe nuk lejohet përdorimi i materialeve që dëmtojnë muret ose dyshemenë.
4. Muzika live ose DJ duhet të respektojë limitet e zhurmës pas orës 24:00.
5. Salla nuk mban përgjegjësi për sendet personale të humbura gjatë eventit.`;

export default function TemplateClient({ business, locale }: { business: any, locale: string }) {
  const [template, setTemplate] = useState(business?.contract_template || DEFAULT_RULES);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    const res = await updateContractTemplateAction(template);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  // TË DHËNA SHEMBULL PËR PAMJEN E DREJTPËRDREJTË (Live Preview)
  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  const currencySymbols: Record<string, string> = { "EUR": "€", "ALL": "L" };
  const symbol = currencySymbols[business?.currency] || business?.currency || "€";

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 bg-[#F4F6F8] min-h-screen animate-in fade-in duration-500 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-2">
            <FileText className="text-indigo-600" /> Rregullorja e Sallës
          </h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">
            Të dhënat kryesore të kontratës plotësohen automatikisht. Këtu shkruani vetëm <strong>rregullat e brendshme</strong> të biznesit tuaj. Shikoni pamjen në të djathtë se si do të duket kontrata përfundimtare.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
        >
          {success ? <CheckCircle2 size={20} /> : <Save size={20} />} 
          {loading ? "Po ruhet..." : success ? "U ruajt me sukses!" : "Ruaj Rregulloren"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* KOLONA E MAJTË: EDITOR I THJESHTË TEKSTI */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
          <div className="flex items-center gap-2.5 mb-6">
            <ShieldCheck size={20} className="text-indigo-500" />
            <h3 className="font-bold text-lg text-gray-900">Shkruani Rregullat e Brendshme (Neni 5)</h3>
          </div>
          <textarea 
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full h-[500px] p-6 rounded-2xl border-2 border-gray-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 resize-none font-medium text-gray-700 leading-relaxed text-[15px] outline-none transition-all shadow-inner bg-gray-50"
            placeholder="Shkruani rregullat e sallës suaj, një për çdo rresht..."
          />
        </div>

        {/* KOLONA E DJATHTË: LIVE PREVIEW (Pamja e mini-kontratës) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">Pamja e Drejtpërdrejtë e Kontratës</div>
             <div className="text-[11px] font-medium text-gray-400 italic">(Të dhëna shembull)</div>
          </div>

          {/* Trupi i mini-kontratës - I dizajnuar si dokumenti A4 */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-100 flex flex-col leading-relaxed text-[11px] text-gray-800 shadow-sm space-y-4">
            
            {/* Header i mini-kontratës */}
            <div className="flex flex-col items-center border-b-2 border-gray-900 pb-4 mb-4 text-center shrink-0">
              {business?.logo_url ? (
                <img src={business.logo_url} alt="Logo" className="h-10 w-auto object-contain mb-2" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-2">
                  <Building2 size={20} />
                </div>
              )}
              <h1 className="text-[14px] font-black uppercase tracking-widest">{business?.name || "EMRI I BIZNESIT TUAJ"}</h1>
              <p className="text-[10px] font-medium text-gray-500 mt-0.5">{business?.address || "Adresa Shembull"}, {business?.city || "Qyteti"} | Tel: {business?.phone || "044XXXXXX"}</p>
              <h2 className="text-[16px] font-black mt-5 uppercase underline decoration-2 underline-offset-2">Kontratë Shërbimi</h2>
              <p className="text-[10px] font-bold mt-1 text-gray-500">Data e lidhjes: {today}</p>
            </div>

            {/* Hyrja me të dhëna dummy */}
            <div className="text-justify">
              <p>Kjo kontratë ("Marrëveshje") lidhet sot, më datë <strong>{today}</strong>, ndërmjet palëve të poshtëshënuara:</p>
              <ul className="list-none mt-2 space-y-1 ml-4">
                <li><strong>1. (Qiradhënësi):</strong> <u>{business?.name || "EMRI I BIZNESIT TUAJ"}</u>, përfaqësuar nga {business?.responsible_person || "përfaqësuesi i autorizuar"}.</li>
                <li><strong>2. (Qiramarrësi):</strong> <u>Filan Fisteku (Shembull)</u>, tel: 049123456.</li>
              </ul>
            </div>

            {/* Nenet e blinduara */}
            <div className="space-y-3.5 text-justify">
              <div>
                <h3 className="font-bold text-[12px] uppercase">Neni 1: Objekti</h3>
                <p>Ofrimi i sallës <strong>"Salla Grand (Shembull)"</strong> për organizimin e eventit <strong>Dasmë</strong>. Data <strong>15.10.2024</strong>, nga ora <strong>18:00</strong> deri në <strong>01:00</strong>.</p>
              </div>

              <div>
                <h3 className="font-bold text-[12px] uppercase">Neni 2: Financat</h3>
                <p>Vlera totale është <strong>{symbol} 5,000.00</strong>. Kapari i paguar <strong>{symbol} 1,500.00</strong>. Mbetja <strong>{symbol} 3,500.00</strong> paguhet në ditën e eventit.</p>
              </div>

              <div>
                <h3 className="font-bold text-[12px] uppercase">Neni 3: Pjesëmarrësit</h3>
                <p>Marrëveshja vlen për <strong>250 persona</strong>. Çdo person shtesë paguhet ekstra.</p>
              </div>

              <div>
                <h3 className="font-bold text-[12px] uppercase">Neni 4: Anulimi</h3>
                <p>Kapari nuk kthehet. Anulimi më pak se {business?.cancel_days || "30"} ditë para eventit penalizohet me {business?.cancel_penalty || "50"}% të vlerës.</p>
              </div>

              {/* 🔥 KËTU ËSHTË LIVE PREVIEW: Teksti që shkruan biznesi në krahun e majtë shfaqet këtu! */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-inner">
                <h3 className="font-bold text-[12px] uppercase text-indigo-900 flex items-center gap-1.5"><ShieldCheck size={14} className="text-indigo-500" /> Neni 5: Rregullorja e Brendshme (Teksti Juaj)</h3>
                <div className="whitespace-pre-line mt-2 text-indigo-900 font-medium leading-relaxed">{template || "(Shkruani rregullat në krahun e majtë...)"}</div>
              </div>
            </div>

            {/* Nënshkrimet e mini-kontratës */}
            <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-between items-end shrink-0">
              <div className="text-center w-1/3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-6">Qiradhënësi</p>
                <div className="border-b border-gray-400 mb-1"></div>
                <p className="text-[10px] font-bold text-gray-900">{business?.name || "BIZNESI TUAJ"}</p>
              </div>
              
              <div className="text-center w-1/3 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-300 rotate-12">VULA</div>
              </div>

              <div className="text-center w-1/3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-6">Qiramarrësi (Klienti)</p>
                <div className="border-b border-gray-400 mb-1"></div>
                <p className="text-[10px] font-bold text-gray-900">Filan Fisteku (Shembull)</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}