"use client";

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 flex items-center gap-2"
    >
      <Printer size={16} /> Printo Raportin
    </button>
  );
}