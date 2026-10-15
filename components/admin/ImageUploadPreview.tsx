"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

export default function ImageUploadPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
        Ngarko Imazhin e Bannerit <span className="text-red-500">*</span>
      </label>

      <div className="relative w-full h-48 border-2 border-indigo-200 border-dashed rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors overflow-hidden group">
        {/* Input-i është transparent dhe mbulon gjithë hapësirën */}
        <input 
          ref={inputRef}
          type="file" 
          name="imageFile" 
          accept="image/*" 
          required={!preview} // Është i detyrueshëm vetëm nëse s'ka imazh
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleFileChange} 
        />
        
        {!preview ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud size={24} className="text-indigo-500" />
            </div>
            <p className="text-sm text-gray-700 font-semibold mb-1">
              <span className="text-indigo-600">Kliko për të ngarkuar</span> ose tërhiq skedarin këtu
            </p>
            <p className="text-xs text-gray-500">Rekomandim: 1440x400px (Max: 5MB)</p>
          </div>
        ) : (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button 
              onClick={clearPreview} 
              className="absolute top-3 right-3 bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition shadow-lg z-20"
              title="Hiq Imazhin"
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}