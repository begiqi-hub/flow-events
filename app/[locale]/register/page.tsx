"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";

const QYTETET = [
  "Prishtinë", "Prizren", "Pejë", "Gjakovë", "Mitrovicë", "Gjilan", "Ferizaj", 
  "Vushtrri", "Podujevë", "Rahovec", "Suharekë", "Lipjan", "Drenas", "Kamenicë", 
  "Klinë", "Skenderaj", "Istog", "Viti", "Deçan", "Dragash", "Malishevë", "Shtime"
];

// Përdorim kodet e shteteve për të tërhequr imazhet e flamujve nga FlagCDN
const SHTETET = [
  { code: "+383", img: "xk", name: "Kosovë" },
  { code: "+355", img: "al", name: "Shqipëri" },
  { code: "+389", img: "mk", name: "Maqedoni e V." },
  { code: "+382", img: "me", name: "Mali i Zi" },
  { code: "+381", img: "rs", name: "Serbi" },
  { code: "+41",  img: "ch", name: "Zvicër" },
  { code: "+49",  img: "de", name: "Gjermani" },
  { code: "+43",  img: "at", name: "Austri" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State për Dropdown-in e ri të flamujve
  const [selectedCountry, setSelectedCountry] = useState(SHTETET[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [formData, setFormData] = useState({
    name: "", nui: "", activityId: "", city: "", 
    email: "", password: "", confirmPassword: "", acceptedTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Verifikimi i Fjalëkalimit (Kushtet e reja)
    if (formData.password.length < 8) {
      return setError("Fjalëkalimi duhet të ketë të paktën 8 karaktere!");
    }
    
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    
    if (!hasLetter || !hasNumber) {
      return setError("Fjalëkalimi duhet të jetë i përzier (të përmbajë të paktën një shkronjë dhe një numër)!");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Fjalëkalimet nuk përputhen!");
    }

    // 2. Kushtet e përdorimit
    if (!formData.acceptedTerms) {
      return setError("Duhet të pranoni kushtet për të vazhduar.");
    }

    setLoading(true);
    setError("");

    // Rregullojmë numrin
    const formattedPhone = phoneNumber.replace(/^0+/, '');
    const fullPhone = `${selectedCountry.code} ${formattedPhone}`;

    const finalData = { ...formData, phone: fullPhone };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        // Siguresa e re: Përpiqemi ta lexojmë si JSON, nëse dështon (psh. Error 404), e kapim!
        let data;
        try {
          data = await res.json();
        } catch (err) {
          data = { error: "Lidhja me serverin dështoi. Sigurohu që skedari API ekziston!" };
        }
        setError(data.error || "Ky biznes ose email është regjistruar tashmë!");
        setLoading(false);
      }
    } catch (err) {
      setError("Mungon interneti ose serveri është i fikur.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 w-full max-w-2xl m-auto">
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-gray-900 text-white p-3 rounded-2xl mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Flow Events</h1>
          <p className="text-gray-500 mt-2 font-medium">Krijo llogarinë dhe fillo 14 ditë provë falas</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Emri i biznesit</label>
            <input type="text" required placeholder="p.sh. Salla Imperial" className="w-full border p-2.5 rounded-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numri i Biznesit (NUI)</label>
            <input type="text" required placeholder="81xxxxxx" className="w-full border p-2.5 rounded-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.nui} onChange={(e) => setFormData({...formData, nui: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veprimtaria</label>
            <select required className="w-full border p-2.5 rounded-md bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.activityId} onChange={(e) => setFormData({...formData, activityId: e.target.value})}>
              <option value="">Zgjidh veprimtarinë...</option>
              <option value="salla">Salla Dasmash</option>
              <option value="hotel">Hotel / Restorant</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefoni</label>
            <div className="flex">
              <button 
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 px-3 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${selectedCountry.img}.png`} alt={selectedCountry.name} className="w-5 shadow-sm" />
                <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute top-[70px] left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 overflow-hidden">
                    {SHTETET.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm transition-colors"
                        onClick={() => {
                          setSelectedCountry(s);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://flagcdn.com/w20/${s.img}.png`} alt={s.name} className="w-5 shadow-sm" />
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-gray-400 ml-auto">{s.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <input 
                type="number" 
                required 
                placeholder="4x xxx xxx"
                className="w-full border p-2.5 rounded-r-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qyteti</label>
            <select required className="w-full border p-2.5 rounded-md bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
              <option value="">Zgjidh qytetin...</option>
              {QYTETET.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required placeholder="info@biznesi.com" className="w-full border p-2.5 rounded-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fjalëkalimi</label>
            <input type="password" required placeholder="••••••••" className="w-full border p-2.5 rounded-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmo Fjalëkalimin</label>
            <input type="password" required placeholder="••••••••" className="w-full border p-2.5 rounded-md outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>

          <div className="md:col-span-2 flex items-center gap-2 mt-2">
            <input type="checkbox" id="terms" required checked={formData.acceptedTerms} onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})} className="w-4 h-4 cursor-pointer" />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">Pranoj kushtet e përdorimit dhe politikat e privatësisë.</label>
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm">
              {loading ? "Po regjistrohet..." : "Regjistrohu Falas"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Keni tashmë llogari? <Link href="/login" className="text-blue-600 font-medium hover:underline">Kyçuni këtu</Link>
        </p>
      </div>
    </div>
  );
}