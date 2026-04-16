"use client";

import { useState, useEffect } from "react";

export default function CookieBanner({ 
  title, text, customizeBtn, rejectBtn, acceptBtn 
}: { 
  title: string, text: string, customizeBtn: string, rejectBtn: string, acceptBtn: string 
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:w-[450px] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] p-6 animate-in slide-in-from-bottom-8 duration-500">
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {text}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button 
          onClick={() => {}} // Këtu mund të hapet një modal tjetër në të ardhmen
          className="w-full sm:w-1/3 py-2.5 px-4 rounded-lg border-2 border-gray-200 text-[#2563eb] font-bold hover:bg-gray-50 transition-colors text-sm text-center"
        >
          {customizeBtn}
        </button>
        <button 
          onClick={handleReject}
          className="w-full sm:w-1/3 py-2.5 px-4 rounded-lg border-2 border-gray-200 text-[#2563eb] font-bold hover:bg-gray-50 transition-colors text-sm text-center"
        >
          {rejectBtn}
        </button>
        <button 
          onClick={handleAccept}
          className="w-full sm:w-1/3 py-2.5 px-4 rounded-lg bg-[#2563eb] border-2 border-[#2563eb] text-white font-bold hover:bg-blue-700 transition-colors text-sm text-center"
        >
          {acceptBtn}
        </button>
      </div>
    </div>
  );
}