"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, FileBarChart } from 'lucide-react';

interface AdActionsDropdownProps {
  adId: string;
  locale: string;
}

export default function AdActionsDropdown({ adId, locale }: AdActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mbyll dropdown-in nëse klikohet jashtë tij
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            <Link
              href={`/${locale}/superadmin/advertisements/${adId}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Edit size={16} /> Ndrysho
            </Link>
            <Link
                href={`/${locale}/superadmin/advertisements/${adId}/report`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            >
              <FileBarChart size={16} /> Raporti
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}