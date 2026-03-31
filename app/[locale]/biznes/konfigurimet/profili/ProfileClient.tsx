"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Save, MapPin, ShieldCheck, CreditCard, 
  Globe, Phone, Mail, FileText, UserCircle, Briefcase, Key, Upload, X, PenTool, Image as ImageIcon, Trash2
} from "lucide-react";
import { updateBusinessProfileAction } from "./actions";
import { useTranslations } from "next-intl"; 

const locationsData: Record<string, string[]> = {
  "Kosovo": ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Mitrovicë", "Gjilan", "Ferizaj", "Vushtrri", "Podujevë", "Suharekë", "Rahovec", "Kamenicë", "Shtime", "Drenas", "Skënderaj", "Deçan", "Klinë", "Lipjan"],
  "Albania": ["Tiranë", "Durrës", "Vlorë", "Elbasan", "Shkodër", "Fier", "Korçë", "Berat", "Lushnjë", "Kavajë", "Pogradec", "Gjirokastër", "Krujë", "Lezhë", "Kukës", "Sarandë"],
  "North Macedonia": ["Shkup (Skopje)", "Tetovë", "Gostivar", "Kumanovë", "Kërçovë", "Strugë", "Ohër", "Manastir (Bitola)", "Prilep", "Veles"],
  "Montenegro": ["Podgoricë", "Ulqin", "Tivar (Bar)", "Budvë", "Kotor", "Tuz", "Rozhajë", "Plavë", "Gusi", "Cetinje", "Nikshiq"],
  "Greece": ["Athinë", "Selanik", "Janinë", "Patra", "Larisa", "Volos", "Kretë"]
};

export default function ProfileClient({ business, locale = "sq" }: { business: any, locale?: string }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  
  // STATET PËR MODALIN E NËNSHKRIMIT TË PRONARIT
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const t = useTranslations("ProfileClient"); 

  const [formData, setFormData] = useState({
    name: business?.name || "",
    nui: business?.nui || "",
    vat_number: business?.vat_number || "",
    vat_rate: business?.vat_rate ? business.vat_rate.toString() : "", 
    business_type: business?.business_type || "",
    responsible_person: business?.responsible_person || "",
    currency: business?.currency || "EUR",
    
    logo_url: business?.logo_url || "",
    stamp_url: business?.stamp_url || "",
    stamp_description: business?.stamp_description || "",
    signature_url: business?.signature_url || "",

    email: business?.email || "",
    phone: business?.phone || "",
    website: business?.website || "",
    country: business?.country || "",
    city: business?.city || "",
    address: business?.address || "",
    
    bank_name: business?.bank_name || "",
    account_holder: business?.account_holder || "",
    iban: business?.iban || "",
    swift: business?.swift || "",

    cancel_penalty: business?.cancel_penalty || 0,
    cancel_days: business?.cancel_days || 0,
  });

  const availableCities = formData.country ? locationsData[formData.country] || [] : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'stamp_url') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        setToast({ show: true, message: t("toastErrorSize") || "Imazhi është shumë i madh (Maksimumi 2MB)!", type: "error" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // === LOGJIKA E VIZATIMIT PËR PRONARIN ===
  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;

      ctx.scale(ratio, ratio);
      
      ctx.strokeStyle = '#0F172A'; 
      ctx.lineWidth = 3;           
      ctx.lineCap = 'round';       
      ctx.lineJoin = 'round';      
      ctx.imageSmoothingEnabled = true; 
    }
  }, [isSignatureModalOpen]);

  const getCoordinates = (event: any): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault(); 
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    lastPos.current = { x: coords.x, y: coords.y };
  };

  const draw = (e: any) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    lastPos.current = { x: coords.x, y: coords.y };
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignatureToForm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureImage = canvas.toDataURL("image/png");
    setFormData({ ...formData, signature_url: signatureImage });
    setIsSignatureModalOpen(false);
  };
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const finalData = {
      ...formData,
      vat_rate: formData.vat_rate === "" ? 0 : Number(formData.vat_rate)
    };

    const res = await updateBusinessProfileAction(finalData);
    if (res?.error) {
      setToast({ show: true, message: res.error, type: "error" });
    } else {
      setToast({ show: true, message: t("toastSuccessSave") || "Të dhënat u ruajtën me sukses!", type: "success" });
    }
    setLoading(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ show: true, message: t("toastPassProcess") || "Kërkesa për fjalëkalim po procesohet...", type: "success" });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
      
      {/* MODALI I NËNSHKRIMIT TË PRONARIT */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="text-indigo-600" /> Nënshkrimi i Pronarit
              </h2>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm border border-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1">
              <p className="text-sm font-medium text-gray-500 mb-6 text-center leading-relaxed">
                Vizatoni firmën tuaj brenda kutisë së mëposhtme. Kjo firmë do të përdoret zyrtarisht në kontratat tuaja.
              </p>
              
              <div className="border-2 border-dashed border-indigo-200 rounded-3xl overflow-hidden bg-white shadow-inner touch-none">
                <canvas 
                  ref={canvasRef}
                  width={400} 
                  height={200} 
                  className="w-full h-[200px] cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <button type="button" onClick={clearCanvas} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={15} /> Pastro Kutinë
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsSignatureModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all text-sm">
                Anulo
              </button>
              <button 
                type="button"
                onClick={saveSignatureToForm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-sm"
              >
                Konfirmo Firmën
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
             <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === "success" ? (t("toastSuccessTitle") || "Sukses!") : (t("toastWarningTitle") || "Kujdes!")}
            </h3>
            <p className="text-gray-500 text-sm mb-8">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="w-full text-white font-bold py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-black transition-colors">
              {t("closeBtn") || "Mbyll"}
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">{t("pageSubtitle")}</p>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-fit">
        <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Briefcase size={18}/> {t("tabOfficial")}
        </button>
        <button onClick={() => setActiveTab('contact')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'contact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <MapPin size={18}/> {t("tabContact")}
        </button>
        <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <ShieldCheck size={18}/> {t("tabSecurity")}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* TAB 1: ZYRTARE */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Building2 size={20}/></div>
              <h2 className="text-xl font-bold text-gray-900">{t("sectionOfficialTitle")}</h2>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2 mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("logoLabel")}</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                    {formData.logo_url ? (
                      <>
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => setFormData({...formData, logo_url: ""})} className="p-1.5 bg-white text-red-500 rounded-full"><X size={16}/></button>
                        </div>
                      </>
                    ) : (
                      <Building2 size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" accept="image/*" className="hidden" 
                      ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo_url')} 
                    />
                    <button 
                      type="button" onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <Upload size={16} /> {t("uploadLogoBtn")}
                    </button>
                    <p className="text-xs text-gray-400 mt-2 font-medium whitespace-pre-line">{t("logoNote")}</p>
                  </div>
                </div>
              </div>
              <hr className="md:col-span-2 border-gray-100 mb-2" />

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("businessNameLabel")}</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 text-lg shadow-sm" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("nuiLabel")}</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900" value={formData.nui} onChange={(e) => setFormData({...formData, nui: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("vatNumLabel")}</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="psh. 330123456" className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.vat_number} onChange={(e) => setFormData({...formData, vat_number: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("vatRateLabel")}</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" placeholder="" className="w-full border border-gray-200 pl-4 pr-8 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 text-center" value={formData.vat_rate} onChange={(e) => setFormData({...formData, vat_rate: e.target.value})} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("bizTypeLabel")}</label>
                <select className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900 cursor-pointer" value={formData.business_type} onChange={(e) => setFormData({...formData, business_type: e.target.value})}>
                  <option value="">{t("bizTypeSelect")}</option>
                  <option value="LLC">{t("typeLlc")}</option>
                  <option value="Individual">{t("typeIndividual")}</option>
                  <option value="Agency">{t("typeAgency")}</option>
                  <option value="NGO">{t("typeNgo")}</option>
                  <option value="Other">{t("typeOther")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("repPersonLabel")}</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.responsible_person} onChange={(e) => setFormData({...formData, responsible_person: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("currencyLabel")}</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 cursor-pointer" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="USD">$ Dollar Amerikan (USD)</option>
                    <option value="CHF">CHF Frang Zviceran (CHF)</option>
                    <option value="GBP">£ Paund Britanik (GBP)</option>
                    <option value="ALL">L Lek Shqiptar (ALL)</option>
                    <option value="MKD">ден Denar Maqedonas (MKD)</option>
                  </select>
                </div>
              </div>

              {/* === SEKSIONI I DOKUMENTEVE LIGJORE (VULA DHE FIRMA) === */}
              <div className="md:col-span-2 mt-8 pt-8 border-t-2 border-dashed border-gray-200">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-500" size={20} /> Nënshkrimet dhe Vula (Për Kontratat)
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Ngarkoni vulën tuaj dhe vizatoni firmën. Këto do të shfaqen automatikisht në fund të çdo kontrate dhe fature.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* KARTA E VULËS (Mbetet Upload) */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Vula e Biznesit</label>
                    <div className="flex flex-col gap-4">
                      <div className="h-32 rounded-xl border-2 border-dashed border-indigo-200 flex items-center justify-center bg-white overflow-hidden relative group">
                        {formData.stamp_url ? (
                          <>
                            <img src={formData.stamp_url} alt="Vula" className="h-full w-auto object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => setFormData({...formData, stamp_url: ""})} className="p-2 bg-white text-red-500 rounded-full"><X size={18}/></button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-indigo-300 flex flex-col items-center">
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-xs font-bold">PNG pa sfond</span>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/png" className="hidden" ref={stampInputRef} onChange={(e) => handleImageUpload(e, 'stamp_url')} />
                      
                      <button 
                        type="button" onClick={() => stampInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                      >
                        <Upload size={16} /> Ngarko Vulën
                      </button>
                    </div>
                  </div>

                  {/* KARTA E FIRMËS (Tani me Vizatim) */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Nënshkrimi (Firma e Pronarit)</label>
                    <div className="flex flex-col gap-4">
                      <div className="h-32 rounded-xl border-2 border-dashed border-indigo-200 flex items-center justify-center bg-white overflow-hidden relative group">
                        {formData.signature_url ? (
                          <>
                            <img src={formData.signature_url} alt="Firma" className="h-full w-auto object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => setFormData({...formData, signature_url: ""})} className="p-2 bg-white text-red-500 rounded-full"><X size={18}/></button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-indigo-300 flex flex-col items-center">
                            <PenTool size={32} className="mb-2" />
                            <span className="text-xs font-bold">Firma Elektronike</span>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        type="button" onClick={() => setIsSignatureModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-100 border border-indigo-200 hover:bg-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                      >
                        <PenTool size={16} /> Vizato Nënshkrimin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* === FUNDI I DOKUMENTEVE LIGJORE === */}

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-3xl">
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#0F172A] hover:bg-black text-white font-bold py-4 px-10 rounded-xl disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={20} /> {loading ? (t("savingBtn") || "Po ruhet...") : (t("saveDataBtn") || "Ruaj Të Dhënat")}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: KONTAKTI */}
        {activeTab === 'contact' && (
          <form onSubmit={handleSubmit} className="animate-in fade-in duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><MapPin size={20}/></div>
              <h2 className="text-xl font-bold text-gray-900">{t("sectionContactTitle")}</h2>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("emailLabel")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">{t("emailWarning")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("phoneLabel")}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("websiteLabel")}</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="www.biznesiyt.com" className="w-full border border-gray-200 pl-11 pr-4 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>
              </div>

              <hr className="md:col-span-2 border-gray-100 my-2" />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("countryLabel")}</label>
                <select className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 cursor-pointer" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value, city: ""})}>
                  <option value="">{t("countrySelect")}</option>
                  <option value="Kosovo">{t("countryKs")}</option>
                  <option value="Albania">{t("countryAl")}</option>
                  <option value="North Macedonia">{t("countryMk")}</option>
                  <option value="Montenegro">{t("countryMe")}</option>
                  <option value="Greece">{t("countryGr")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("cityLabel")}</label>
                {availableCities.length > 0 ? (
                  <select className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-bold text-gray-900 cursor-pointer" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                    <option value="">{t("citySelect")}</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" placeholder={t("cityPlaceholder")} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("addressLabel")}</label>
                <textarea rows={3} className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900 resize-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-3xl">
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#0F172A] hover:bg-black text-white font-bold py-4 px-10 rounded-xl disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={20} /> {loading ? (t("savingBtn") || "Po ruhet...") : (t("saveContactBtn") || "Ruaj Kontaktin")}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SIGURIA */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="animate-in fade-in duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl"><Key size={20}/></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("sectionSecurityTitle")}</h2>
                  <p className="text-sm text-gray-500 font-medium">{t("sectionSecurityDesc")}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("currentPassLabel")}</label>
                <input type="password" required placeholder="••••••••" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900 md:w-1/2" />
              </div>
              
              <hr className="md:col-span-2 border-gray-100 my-2" />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("newPassLabel")}</label>
                <input type="password" required placeholder="••••••••" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("confirmPassLabel")}</label>
                <input type="password" required placeholder="••••••••" className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-gray-900 focus:ring-1 bg-white font-medium text-gray-900" />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-3xl">
              <button type="submit" className="w-full sm:w-auto bg-[#0F172A] hover:bg-black text-white font-bold py-4 px-10 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                <ShieldCheck size={20} /> {t("updatePassBtn")}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}