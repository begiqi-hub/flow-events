"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Draggable from "react-draggable";
import { ArrowLeft, Save, PlusCircle, Square, Circle, Trash2, LayoutDashboard } from "lucide-react";
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

  // Shton një tavolinë të re në qendër të fushës (0,0)
  const handleAddTable = (type: string, defaultSeats: number, prefix: string) => {
    const newTable: TableObj = {
      id: `temp-${Date.now()}`,
      name: `${prefix} ${tables.length + 1}`,
      seats: defaultSeats,
      type: type,
      pos_x: 50, // Pozicionimi fillestar
      pos_y: 50,
    };
    setTables([...tables, newTable]);
  };

  // Përditëson koordinatat kur lëshohet tavolina (Stop drag)
  const handleDragStop = (tableId: string, data: any) => {
    setTables(tables.map(t => 
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

  if (loading) return <div className="p-8 text-center text-gray-500">Po ngarkojmë planin...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 md:p-8 font-sans bg-[#F8F9FA]">
      
      {/* Header i Editorit */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Link href={`/${locale}/biznes/sallat/ndrysho/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Konfigurimi i Planit të Sallës</h1>
          <p className="text-sm text-gray-500 font-medium">Shto, lëviz dhe organizo tavolinat për këtë sallë.</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-md disabled:bg-gray-400"
        >
          <Save size={18} /> {saving ? "Po ruhet..." : "Ruaj Planin"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Paneli i Mjeteve (Sidebar) */}
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 overflow-y-auto">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
            <LayoutDashboard size={18} className="text-indigo-600"/> Mjetet e Sallës
          </h3>
          
          <button 
            onClick={() => handleAddTable("circle", 8, "Tavolinë")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm font-bold text-gray-700 group"
          >
            <span className="flex items-center gap-2"><Circle size={18} className="text-gray-400 group-hover:text-indigo-600"/> T. Rrethore (8)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-indigo-600" />
          </button>

          <button 
            onClick={() => handleAddTable("rectangle", 12, "Tavolinë")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm font-bold text-gray-700 group"
          >
            <span className="flex items-center gap-2"><Square size={18} className="text-gray-400 group-hover:text-indigo-600"/> T. Kënddrejtë (12)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-indigo-600" />
          </button>

          <button 
            onClick={() => handleAddTable("couple", 2, "Tavolinë Çifti")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 transition-all text-sm font-bold text-gray-700 group"
          >
            <span className="flex items-center gap-2"><Square size={18} className="text-gray-400 group-hover:text-pink-600"/> T. e Çiftit (2)</span>
            <PlusCircle size={18} className="text-gray-400 group-hover:text-pink-600" />
          </button>

          <hr className="border-gray-100 my-2" />
          
          <div className="text-xs text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <strong>Këshillë:</strong> Kap dhe tërhiq (drag) tavolinat në zonën e bardhë për t'i pozicionuar.
          </div>
        </div>

        {/* Fusha e Vizatimit (Canvas) */}
        <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-3xl relative overflow-hidden shadow-inner min-h-[500px]">
          {tables.map((table) => (
            <Draggable
              key={table.id}
              defaultPosition={{ x: table.pos_x, y: table.pos_y }}
              onStop={(e, data) => handleDragStop(table.id, data)}
              bounds="parent" // Nuk lejon të dalin jashtë kornizës
            >
              {/* Elementi i Tavolinës */}
              <div className={`absolute cursor-move flex flex-col items-center justify-center shadow-md border-2 bg-white group ${
                table.type === 'circle' ? 'w-24 h-24 rounded-full border-indigo-400' : 
                table.type === 'couple' ? 'w-32 h-16 rounded-xl border-pink-400' : 
                'w-32 h-20 rounded-xl border-blue-400'
              }`}>
                <span className="font-bold text-xs text-gray-800">{table.name}</span>
                <span className="text-[10px] text-gray-500 font-medium">{table.seats} ulëse</span>
                
                {/* Butoni Fshi (Shfaqet vetëm kur bën hover) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveTable(table.id); }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </Draggable>
          ))}

          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium pointer-events-none">
              Fusha është bosh. Shto tavolina nga mjetet anësore.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}