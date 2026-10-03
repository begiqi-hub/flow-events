"use client";

import { useState, useEffect } from "react";
import { toggleHallManagement, toggleHallPublication } from "./actions";
import { Globe, CalendarCheck, AlertCircle, FileText, Zap } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface HallTogglesProps {
  hallId: string;
  businessId: string;
  initialIsPublished: boolean;
  initialIsManaged: boolean;
}

export default function HallToggles({ hallId, businessId, initialIsPublished, initialIsManaged }: HallTogglesProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "sq";

  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isManaged, setIsManaged] = useState(initialIsManaged);
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // SHTESË PËR TË ZGJIDHUR PROBLEMIN:
  // Detyron butonat të marrin vlerën e saktë (OFF) nga databaza pas krijimit
  useEffect(() => {
    setIsPublished(initialIsPublished);
    setIsManaged(initialIsManaged);
  }, [initialIsPublished, initialIsManaged]);

  const handleTogglePublished = async () => {
    const newState = !isPublished;
    setIsPublished(newState); 
    
    try {
      const res = await toggleHallPublication(hallId, newState);
      
      if (!res.success) {
        setIsPublished(!newState); 
        
        if (res.error === "INCOMPLETE_PROFILE") {
          setShowIncompleteModal(true); 
        } else {
          alert("Gabim gjatë përditësimit të publikimit!");
        }
      } else {
        router.refresh(); // Përditëson të dhënat pas ndryshimit
        if (newState === true) {
          router.push(`/${locale}/biznes/listing/${hallId}`);
        }
      }
    } catch (error) {
      console.warn("Kërkesa e publikimit u ndërpre nga navigimi i shpejtë:", error);
    }
  };

  const handleToggleManaged = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newState = !isManaged;
    
    setIsManaged(newState); 

    try {
      const res = await toggleHallManagement(hallId, businessId, newState);
      
      if (!res.success) {
        setIsManaged(!newState); 
        
        if (res.error === "LIMIT_REACHED") {
          setShowLimitModal(true); 
        } else {
          alert("Gabim: " + res.error);
        }
      } else {
        router.refresh(); // Përditëson të dhënat pas ndryshimit
      }
    } catch (error) {
      console.warn("Kërkesa e menaxhimit u ndërpre nga navigimi i shpejtë:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className={isManaged ? "text-emerald-500" : "text-gray-400"} />
            <span className="text-sm font-bold text-gray-700">Vetëm për Rezërvime</span>
          </div>
          <button 
            onClick={handleToggleManaged}
            disabled={isLoading}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isManaged ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isManaged ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex flex-col gap-3 py-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className={isPublished ? "text-blue-500" : "text-gray-400"} />
            <span className="text-sm font-bold text-gray-700">Listimi Publik (në platform)</span>
          </div>
          <button 
            onClick={handleTogglePublished}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${isPublished ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Limiti i Pakos u Arrit</h3>
              <p className="text-sm text-gray-500 mb-6">
                Pakoja juaj aktuale nuk lejon menaxhimin e sallave të tjera. Për të zhbllokuar kalendarin dhe rezervimet për këtë sallë, ju lutem bëni ndryshoni Pakon e Abonimit.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowLimitModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  Kuptova
                </button>
                <a href="/biznes/abonimi" className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-center">
                  Shiko Pakot
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIncompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-[400px] w-full rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 relative p-8">
            <div className="absolute -top-10 -right-10 text-indigo-50 opacity-60 rotate-12 pointer-events-none">
              <FileText size={180} strokeWidth={1} />
            </div>
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Salla nuk është gati!
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
                Për ta bërë këtë sallë publike, duhet të plotësoni përshkrimin dhe foton kryesore. Ju ftojmë t'i plotësoni ato tani.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const currentLocale = window.location.pathname.split('/')[1] || "sq";
                    if (!hallId) {
                      alert("Gabim: ID e sallës mungon!");
                      return;
                    }
                    window.location.href = `/${currentLocale}/biznes/listing/${hallId}`;
                  }} 
                  className="w-full bg-[#111827] hover:bg-black text-white font-bold py-4 px-4 rounded-[1rem] flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                  Plotëso të dhënat
                </button>
                <button 
                  onClick={() => setShowIncompleteModal(false)} 
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 px-4 rounded-[1rem] transition-colors"
                >
                  Anulo dhe kthehu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}