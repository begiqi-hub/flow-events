"use client";

import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function DownloadInvoiceBtn({ booking, business }: { booking: any, business: any }) {
  
  const handleDownloadPDF = () => {
    // 1. Krijojmë një dokument të ri PDF (Formati A4)
    const doc = new jsPDF();
    
    // 2. KOKA E FATURËS (Të dhënat e Biznesit)
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Ngjyrë e zezë elegante
    doc.text("FATURË / KONTRATË", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Ngjyrë gri
    doc.text(business?.name || "Biznesi Im", 14, 32);
    doc.setFontSize(10);
    doc.text(`NUI: ${business?.nui || "N/A"}`, 14, 38);
    doc.text(`Telefoni: ${business?.phone || "N/A"}`, 14, 44);
    doc.text(`Email: ${business?.email || "N/A"}`, 14, 50);

    // 3. TË DHËNAT E KLIENTIT DHE EVENTIT
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Faturuar për:", 120, 32);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Klienti: ${booking?.clients?.name || "N/A"}`, 120, 38);
    doc.text(`Telefoni: ${booking?.clients?.phone || "N/A"}`, 120, 44);
    
    doc.text(`Data e Eventit: ${format(new Date(booking.event_date), 'dd/MM/yyyy')}`, 120, 56);
    doc.text(`Salla: ${booking?.halls?.name || "N/A"}`, 120, 62);
    doc.text(`Pjesëmarrës: ${booking?.participants || 0} persona`, 120, 68);

    // 4. VIZA NDARËSE
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 75, 196, 75);

    // 5. TABELA E SHPENZIMEVE (Ushqimi + Ekstrat)
    const tableData = [];
    
    // Rreshti i Ushqimit (nëse ka menu të zgjedhur)
    // Shënim: Këtu mund ta lidhim me Menu-në reale nëse ia kalojmë si prop, 
    // por për momentin po e llogarisim si "Shërbim Bazë"
    tableData.push([
      "Menu / Shërbimi Bazë (për person)", 
      `${booking.participants} pax`, 
      "Shih Totali", // Çmimi për person mund të shtohet nëse e tërheqim nga DB
      `${Number(booking.total_amount).toFixed(2)} €` // Këtu kemi totalin e përgjithshëm
    ]);

    // Këtu në të ardhmen mund të bëjmë .map() për Ekstrat reale të këtij rezervimi!

    autoTable(doc, {
      startY: 85,
      head: [['Përshkrimi', 'Sasia', 'Çmimi Njësi', 'Totali']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
    });

    // 6. TOTALI PËRFUNDIMTAR
    // @ts-ignore - sepse autotable shton lastAutoTable në doc
    const finalY = doc.lastAutoTable.finalY || 100;
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("TOTALI PËR PAGESË:", 120, finalY + 15);
    
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // E gjelbër (Emerald 500)
    doc.text(`${Number(booking.total_amount).toFixed(2)} €`, 175, finalY + 15, { align: 'left' });

    // 7. FOOTER (Kushtet)
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Faleminderit që zgjodhët shërbimet tona!", 14, 280);
    doc.text("Kjo faturë është e vlefshme pa vulë dhe firmë, e gjeneruar nga sistemi elektronik.", 14, 285);

    // 8. SHKARKO PDF-në
    doc.save(`Fatura_${booking.clients?.name?.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };

  return (
    <button 
      onClick={handleDownloadPDF}
      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
      title="Shkarko Faturën PDF"
    >
      <FileText size={16} /> Fatura
    </button>
  );
}