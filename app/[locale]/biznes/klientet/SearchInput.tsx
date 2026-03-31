"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ruajmë vlerën që po shkruan përdoruesi
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search")?.toString() || "");

  // Ky funksion pret 300 milisekonda pasi përdoruesi ndalon së shkruari
  // përpara se të kërkojë, në mënyrë që të mos bllokojmë databazën për çdo shkronjë
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      // Përditësojmë URL-në automatikisht, gjë që rifreskon listën e klientëve
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative mb-6 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Kërko klient sipas emrit, numrit ose emailit..."
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors"
      />
    </div>
  );
}