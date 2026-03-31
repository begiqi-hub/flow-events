"use client";

import Link from "next/link";
import { AlertOctagon, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-500">
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <AlertOctagon size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-7xl font-black tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Faqja nuk u gjet</h2>
        
        <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">
          Mesa duket faqja që po kërkoni nuk ekziston, është fshirë, ose keni shkruar linkun gabim.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all shadow-sm"
          >
            <ArrowLeft size={18} /> Kthehu
          </button>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition-all shadow-md"
          >
            <Home size={18} /> Paneli
          </Link>
        </div>

      </div>
      
      <div className="mt-12 text-center text-sm font-medium text-gray-400">
        &copy; {new Date().getFullYear()} Flow Events. Të gjitha të drejtat e rezervuara.
      </div>

    </div>
  );
}