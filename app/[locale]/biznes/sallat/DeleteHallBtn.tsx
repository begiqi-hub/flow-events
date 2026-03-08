"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteHallAction } from "./actions";

export default function DeleteHallBtn({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteHallAction(id);
    
    if (res.error) {
      setToast({ show: true, message: res.error, type: "error" });
      setIsDeleting(false);
      setShowConfirm(false);
    }
    // Nëse ka sukses, faqja rifreskohet vetë nga actions.ts
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)} 
        className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-colors"
        title="Fshi Sallën"
      >
        <Trash2 size={18} />
      </button>

      {/* POPUP PËR KONFIRMIMIN E FSHIRJES */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-6 w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">A jeni i sigurt?</h3>
            <p className="text-gray-500 text-sm mb-8">
              Kjo sallë do të fshihet përgjithmonë. Ky veprim nuk mund të kthehet mbrapsht!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                disabled={isDeleting} 
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Anulo
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="flex-1 bg-[#FF5C39] text-white font-bold py-3 px-4 rounded-2xl hover:bg-[#e84e2d] transition-colors flex justify-center items-center"
              >
                {isDeleting ? "Po fshihet..." : "Po, Fshije"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP PËR GABIM (Nëse salla është e lidhur me rezervime) */}
      {toast.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Kujdes!</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="w-full bg-[#FF5C39] hover:bg-[#e84e2d] text-white font-bold py-4 px-6 rounded-2xl shadow-lg"
            >
              Mbyll
            </button>
          </div>
        </div>
      )}
    </>
  );
}