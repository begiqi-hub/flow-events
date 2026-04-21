"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl"; 

type StaffMember = {
  id: string;
  name: string;
};

export default function StaffSelect({ staffList }: { staffList: StaffMember[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("StaffPerformance"); 
  
  const currentStaffId = searchParams.get("staffId") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("staffId", e.target.value);
    } else {
      params.delete("staffId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-lg">
      <div className="bg-blue-50 p-3 rounded-xl">
        <Users className="text-blue-600" size={24} />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {t("selectStaff")}
        </label>
        {/* RREGULLIMI: text-gray-900 që të lexohet emri i zgjedhur qartë */}
        <select
          value={currentStaffId}
          onChange={handleChange}
          className="w-full bg-transparent text-gray-900 font-bold text-lg focus:outline-none cursor-pointer"
        >
          <option value="" className="text-gray-500">{t("selectPlaceholder")}</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id} className="text-gray-900 font-medium">
              {staff.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}