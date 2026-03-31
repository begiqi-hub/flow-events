"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteExtraAction } from "./actions";
import { useTranslations } from "next-intl";

export default function DeleteExtraBtn({ id }: { id: string }) {
  const t = useTranslations("DeleteExtraBtn");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteExtraAction(id);
    if (res?.error) {
      setErrorMsg(res.error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
        title={t("deleteTooltip")}
      >
        <Trash2 size={18} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} className="text-red-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("confirmTitle")}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {errorMsg || t("confirmDesc")}
            </p>

            {errorMsg ? (
              <button onClick={() => {setShowConfirm(false); setErrorMsg("");}} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl">
                {t("closeBtn")}
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors">
                  {t("cancelBtn")}
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                  {isDeleting ? t("deletingBtn") : t("yesDeleteBtn")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}