"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Draggable from "react-draggable";
import { ArrowLeft, Save, PlusCircle, Square, Circle, Trash2, LayoutDashboard, Heart, Download, RotateCw, Type, Users } from "lucide-react";
import { getFloorPlan, saveFloorPlan } from "./actions";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface TableObj {
  id: string;
  name: string;
  seats: number;
  type: string;
  pos_x: number;
  pos_y: number;
  rotation?: number; // E shtuar për UI, kërkon migrim në DB për t'u ruajtur përgjithmonë
}

export default function FloorPlanEditorPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<TableObj[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // State për mini-formularin e shtimit manual
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempSeats, setTempSeats] = useState<number>(8);

  useEffect(() => {
    async function loadData() {
      const res = await getFloorPlan(id);
      if (res.success && res.layout && res.layout.tables) {
        // Shtojmë rotation: 0 si default nëse vjen nga DB pa të
        const loadedTables = res.layout.tables.map((t: any) => ({ ...t, rotation: 0 }));
        setTables(loadedTables);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleAddTableSubmit = () => {
    if (!activeForm || !tempName || tempSeats < 1) return;

    const offset = (tables.length * 30) % 200;
    const newTable: TableObj = {
      id: `temp-${Date.now()}`,
      name: tempName,
      seats: tempSeats,
      type: activeForm,
      pos_x: 50 + offset, 
      pos_y: 50 + offset,
      rotation: 0
    };
    
    setTables([...tables, newTable]);
    setActiveForm(null); // Mbyll formularin pas shtimit
    setTempName("");
  };

  const handleDragStop = (tableId: string, data: any) => {
    setTables(prevTables => prevTables.map(t => 
      t.id === tableId ? { ...t, pos_x: data.x, pos_y: data.y } : t
    ));
  };

  const handleRotate = (tableId: string) => {
    setTables(prevTables => prevTables.map(t => 
      t.id === tableId ? { ...t, rotation: ((t.rotation || 0) + 45) % 360 } : t
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

  const exportPlan = async (format: 'png' | 'pdf') => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { quality: 1.0, backgroundColor: '#ffffff' });
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `plani-salles-${id}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`plani-salles-${id}.pdf`);
      }
    } catch (err) {
      console.error("Gabim gjatë eksportimit:", err);
      alert("Eksportimi dështoi.");
    }
  };

  const renderSeats = (table: TableObj) => {
    const seatNodes = [];
    const seatClass = "absolute w-3.5 h-3.5 bg-white border border-gray-400 rounded-full shadow-sm";

    if (table.type === 'circle') {
      const radius = 48; // Distanca e karrigeve nga qendra
      for (let i = 0; i < table.seats; i++) {
        const angle = (i * 360) / table.seats;
        const rad = (angle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = -Math.cos(rad) * radius;
        seatNodes.push(
          <div key={i} className={seatClass} style={{ transform: `translate(${x}px, ${y}px)` }} />
        );
      }
      return <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{seatNodes}</div>;
    }

    if (table.type === 'rectangle' || table.type === 'square' || table.type === 'ellipse') {
      const topSeats = Math.ceil(table.seats / 2);
      const bottomSeats = Math.floor(table.seats / 2);
      return (
        <>
          <div className="absolute -top-2.5 left-0 w-full flex justify-evenly px-1 pointer-events-none">
            {Array.from({ length: topSeats }).map((_, i) => <div key={`t-${i}`} className={seatClass} />)}
          </div>
          <div className="absolute -bottom-2.5 left-0 w-full flex justify-evenly px-1 pointer-events-none">
            {Array.from({ length: bottomSeats }).map((_, i) => <div key={`b-${i}`} className={seatClass} />)}
          </div>
        </>
      );
    }

    if (table.type === 'couple') {
      return (
        <div className="absolute -bottom-2 w-full flex justify-center gap-4 pointer-events-none">
          {Array.from({ length: table.seats }).map((_, i) => (
             <div key={i} className="w-4 h-4 bg-white border border-pink-400 rounded-full shadow-sm" />
          ))}
        </div>
      );
    }
    return null;
  };

  // Komponent për butonat e mjeteve anësore
  const ToolButton = ({ type, icon: Icon, label }: { type: string, icon: any, label: string }) => (
    <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-2">
      <button 
        onClick={() => { setActiveForm(activeForm === type ? null : type); setTempName(""); setTempSeats(type === 'couple' ? 2 : 8); }}
        className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
      >
        <span className="flex items-center gap-2"><Icon size={18} className="text-gray-400"/> {label}</span>
        <PlusCircle size={18} className="text-gray-400" />
      </button>

      {/* Forma Manuale shfaqet kur klikohet butoni */}
      {activeForm === type && (
        <div className="flex flex-col gap-2 mt-2 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
            <Type size={14} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Emri (p.sh. T1)" 
              className="w-full bg-transparent outline-none text-xs font-bold text-gray-800"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
            <Users size={14} className="text-gray-400" />
            <input 
              type="number" 
              placeholder="Nr. Ulëseve" 
              className="w-full bg-transparent outline-none text-xs font-bold text-gray-800"
              value={tempSeats}
              onChange={(e) => setTempSeats(Number(e.target.value))}
              min={1}
            />
          </div>
          <button 
            onClick={handleAddTableSubmit}
            className="w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-700 mt-1"
          >
            Shto në Plan
          </button>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Po ngarkojmë planin e sallës...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 md:p-8 font-sans bg-[#F8F9FA]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Link href={`/${locale}/biznes/sallat/ndrysho/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Konfigurimi i Planit të Sallës</h1>
          <p className="text-sm text-gray-500 font-medium">Shto, lëviz dhe organizo tavolinat dhe ulëset për këtë sallë.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => exportPlan('png')} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Download size={16} /> PNG
          </button>
          <button onClick={() => exportPlan('pdf')} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Download size={16} /> PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-md disabled:bg-gray-400">
            <Save size={16} /> {saving ? "Po ruhet..." : "Ruaj Planin"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Paneli i Mjeteve */}
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-2 overflow-y-auto">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <LayoutDashboard size={18} className="text-indigo-600"/> Mjetet e Sallës
          </h3>
          
          <ToolButton type="circle" icon={Circle} label="Tavolinë Rrethore" />
          <ToolButton type="rectangle" icon={Square} label="T. Kënddrejtë" />
          <ToolButton type="square" icon={Square} label="Tavolinë Katrore" />
          <ToolButton type="ellipse" icon={Circle} label="Tavolinë Elips" />
          <ToolButton type="couple" icon={Heart} label="Tavolinë e Çiftit" />

          <hr className="border-gray-100 my-2" />
          
          <div className="text-xs text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 leading-relaxed">
            <strong>Këshillë:</strong> Plotësoni emrin dhe numrin e ulëseve para se të shtoni tavolinën. Përdorni ikonën e rrotullimit për t'i kthyer ato.
          </div>
        </div>

        {/* Fusha e Vizatimit (Canvas) */}
        <div 
          ref={canvasRef} 
          id="canvas-board"
          className="flex-1 bg-[#fbfcfd] border-2 border-dashed border-gray-300 rounded-3xl relative overflow-hidden shadow-inner min-h-[500px]"
          style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {tables.map((table) => (
            <Draggable
              key={table.id}
              defaultPosition={{ x: table.pos_x, y: table.pos_y }}
              onStop={(e, data) => handleDragStop(table.id, data)}
              bounds="parent"
              cancel=".no-drag" 
            >
              <div className="absolute cursor-grab active:cursor-grabbing group">
                
                {/* Trupi i Tavolinës */}
                <div 
                  className={`relative flex flex-col items-center justify-center shadow-md bg-white border-[3px] z-10 transition-transform duration-200 ${
                    table.type === 'circle' ? 'w-20 h-20 rounded-full border-gray-300' : 
                    table.type === 'square' ? 'w-20 h-20 rounded-xl border-gray-300' : 
                    table.type === 'rectangle' ? 'w-28 h-16 rounded-xl border-gray-300' : 
                    table.type === 'ellipse' ? 'w-28 h-16 rounded-[50%] border-gray-300' : 
                    'w-32 h-16 rounded-t-full rounded-b-xl border-pink-400 bg-pink-50'
                  }`}
                  style={{ transform: `rotate(${table.rotation || 0}deg)` }}
                >
                  <span className={`font-black text-xs px-1 text-center ${table.type === 'couple' ? 'text-pink-600' : 'text-gray-700'}`}>
                    {table.name}
                  </span>
                  {/* Nuk e shfaqim totalin e ulëseve në tekst për t'u dukur më reale, ulëset janë pikat jashtë */}
                  
                  {renderSeats(table)}
                </div>

                {/* Butonat UI të Editorit (Fshi / Rrotullo) */}
                <div className="no-drag absolute -top-8 -right-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRotate(table.id); }}
                    className="bg-white text-gray-600 border border-gray-200 rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer"
                    title="Rrotullo 45 gradë"
                  >
                    <RotateCw size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveTable(table.id); }}
                    className="bg-white text-red-500 border border-red-200 rounded-full p-2 shadow-md hover:bg-red-500 hover:text-white cursor-pointer"
                    title="Fshi Tavolinën"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
              </div>
            </Draggable>
          ))}

          {tables.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-medium pointer-events-none select-none">
              Zgjidhni mjetet majtas për të konfiguruar sallën.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}