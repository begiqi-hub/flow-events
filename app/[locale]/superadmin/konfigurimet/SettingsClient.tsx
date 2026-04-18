"use client";

import { useState } from "react";
import { 
  Settings, Save, Mail, Phone, MapPin, Percent, 
  Globe, Shield, Facebook, Instagram, Info,
  UploadCloud, FileText, CreditCard, Landmark
} from "lucide-react";
import { updateSettings } from "./actions";

export default function SettingsClient({ locale, settings }: { locale: string, settings: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ...settings,
    enable_card_payments: settings?.enable_card_payments ?? true,
    enable_bank_transfers: settings?.enable_bank_transfers ?? true,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, platform_logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateSettings(formData, locale);
    setIsSaving(false);
    if (res.success) alert("Konfigurimet u ruajtën me sukses! ✨");
    else alert(res.error || "Pati një problem gjatë ruajtjes.");
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER ELEGANT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Settings size={28} />
            </div>
            Konfigurimet e Sistemit
          </h1>
          <p className="text-gray-500 font-medium mt-1 ml-1">Menaxho identitetin, financat dhe sigurinë e platformës.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
        >
          {isSaving ? "Duke ruajtur..." : <><Save size={20} /> Ruaj Ndryshimet</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLONA E MAJTË: IDENTITETI & KONTAKTI */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identiteti */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Info className="text-indigo-500" size={20} /> Identiteti i Platformës
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Ngarkimi i Logos */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {formData.platform_logo ? (
                    <img src={formData.platform_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <UploadCloud className="text-gray-300" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Logoja e Platformës</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    className="text-sm font-medium text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer transition-all w-full" 
                  />
                  <p className="text-xs text-gray-400 mt-2 font-medium">Formati i rekomanduar: PNG transparent. Madhësia max: 2MB.</p>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Emri Zyrtar</label>
                <input type="text" value={formData.platform_name || ""} 
                  onChange={e => setFormData({...formData, platform_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white font-bold text-gray-800 transition-all" />
              </div>

              <div className="md:col-span-1 relative">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1">
                  <FileText size={12} /> NUI (Numri i Biznesit)
                </label>
                <input type="text" value={formData.platform_nui || ""} placeholder="Psh. 811XXXXXX"
                  onChange={e => setFormData({...formData, platform_nui: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white font-bold text-gray-800 transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Slogani / Përshkrimi i shkurtër</label>
                <input type="text" value={formData.platform_slogan || ""} 
                  onChange={e => setFormData({...formData, platform_slogan: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white font-medium text-gray-600" />
              </div>
            </div>
          </div>

          {/* Kontaktet & Socials */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="text-indigo-500" size={20} /> Prezenca Online & Kontaktet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="Email-i i kontaktit" value={formData.contact_email || ""} 
                    onChange={e => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Numri i telefonit" value={formData.contact_phone || ""} 
                    onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
                  <input type="text" placeholder="Facebook URL" value={formData.facebook_url || ""} 
                    onChange={e => setFormData({...formData, facebook_url: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600" size={18} />
                  <input type="text" placeholder="Instagram URL" value={formData.instagram_url || ""} 
                    onChange={e => setFormData({...formData, instagram_url: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-400 font-medium" />
                </div>
              </div>
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-4 top-5 text-gray-400" size={18} />
                <textarea rows={3} placeholder="Adresa e zyrave qendrore" value={formData.address || ""} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-400 font-medium resize-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* KOLONA E DJATHTË: FINANCAT & KONTROLLI I SISTEMIT */}
        <div className="space-y-8">
          
          {/* Financat & Metodat e Pagesës */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Percent className="text-indigo-500" size={20} /> Pagesat & Financat
            </h3>
            
            <div className="space-y-6">
              {/* Konfigurimet Baze */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">TVSH (%)</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1 focus-within:border-indigo-400 transition-all">
                    <input type="number" step="0.01" value={formData.vat_rate || 0} 
                      onChange={e => setFormData({...formData, vat_rate: e.target.value})}
                      className="w-full bg-transparent border-none p-3 outline-none font-black text-gray-800 text-base" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Valuta</label>
                  <select value={formData.currency || "EUR"} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black text-gray-800 outline-none cursor-pointer hover:bg-white transition-all">
                    <option value="EUR">Euro (€)</option>
                    <option value="ALL">Lek (L)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Toggles për Pagesat */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><CreditCard size={18} /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Pagesa me Kartelë</p>
                      <p className="text-[11px] text-gray-500 font-medium">Stripe / Bank</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, enable_card_payments: !formData.enable_card_payments})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.enable_card_payments ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.enable_card_payments ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><Landmark size={18} /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Transfertë Bankare</p>
                      <p className="text-[11px] text-gray-500 font-medium">Faturë manuale</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, enable_bank_transfers: !formData.enable_bank_transfers})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.enable_bank_transfers ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.enable_bank_transfers ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* System Control */}
          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Shield className="text-indigo-300" size={20} /> Kontrolli i Sistemit
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Lejo Regjistrimet</p>
                  <p className="text-[10px] text-indigo-300 font-medium">Biznese të reja</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, allow_registration: !formData.allow_registration})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.allow_registration ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.allow_registration ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Maintenance Mode</p>
                  <p className="text-[10px] text-indigo-300 font-medium">Blloko aksesin publik</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, maintenance_mode: !formData.maintenance_mode})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.maintenance_mode ? 'bg-red-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.maintenance_mode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}