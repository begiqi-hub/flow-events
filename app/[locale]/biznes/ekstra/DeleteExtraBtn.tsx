"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteExtraAction } from "./actions";

export default function DeleteExtraBtn({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("A jeni i sigurt që dëshironi ta fshini këtë shërbim ekstra?");
    
    if (confirmed) {
      setIsDeleting(true);
      const res = await deleteExtraAction(id);
      
      if (res.error) {
        alert(res.error);
        setIsDeleting(false);
      }
      // Nëse ka sukses, faqja rifreskohet automatikisht nga actions.ts
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
        isDeleting 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
        : "bg-red-50 hover:bg-red-500 text-red-600 hover:text-white"
      }`}
      title="Fshi"
    >
      <Trash2 size={18} className={isDeleting ? "animate-pulse" : ""} />
    </button>
  );
}