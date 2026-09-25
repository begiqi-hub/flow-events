"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function HallGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Bllokon scroll-in e faqes kur galeria është e hapur
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedIndex]);

  if (!images || images.length === 0) return null;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ImageIcon className="w-6 h-6 text-indigo-500" /> Galeria
      </h3>
      
      {/* Rrjeti i fotove (Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedIndex(idx)}
            className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-pointer group"
          >
            <img 
              src={img} 
              alt={`Foto ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        ))}
      </div>

      {/* Dritarja Modale (Lightbox) */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
        >
          <button 
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-lg transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-lg transition-colors z-50"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-lg transition-colors z-50"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={images[selectedIndex]} 
              alt="E zmadhuar" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium text-sm tracking-widest bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}