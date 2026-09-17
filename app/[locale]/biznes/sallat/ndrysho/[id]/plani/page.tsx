"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Draggable from "react-draggable";
import { ArrowLeft, Save, PlusCircle, Square, Circle, Trash2, LayoutDashboard, Heart, Map as MapIcon } from "lucide-react";
import { getFloorPlan, saveFloorPlan } from "./actions";

interface TableObj {
  id: string;
  name: string;
  seats: number;
  type: string;
  pos_x: number;
  pos_y: number;
}

export default function FloorPlanEditorPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<TableObj[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await getFloorPlan(id);
      if (res.success && res.layout && res.layout.tables) {
        setTables(res.layout.tables);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  // Shtimi i tavolinës me koordinata të shkallëzuara për të shmangur mbivendosjen
  const handleAddTable = (type: string, defaultSeats: number, prefix: string) => {
    const offset = (tables.length * 25) % 200; // S'lejon të ikin jashtë ekranit
    const newTable: TableObj = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: `${prefix} ${tables.length + 1}`,
      seats: defaultSeats,
      type: type,
      pos_x: 50 + offset, 
      pos_y: 50 + offset,
    };
    setTables([...tables, newTable]);
  };

  // Përditësimi dinamik i koordinatave gjatë lëvizjes (Zgjidh problemin e bllokimit)
  const handleDrag = (tableId: string, data: any) => {
    setTables(prevTables => prevTables.map(t => 
      t.id === tableId ? { ...t, pos_x: data.x, pos_y: data.y } : t
    ));
  };

  const handleRemoveTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveFloorPlan(id, tables);
    if (res.success) {
      alert("Plani u ruajt me sukses!");
      router.push(`/${locale}/biznes/sallat/ndrysho/${id}`);
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  // Komponent Ndihmës për të vizatuar karriget bazuar në llojin e tavolinës
  const renderSeats = (table: TableObj) => {
    if (table.type === 'circle') {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: table.seats }).map((_, i) => {
            const angle = (i * 360) / table.seats;
            return (
              <div 
                key={i} 
                className="absolute w-4 h-4 bg-indigo-50 border-2 border-indigo-300 rounded-full shadow-sm"
                style={{ transform: `rotate(${angle}deg) translateY(-56px)` }}
              />
            );
          })}
        </div>
      );
    }

    if (table.type === 'rectangle') {
      const topSeats = Math.ceil(table.seats / 2);
      const bottomSeats = Math.floor(table.seats / 2);
      return (
        <>
          {/* Karriget Lart */}
          <div className="absolute -top-3.5 left-0 w-full flex justify-evenly px-2 pointer-events-none">
            {Array.from({ length: topSeats }).map((_, i) => (
              <div key={`top-${i}`} className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded-full shadow-sm" />
            ))}
          </div>
          {/* Karriget Poshtë */}
          <div className="absolute -bottom-3.5 left-0 w-full flex justify-evenly px-2 pointer-events-none">
            {Array.from({ length: bottomSeats }).map((_, i) => (
              <div key={`bot-${i}`} className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded-full shadow-sm" />
            ))}
          </div>
        </>
      );
    }

    if (table.type === 'couple') {
      return (
        <div className="absolute -bottom-4 w-full flex justify-center gap-6 pointer-events-none">
          <div className="w-5 h-5 bg-pink-50 border-2 border-pink-400 rounded-full shadow-md" />
          <div className="w-5 h-5 bg-pink-50 border-2 border-pink-400 rounded-full shadow-md" />
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Po ngarkojmë planin e sallës...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 md:p-8 font-sans bg-[#F8F9FA]">
      
      {/* Header i Editorit */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Link href={`/${locale}/biznes/sallat/ndrysho/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Konfigurimi i Planit të Sallës</h1>
          <p className="text-sm text-gray-500 font-medium">Shto, lëviz dhe organizo tavolinat dhe ulëset për këtë sallë.</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-lg disabled:bg-gray-400 disabled:shadow-none"
        >
          <Save size={18} /> {saving ? "Po ruhet..." : "Ruaj Planin"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Paneli i Mjeteve */}
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 overflow-y-auto">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
            <LayoutDashboard size={18} className="text-indigo-600"/> Mjetet e Sallës
          </h3>
          
          <button 
            onClick={() => handleAddTable("circle", 8, "Tavolinë")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm font-bold text-gray-700 group shadow-sm"
          >
            <span className="flex items-center gap-2"><Circle size={18} className="text-gray-400 group-hover:text-indigo-600"/> T. Rrethore (8)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-indigo-600" />
          </button>

          <button 
            onClick={() => handleAddTable("rectangle", 12, "Tavolinë")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm font-bold text-gray-700 group shadow-sm"
          >
            <span className="flex items-center gap-2"><Square size={18} className="text-gray-400 group-hover:text-blue-600"/> T. Kënddrejtë (12)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-blue-600" />
          </button>

          <button 
            onClick={() => handleAddTable("couple", 2, "Çifti")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 transition-all text-sm font-bold text-gray-700 group shadow-sm"
          >
            <span className="flex items-center gap-2"><Heart size={18} className="text-gray-400 group-hover:text-pink-500"/> T. e Çiftit (2)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-pink-500" />
          </button>

          <hr className="border-gray-100 my-2" />
          
          <div className="text-xs text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 leading-relaxed">
            <strong>Këshillë:</strong> Kap dhe tërhiq tavolinat në zonën e bardhë. Çdo karrige (pika) përfaqëson një mysafir fizik.
          </div>
        </div>

        {/* Fusha e Vizatimit (Canvas) */}
        <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-3xl relative overflow-hidden shadow-inner min-h-[500px]">
          {tables.map((table) => (
            <Draggable
              key={table.id}
              position={{ x: table.pos_x, y: table.pos_y }}
              onDrag={(e, data) => handleDrag(table.id, data)}
              bounds="parent"
              cancel=".delete-btn" 
            >
              <div className="absolute cursor-grab active:cursor-grabbing group">
                
                {/* Trupi i Tavolinës - Format e ndryshme */}
                <div className={`relative flex flex-col items-center justify-center shadow-md border-[3px] bg-white z-10 transition-colors ${
                  table.type === 'circle' ? 'w-24 h-24 rounded-full border-indigo-500 hover:bg-indigo-50' : 
                  table.type === 'couple' ? 'w-32 h-16 rounded-t-full rounded-b-xl border-pink-500 bg-pink-50/30 hover:bg-pink-100/50' : 
                  'w-36 h-20 rounded-xl border-blue-500 hover:bg-blue-50'
                }`}>
                  <span className={`font-black text-xs ${table.type === 'couple' ? 'text-pink-600' : 'text-gray-800'}`}>
                    {table.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold bg-white/80 px-2 rounded-full mt-0.5">
                    {table.seats} ulëse
                  </span>
                  
                  {/* Karriget (Vizatohen vizualisht anash) */}
                  {renderSeats(table)}
                </div>

                {/* Butoni Fshi (I mbrojtur nga lëvizja me klasën delete-btn) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveTable(table.id); }}
                  className="delete-btn absolute -top-4 -right-4 bg-white text-red-500 border border-red-200 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-500 hover:text-white z-20 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
                
              </div>
            </Draggable>
          ))}

          {tables.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-medium pointer-events-none select-none">
              <MapIcon size={48} className="mb-4 opacity-20" />
              Salla është bosh. Shto tavolina nga mjetet anësore.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}