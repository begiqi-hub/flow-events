"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Draggable from "react-draggable";
import { ArrowLeft, Save, PlusCircle, Square, Circle, Trash2, LayoutDashboard, Heart, Download, RotateCw, Edit3, X, Check, Minimize } from "lucide-react";
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
  rotation?: number;
}

export default function FloorPlanEditorPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<TableObj[]>([]);
  // State për të dhënat e sallës
  const [hallInfo, setHallInfo] = useState({ name: "Salla", capacity: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState<number>(8);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // State për përshtatjen automatike të hapësirës
  const [autoFit, setAutoFit] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getFloorPlan(id);
      if (res.success) {
        if (res.layout && res.layout.tables) {
          const loadedTables = res.layout.tables.map((t: any) => ({ ...t, rotation: t.rotation || 0 }));
          setTables(loadedTables);
        }
        if (res.hall) {
          setHallInfo({ name: res.hall.name, capacity: res.hall.capacity });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleAddTable = (type: string, defaultSeats: number, defaultName: string) => {
    const offset = (tables.length * 25) % 300;
    const newTable: TableObj = {
      id: `temp-${Date.now()}`,
      name: `${defaultName} ${tables.length + 1}`,
      seats: defaultSeats,
      type: type,
      pos_x: 80 + offset, 
      pos_y: 120 + offset, // I nisim pak më poshtë që mos mbulojnë emrin e sallës
      rotation: 0
    };
    setTables([...tables, newTable]);
    setAutoFit(false); // Fikim auto-fit kur shtojmë tavolina të reja
  };

  const handleMouseDown = (e: React.MouseEvent, table: TableObj) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    
    setDraggingId(table.id);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      setDragOffset({
        x: e.clientX - canvasRect.left - table.pos_x,
        y: e.clientY - canvasRect.top - table.pos_y
      });
    }
    setSelectedTableId(table.id);
    setEditName(table.name);
    setEditSeats(table.seats);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    let newX = e.clientX - canvasRect.left - dragOffset.x;
    let newY = e.clientY - canvasRect.top - dragOffset.y;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;

    setTables(prev => prev.map(t => t.id === draggingId ? { ...t, pos_x: newX, pos_y: newY } : t));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleUpdateTableDetails = () => {
    if (!selectedTableId) return;
    setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, name: editName, seats: Number(editSeats) } : t));
    setSelectedTableId(null);
  };

  const handleRotate = (tableId: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, rotation: ((t.rotation || 0) + 45) % 360 } : t));
  };

  const handleRemoveTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
    if (selectedTableId === tableId) setSelectedTableId(null);
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

  // Funksioni që llogarit hapsirën minimale të nevojshme për tavolinat
  const getCanvasBounds = () => {
    if (tables.length === 0) {
      return { width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' };
    }
    
    // Gjejmë tavolinën më të largët dhe i shtojmë 180px padding që të mos priten karriget
    const maxX = Math.max(...tables.map(t => t.pos_x)) + 180;
    const maxY = Math.max(...tables.map(t => t.pos_y)) + 180;
    
    if (autoFit) {
      return {
        width: `${maxX}px`,
        height: `${maxY}px`,
        minWidth: 'auto', // Lejon fushën të tkurret në madhësinë e saktë
        minHeight: 'auto'
      };
    }
    
    return {
      width: '100%',
      height: '100%',
      minWidth: '100%',
      minHeight: '100%'
    };
  };

  const exportPlan = async (format: 'png' | 'pdf') => {
    if (!canvasRef.current) return;
    
    // Aktivizojmë Auto-Fit përpara eksportit për ta prerë zbrazëtinë
    setAutoFit(true);
    
    // Presim pak që UI të përditësojë madhësinë
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(canvasRef.current!, { quality: 1.0, backgroundColor: '#ffffff' });
        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `plani-${hallInfo.name.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.href = dataUrl;
          link.click();
        } else {
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`plani-${hallInfo.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        }
      } catch (err) {
        console.error("Gabim gjatë eksportimit:", err);
        alert("Eksportimi dështoi.");
      }
    }, 300);
  };

  const renderSeats = (table: TableObj) => {
    const seatNodesTop = [];
    const seatNodesBottom = [];
    const seatClass = "absolute w-3.5 h-3.5 bg-white border-[1.5px] border-gray-300 rounded-full shadow-sm pointer-events-none";

    if (table.type === 'circle') {
      const radius = 50; 
      const circleSeats = [];
      for (let i = 0; i < table.seats; i++) {
        const angle = (i * 360) / table.seats;
        const rad = (angle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = -Math.cos(rad) * radius;
        circleSeats.push(
          <div key={i} className="absolute w-3.5 h-3.5 bg-white border-[1.5px] border-gray-300 rounded-full shadow-sm pointer-events-none" style={{ top: `calc(50% + ${y}px - 7px)`, left: `calc(50% + ${x}px - 7px)` }} />
        );
      }
      return <div className="absolute inset-0 pointer-events-none">{circleSeats}</div>;
    }

    if (table.type === 'rectangle' || table.type === 'square' || table.type === 'ellipse') {
      const topCount = Math.ceil(table.seats / 2);
      const bottomCount = Math.floor(table.seats / 2);
      for (let i = 0; i < topCount; i++) {
        const leftPercent = topCount === 1 ? 50 : (i * (100 / (topCount - 1)));
        seatNodesTop.push(<div key={`top-${i}`} className={seatClass} style={{ left: `${leftPercent}%`, top: '-18px', transform: 'translateX(-50%)' }} />);
      }
      for (let i = 0; i < bottomCount; i++) {
        const leftPercent = bottomCount === 1 ? 50 : (i * (100 / (bottomCount - 1)));
        seatNodesBottom.push(<div key={`bot-${i}`} className={seatClass} style={{ left: `${leftPercent}%`, bottom: '-18px', transform: 'translateX(-50%)' }} />);
      }
      return (
        <>
          <div className="absolute inset-0 pointer-events-none">{seatNodesTop}</div>
          <div className="absolute inset-0 pointer-events-none">{seatNodesBottom}</div>
        </>
      );
    }

    if (table.type === 'couple') {
      return (
        <div className="absolute -bottom-5 w-full flex justify-center gap-4 pointer-events-none">
          {Array.from({ length: 2 }).map((_, i) => (
             <div key={i} className="w-4 h-4 bg-white border-[1.5px] border-pink-400 rounded-full shadow-sm" />
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Po ngarkojmë planin e sallës...</div>;
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const canvasBounds = getCanvasBounds();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 md:p-8 font-sans bg-[#F8F9FA]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Link href={`/${locale}/biznes/sallat/ndrysho/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Kthehu
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Konfigurimi i Planit të Sallës</h1>
          <p className="text-sm text-gray-500 font-medium">Kliko mbi tavolinë për ta ndryshuar, ose tërhiqe për ta lëvizur.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setAutoFit(!autoFit)} className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm shadow-sm border ${autoFit ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <Minimize size={16} /> {autoFit ? "Zgjero Pamjen" : "Përshtat Hapësirën"}
          </button>
          <button onClick={() => exportPlan('png')} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm shadow-sm">
            <Download size={16} /> PNG
          </button>
          <button onClick={() => exportPlan('pdf')} className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm shadow-sm">
            <Download size={16} /> PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1e293b] shadow-md disabled:bg-gray-400">
            <Save size={16} /> {saving ? "Po ruhet..." : "Ruaj Planin"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4 overflow-y-auto">
          {selectedTable ? (
            <div className="flex flex-col gap-3 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                  <Edit3 size={16} /> Modifiko
                </h4>
                <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-600">Emri i Tavolinës</label>
                <input type="text" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 ring-indigo-500/20" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-600">Numri i Ulëseve</label>
                <input type="number" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 ring-indigo-500/20" value={editSeats} onChange={(e) => setEditSeats(Number(e.target.value))} min={1} />
              </div>

              <button onClick={handleUpdateTableDetails} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 mt-2 flex items-center justify-center gap-1.5 shadow-md">
                <Check size={14} /> Përditëso
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <LayoutDashboard size={18} className="text-indigo-600"/> Shto Tavolina
              </h3>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button onClick={() => handleAddTable("circle", 8, "Tavolinë")} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><Circle size={16} className="text-indigo-400"/> T. Rrethore</span>
                  <PlusCircle size={16} className="text-gray-300" />
                </button>
                <button onClick={() => handleAddTable("rectangle", 12, "Tavolinë")} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><Square size={16} className="text-blue-400"/> T. Kënddrejtë</span>
                  <PlusCircle size={16} className="text-gray-300" />
                </button>
                <button onClick={() => handleAddTable("square", 8, "Tavolinë")} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><Square size={16} className="text-emerald-400"/> T. Katrore</span>
                  <PlusCircle size={16} className="text-gray-300" />
                </button>
                <button onClick={() => handleAddTable("ellipse", 10, "Tavolinë")} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><Circle size={16} className="text-purple-400"/> T. Elips</span>
                  <PlusCircle size={16} className="text-gray-300" />
                </button>
                <button onClick={() => handleAddTable("couple", 2, "Çifti")} className="flex items-center justify-between p-3.5 rounded-2xl border border-pink-100 bg-pink-50 hover:bg-pink-100 hover:shadow-md transition-all text-xs font-bold text-pink-700">
                  <span className="flex items-center gap-2"><Heart size={16} className="text-pink-500"/> Tavolinë e Çiftit</span>
                  <PlusCircle size={16} className="text-pink-400" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* FUSHA E VIZATIMIT - E MBËSHTJELLUR PËR AUTO-FIT */}
        <div className="flex-1 bg-gray-100/50 rounded-3xl overflow-auto border border-gray-200 shadow-inner relative">
          <div 
            ref={canvasRef} 
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative bg-white transition-all duration-300 ease-in-out select-none"
            style={{ 
              width: canvasBounds.width, 
              height: canvasBounds.height,
              minWidth: canvasBounds.minWidth,   // Kjo rresht u ndryshua
              minHeight: canvasBounds.minHeight, // Kjo rresht u ndryshua
              backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)', 
              backgroundSize: '24px 24px' 
            }}
          >
            {/* INFORMATAT E SALLËS - WATERMARK */}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-gray-100 z-0 pointer-events-none">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{hallInfo.name}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Kapaciteti: <span className="text-indigo-600">{hallInfo.capacity} ulëse</span></p>
            </div>

            {tables.map((table) => {
              const isSelected = selectedTableId === table.id;
              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => handleMouseDown(e, table)}
                  className="absolute cursor-grab active:cursor-grabbing group"
                  style={{ left: `${table.pos_x}px`, top: `${table.pos_y}px` }}
                >
                  <div 
                    className={`relative flex flex-col items-center justify-center shadow-lg bg-gradient-to-b from-white to-gray-50 border-[2px] z-10 transition-all ${
                      isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-gray-300 hover:border-gray-400'
                    } ${
                      table.type === 'circle' ? 'w-20 h-20 rounded-full' : 
                      table.type === 'square' ? 'w-20 h-20 rounded-2xl' : 
                      table.type === 'rectangle' ? 'w-28 h-16 rounded-2xl' : 
                      table.type === 'ellipse' ? 'w-28 h-16 rounded-[50%]' : 
                      'w-32 h-16 rounded-t-full rounded-b-xl border-pink-300 bg-gradient-to-b from-pink-50 to-pink-100'
                    }`}
                    style={{ transform: `rotate(${table.rotation || 0}deg)` }}
                  >
                    <span className={`font-black text-[11px] px-1 text-center ${table.type === 'couple' ? 'text-pink-600' : 'text-gray-700'}`}>
                      {table.name}
                    </span>
                    {renderSeats(table)}
                  </div>

                  <div className="absolute -top-8 -right-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-25">
                    <button onClick={(e) => { e.stopPropagation(); handleRotate(table.id); }} className="bg-white text-gray-600 border border-gray-200 rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer">
                      <RotateCw size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveTable(table.id); }} className="bg-white text-red-500 border border-red-200 rounded-full p-2 shadow-md hover:bg-red-500 hover:text-white cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}