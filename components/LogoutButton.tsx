"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors font-medium text-sm"
    >
      <LogOut size={18} />
      Dil nga sistemi
    </button>
  );
}