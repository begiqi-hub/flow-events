"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, CheckCircle2, ArrowRight, ShieldOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // SHTUAM MBAJ MEND
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const params = useParams();
  const locale = params?.locale || "sq";

  // LOGO PATH (Do të menaxhohet nga SuperAdmin më vonë)
  const logoPath = "/logo.png"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const res = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });

    if (res?.error) {
      setError("Emaili ose fjalëkalimi është i gabuar!");
      setLoading(false);
    } else {
      const session = await getSession();
      if (session?.user?.role === "superadmin") {
        router.push(`/${locale}/superadmin/bizneset`);
      } else {
        router.push(`/${locale}/biznes`);
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      
      {/* ANTA E MAJTË: VIZUALE (Atraktive për Evente) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
        {/* Imazh prapavije me overlay - Mund ta ndryshosh URL-në me një foto koncerti ose dasme */}
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
          alt="Events Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 hover:scale-100 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent" />
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
               <img src={logoPath} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-white text-2xl font-black tracking-tighter italic">FLOW EVENTS</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Organizo evente që <span className="text-indigo-400">mbahen mend</span> gjatë.
            </h2>
            <p className="text-indigo-100 text-lg font-medium opacity-80">
              Platforma e vetme që ju duhet për menaxhimin e sallave, rezervimeve dhe stafit tuaj në kohë reale.
            </p>
          </div>

          <div className="flex items-center gap-6 text-white/60 text-sm font-bold tracking-widest uppercase">
            <span>Planning</span>
            <span>•</span>
            <span>Booking</span>
            <span>•</span>
            <span>Success</span>
          </div>
        </div>
      </div>

      {/* ANTA E DJATHTË: FORMA E LOGINIT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-gray-50/50">
        <div className="w-full max-w-md">
          
          {/* Logo për Mobile */}
          <div className="lg:hidden mb-12 flex justify-center">
             <img src={logoPath} alt="Logo" className="h-12 object-contain" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Mirësevini</h1>
            <p className="text-gray-500 font-medium">Shkruani të dhënat tuaja për të hyrë në panel.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <ShieldOff size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Emaili</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full bg-white border border-gray-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-800 shadow-sm" 
                  placeholder="admin@flow-events.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Fjalëkalimi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full bg-white border border-gray-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-800 shadow-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Mbaj mend</span>
              </label>
              <Link href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Harruat fjalëkalimin?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? "Po hyjmë..." : <><ArrowRight size={20} /> Hyr në Sistem</>}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-bold text-gray-500">
              Nuk keni llogari?{" "}
              <Link href={`/${locale}/register`} className="text-indigo-600 hover:text-indigo-800 underline-offset-4 hover:underline">
                Regjistrohu Falas
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}