"use client";

import { useState, useEffect, use } from "react";
import { getPublicBookingAction, savePublicDataAction } from "./actions";
import { CalendarDays, Clock, Building2, Save, UserPlus, Trash2, CheckCircle2, PartyPopper, Printer, Map, Plus } from "lucide-react";
import { format } from "date-fns";

export default function PublicBookingPortal({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  
  const [guestList, setGuestList] = useState<Record<string, string[]>>({});
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(false);

  const [snapshot, setSnapshot] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getPublicBookingAction(id);
      if (res.success && res.booking) {
        setBooking(res.booking);
        setGuestList(res.booking.guest_list || {});
        
        let currentSnapshot = res.booking.layout_snapshot || {};
        setSnapshot(currentSnapshot);
        
        // LOGJIKA INTELIGJENTE E EKSTRAKTIMIT TË TAVOLINAVE NGA ÇDO LLOJ STRUKTURE JSON
        let rawTables: any[] = [];
        if (Array.isArray(currentSnapshot)) {
            rawTables = currentSnapshot;
        } else if (typeof currentSnapshot === 'object') {
            if (Array.isArray(currentSnapshot.tables)) rawTables = currentSnapshot.tables;
            else if (Array.isArray(currentSnapshot.objects)) rawTables = currentSnapshot.objects; // Fabric.js
            else if (currentSnapshot.layout_data && Array.isArray(currentSnapshot.layout_data.tables)) rawTables = currentSnapshot.layout_data.tables;
            else if (currentSnapshot.layout_data && Array.isArray(currentSnapshot.layout_data.objects)) rawTables = currentSnapshot.layout_data.objects;
        }

        // Renditja e sigurt Alfanumerike
        const sortedTables = [...rawTables].sort((a: any, b: any) => {
          const nameA = String(a?.name || a?.id || "").trim();
          const nameB = String(b?.name || b?.id || "").trim();
          return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        });

        setTables(sortedTables);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Po ngarkohen detajet e eventit...</div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Rezervimi nuk u gjet ose linku ka skaduar.</div>;

  const formatTableType = (type: string) => {
    const types: Record<string, string> = {
      circle: "Rrethore", rect: "Drejtkëndëshe", square: "Katrore", oval: "Ovale"
    };
    return types[type?.toLowerCase()] || "Shtesë";
  };

  const handleAddGuest = (tableId: string, maxSeats: number) => {
    const name = (tempInputs[tableId] || "").trim();
    if (!name) return;

    const currentGuests = guestList[tableId] || [];
    if (currentGuests.length >= maxSeats) {
      alert("Kjo tavolinë ka arritur numrin maksimal të ulëseve!");
      return;
    }

    setGuestList({ ...guestList, [tableId]: [...currentGuests, name] });
    setTempInputs({ ...tempInputs, [tableId]: "" });
  };

  const handleRemoveGuest = (tableId: string, index: number) => {
    const currentGuests = [...(guestList[tableId] || [])];
    currentGuests.splice(index, 1);
    setGuestList({ ...guestList, [tableId]: currentGuests });
  };

  // Funksioni për Shtimin e Tavolinave nga Klienti
  const handleAddCustomTable = () => {
    if (!newTableName.trim() || !newTableSeats) return;
    const seats = parseInt(newTableSeats);
    if (seats <= 0) return;

    const newTable = {
      id: `custom_${Date.now()}`,
      name: newTableName.trim(),
      seats: seats,
      type: "rect",
      x: 30, // Shfaqet lart-majtas në hartë
      y: 30,
      width: 80,
      height: 60,
      isCustom: true
    };

    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    
    // Përditësojmë snapshotin origjinal me kujdes
    if (Array.isArray(snapshot)) {
      setSnapshot(updatedTables);
    } else {
      setSnapshot({ ...snapshot, tables: updatedTables });
    }
    
    setNewTableName("");
    setNewTableSeats("");
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMsg(false);
    const res = await savePublicDataAction(id, guestList, snapshot);
    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } else {
      alert("Gabim gjatë ruajtjes.");
    }
    setSaving(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-gray-800 print:hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><PartyPopper size={24}/></div>
              <div>
                <h1 className="text-xl font-black text-gray-900">{booking.event_type || "Event"}</h1>
                <p className="text-xs text-gray-400 font-bold">Organizator: <span className="text-gray-700">{booking.client_name}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                <CalendarDays size={16} className="text-indigo-500 shrink-0"/>
                <span>{booking.event_date ? format(new Date(booking.event_date), 'dd.MM.yyyy') : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                <Clock size={16} className="text-indigo-500 shrink-0"/>
                <span>{booking.start_time ? format(new Date(booking.start_time), 'HH:mm') : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl col-span-2 sm:col-span-1">
                <Building2 size={16} className="text-indigo-500 shrink-0"/>
                <span>{booking.hall_name}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-base mb-1">Caktoni Mysafirët</h2>
              <p className="text-xs text-indigo-100 font-medium">Shtoni emrat për çdo tavolinë.</p>
            </div>
            
            <div className="w-full sm:w-auto flex gap-2">
              <button 
                onClick={handlePrintPDF} 
                className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-3 rounded-2xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={16}/> Shkarko PDF
              </button>
              <button 
                onClick={handleSaveAll} 
                disabled={saving}
                className="flex-1 sm:flex-none bg-white text-indigo-700 font-bold px-5 py-3 rounded-2xl shadow-sm hover:bg-indigo-50 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Save size={16}/> {saving ? "Po ruhet..." : "Ruaj"}
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500"/> Ndryshimet u ruajtën me sukses!
            </div>
          )}

          {/* HARTA E SALLËS (MINI-MAP PËRFUNDIMTARE) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setShowMap(!showMap)}
              className="w-full p-5 flex items-center justify-between text-sm font-bold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center gap-2"><Map size={18} className="text-indigo-600" /> Shiko Planin e Sallës</span>
              <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm text-xs">{showMap ? "Fshih" : "Trego"}</span>
            </button>
            
            {showMap && (
              <div className="p-4 bg-slate-100 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 text-center">Mund ta lëvizni hartën për të parë pozicionet e tavolinave.</p>
                <div className="overflow-auto rounded-xl border border-gray-200 bg-white" style={{ height: '400px' }}>
                  <div className="relative min-w-[800px] min-h-[600px] w-full h-full bg-[#f8fafc]" style={{ width: '1200px', height: '800px' }}>
                    
                    {tables.map((table: any, idx: number) => {
                      // KËTU ËSHTË ZGJIDHJA: Kapja e sigurt e koordinatave nga çdo librari
                      const xPos = parseFloat(table.left ?? table.x ?? table.pos_x ?? table.posX ?? table.position_x ?? (30 + (idx * 20)));
                      const yPos = parseFloat(table.top ?? table.y ?? table.pos_y ?? table.posY ?? table.position_y ?? (30 + (idx * 20)));
                      
                      const radiusFactor = table.radius ? parseFloat(table.radius) * 2 : null;
                      const w = parseFloat(table.width ?? table.w ?? radiusFactor ?? 70);
                      const h = parseFloat(table.height ?? table.h ?? radiusFactor ?? 70);
                      
                      const isCircle = table.type === 'circle' || table.type === 'oval' || String(table.name).toLowerCase().includes('rreth');

                      return (
                        <div 
                          key={`map-${table.id || idx}`}
                          className={`absolute flex flex-col items-center justify-center font-bold text-[12px] border-2 shadow-sm
                            ${isCircle ? 'rounded-full' : 'rounded-lg'}
                            ${table.isCustom ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-indigo-50 border-indigo-500 text-indigo-900'}
                          `}
                          style={{
                            left: `${xPos}px`,
                            top: `${yPos}px`,
                            width: `${w}px`,
                            height: `${h}px`,
                            transform: table.originX === 'center' ? 'translate(-50%, -50%)' : 'none'
                          }}
                        >
                          <span className="truncate w-full text-center px-1">{table.name}</span>
                          <span className="text-[9px] font-normal opacity-70 leading-none mt-0.5">{table.seats} ulëse</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SHTO TAVOLINË EKSTRA */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 shadow-sm">
            <h3 className="font-black text-indigo-900 mb-3 flex items-center gap-2"><Plus size={18}/> Shto Tavolinë Shtesë</h3>
            <p className="text-xs text-indigo-700 mb-4">Nëse salla origjinale nuk ka tavolina mjaftueshëm, mund të shtoni tavolina ekstra këtu.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Emri (psh: VIP)"
                className="flex-1 border border-indigo-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-500"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Kapaciteti"
                className="w-full sm:w-32 border border-indigo-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-500"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(e.target.value)}
              />
              <button 
                onClick={handleAddCustomTable}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
              >
                Shto
              </button>
            </div>
          </div>

          {/* LISTA E TAVOLINAVE */}
          <div className="space-y-4">
            {tables.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nuk ka tavolina të konfiguruara në këtë sallë.</p>
            ) : (
              tables.map((table: any) => {
                const assignedGuests = guestList[table.id] || [];
                const isFull = assignedGuests.length >= table.seats;

                return (
                  <div key={table.id} className={`bg-white rounded-3xl p-5 shadow-sm border ${table.isCustom ? 'border-amber-200' : 'border-gray-100'} space-y-4`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                          {table.name} 
                          {table.isCustom && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Shtesë</span>}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-400">Kapaciteti: <span className={isFull ? 'text-red-500' : 'text-indigo-600'}>{assignedGuests.length} / {table.seats} ulëse</span></p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                        {formatTableType(table.type)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {assignedGuests.map((guestName: string, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-700">
                          <span>{idx + 1}. {guestName}</span>
                          <button onClick={() => handleRemoveGuest(table.id, idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      ))}
                    </div>

                    {!isFull && (
                      <div className="flex gap-2 pt-2 border-t border-gray-50">
                        <input 
                          type="text" 
                          placeholder="Emri i mysafirit..."
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-indigo-500"
                          value={tempInputs[table.id] || ""}
                          onChange={(e) => setTempInputs({ ...tempInputs, [table.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddGuest(table.id, table.seats); }}
                        />
                        <button 
                          onClick={() => handleAddGuest(table.id, table.seats)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <UserPlus size={14}/> Shto
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 pb-12 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleSaveAll} 
              disabled={saving}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <Save size={18}/> {saving ? "Duke ruajtur ndryshimet..." : "Ruaj Të Gjithë Listën"}
            </button>
          </div>

        </div>
      </div>

      <div className="hidden print:block bg-white text-black p-6 font-sans w-full">
        <div className="border-b-2 border-black pb-3 mb-6">
          <h1 className="text-xl font-black mb-1 uppercase tracking-wider">{booking.event_type} - {booking.client_name}</h1>
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>Salla: {booking.hall_name}</span>
            <span>Data: {booking.event_date ? format(new Date(booking.event_date), 'dd.MM.yyyy') : ''} | Ora: {booking.start_time ? format(new Date(booking.start_time), 'HH:mm') : ''}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-5">
          {tables.map((table: any) => {
            const guests = guestList[table.id] || [];
            const emptySeatsCount = Math.max(0, table.seats - guests.length);
            const emptySeats = Array.from({ length: emptySeatsCount });

            return (
              <div key={`print-${table.id}`} className="avoid-break-inside">
                <div className="font-bold border-b border-gray-400 mb-2 uppercase text-[13px]">
                  {table.name} {table.isCustom ? '(Shtesë)' : ''} <span className="font-normal normal-case">(Kapaciteti: {table.seats})</span>
                </div>
                
                <div className="text-xs leading-relaxed">
                  {guests.map((gName: string, idx: number) => (
                    <span key={`g-${idx}`} className="inline-block mr-4 mb-2">
                      <span className="inline-block w-3.5 h-3.5 border border-black mr-1.5 translate-y-[3px] rounded-sm"></span>
                      <span className="font-bold">{idx + 1}. {gName}</span>
                      {idx < guests.length - 1 || emptySeatsCount > 0 ? "," : ""}
                    </span>
                  ))}
                  
                  {emptySeats.map((_, idx) => {
                    const seatNum = guests.length + idx + 1;
                    const isLast = idx === emptySeats.length - 1;
                    return (
                      <span key={`empty-${idx}`} className="inline-block mr-4 mb-2 text-gray-500">
                        <span className="inline-block w-3.5 h-3.5 border border-gray-400 mr-1.5 translate-y-[3px] rounded-sm"></span>
                        <span>{seatNum}. ________________</span>
                        {!isLast ? "," : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { margin: 10mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .avoid-break-inside { page-break-inside: avoid; break-inside: avoid; }
          }
        `}} />
      </div>
    </>
  );
}