"use client";

import { useState, useEffect } from "react";
import { Printer, ArrowLeft, Building2, MapPin, Users, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl"; 

export default function OfertaPrintClient({ booking, locale }: { booking: any, locale: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations("FaturaClient"); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const business = booking.businesses;
  const client = booking.clients; 

  const currencySymbols: Record<string, string> = {
    "EUR": "€",
    "USD": "$",
    "GBP": "£",
    "CHF": "CHF",
    "ALL": "L"
  };
  const symbol = currencySymbols[business.currency] || business.currency;

  const initials = business.name.substring(0, 2).toUpperCase();
  const shortId = booking.id.toString().substring(0, 4).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  
  // NUMËRTORJA E VEÇANTË E OFERTËS
  const offerNumber = `OF-${initials}-${shortId}/${year}`;

  const menuPrice = Number(booking.menus?.price_per_person || 0);
  const participants = Number(booking.participants || 0);
  const menuTotal = menuPrice * participants; 

  const extrasTotal = booking.booking_extras?.reduce((acc: number, curr: any) => acc + Number(curr.line_total), 0) || 0;
  const hallPrice = Number(booking.halls?.price || 0); 
  const totalRaw = menuTotal + extrasTotal + hallPrice;
  
  const vatRate = Number(business.vat_rate || 0) / 100;
  const baseAmount = totalRaw / (1 + vatRate);
  const vatAmount = totalRaw - baseAmount;

  const handlePrint = () => window.print();
  const currentLocaleObj = locale === 'sq' ? 'sq-AL' : 'en-US';

  if (!isMounted) return null;

  return (
    <div className="max-w-[900px] mx-auto p-4 md:p-8 bg-[#F4F6F8] min-h-screen print:bg-white print:p-0 print:max-w-none font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            font-family: 'Inter', sans-serif !important;
          }
          body * { visibility: hidden; }
          #invoice-printable-area, #invoice-printable-area * {
            visibility: visible;
          }
          #invoice-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
          tr { page-break-inside: avoid; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}} />

      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm no-print">
        {/* Kthehet tek lista e Ofertave në dosjen e duhur */}
        <Link href={`/${locale}/biznes/ofertat`} className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Kthehu te Ofertat
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
        >
          <Printer size={16} /> Printo Ofertën
        </button>
      </div>

      <div id="invoice-printable-area" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col print:border-none print:shadow-none print:p-0">
        
        <div className="flex justify-between items-start border-b border-gray-100 pb-5 mb-5 shrink-0">
          <div className="flex flex-row gap-4 items-center">
            {business.logo_url ? (
              <img src={business.logo_url} alt="Logo" className="h-14 w-auto object-contain" />
            ) : (
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                <Building2 size={24} />
              </div>
            )}
            <div>
              <h1 className="text-[22px] font-black text-gray-900 uppercase tracking-tight">{business.name}</h1>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">NUI: <span className="text-gray-800">{business.nui || t("notAssigned")}</span></p>
              <p className="text-[13px] font-medium text-gray-500">{business.address}, {business.city}</p>
              <p className="text-[13px] font-medium text-gray-500">Tel: {business.phone}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-[24px] font-black text-indigo-100 uppercase tracking-widest mb-1.5">OFERTË / PROFORMA</h2>
            <p className="text-[15px] font-bold text-gray-900">Nr: {offerNumber}</p>
            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Data: {new Date().toLocaleDateString(currentLocaleObj)}</p>
          </div>
        </div>

        <div className="flex flex-row justify-between gap-8 mb-6 shrink-0">
          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Ofertuar Për</h3>
            <p className="text-[16px] font-bold text-gray-900 mb-0.5">{client?.name || t("unknownClient")}</p>
            <p className="text-[13px] font-medium text-gray-600">Tel: {client?.phone}</p>
            {client?.email && <p className="text-[13px] font-medium text-gray-600">Email: {client.email}</p>}
            {client?.client_type === 'business' && <p className="text-[13px] font-medium text-gray-600">NUI: {client.business_num}</p>}
          </div>

          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">{t("eventDetails")}</h3>
            <div className="grid grid-cols-2 gap-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <MapPin size={14} className="text-gray-400"/> {booking.halls?.name || t("notAssigned")}
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Users size={14} className="text-gray-400"/> {participants} {t("persons")}
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Calendar size={14} className="text-gray-400"/> {new Date(booking.event_date).toLocaleDateString(currentLocaleObj)}
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Clock size={14} className="text-gray-400"/> {new Date(booking.start_time).toLocaleTimeString(currentLocaleObj, {hour: '2-digit', minute:'2-digit', hour12: true})}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-gray-200 bg-gray-50/50 print:bg-transparent">
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[40%]">{t("colDescription")}</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-[20%]">{t("colQuantity")}</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">{t("colPrice")}</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">{t("colTotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
              
              {hallPrice > 0 && (
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">{t("rentHallLabel")} {booking.halls?.name}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-gray-700 text-[13px]">1</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {hallPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {hallPrice.toFixed(2)}</td>
                </tr>
              )}

              {booking.menus && (
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">{t("participantsLabel")}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{t("menuLabel")} {booking.menus.name}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-gray-700 text-[13px]">{participants}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {menuPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {menuTotal.toFixed(2)}</td>
                </tr>
              )}

              {booking.booking_extras?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">{t("extraLabel")} {item.extras?.name}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-gray-700 text-[13px]">1</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}

            </tbody>

            <tfoot className="text-[13px]">
              <tr>
                <td colSpan={4} className="py-2"></td> 
              </tr>
              <tr>
                <td colSpan={2} className="border-none"></td>
                <td className="py-1.5 px-3 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">{t("baseValue")}</td>
                <td className="py-1.5 px-3 text-right font-medium text-gray-800">{symbol} {baseAmount.toFixed(2)}</td>
              </tr>
              {business.vat_rate > 0 && (
                <tr>
                  <td colSpan={2} className="border-none"></td>
                  <td className="py-1.5 px-3 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">{t("vatLabel")} ({business.vat_rate}%):</td>
                  <td className="py-1.5 px-3 text-right font-medium text-gray-800">{symbol} {vatAmount.toFixed(2)}</td>
                </tr>
              )}
              {/* Totali Përfundimtar - Pa llogaritje pagesash apo mbetjesh */}
              <tr>
                <td colSpan={2} className="border-none"></td>
                <td className="py-2 px-3 text-right font-black text-indigo-600 uppercase tracking-wider text-[13px]">Vlera e Plotë</td>
                <td className="py-2 px-3 text-right font-black text-indigo-600 text-[16px]">{symbol} {totalRaw.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="break-inside-avoid mt-10 shrink-0">
          
          {/* BLLOKU I VLEFSHMËRISË SË OFERTËS */}
          <div className="mb-6 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 print:bg-indigo-50/80">
            <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} /> Vlefshmëria e Ofertës
            </h4>
            <p className="text-[12px] text-indigo-900/80 font-medium leading-relaxed">
              Kjo ofertë është e vlefshme për <strong>7 ditë</strong> nga data e lëshimit. Data e eventit nuk konsiderohet e bllokuar në kalendarin tonë derisa oferta të konfirmohet zyrtarisht dhe të paguhet kapari i nevojshëm.
            </p>
          </div>

          <div className="flex justify-between items-end border-b border-gray-100 pb-6 px-2 mt-12">
            <div className="text-center w-40">
              <div className="border-b-2 border-gray-300 mb-2"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("signBusiness")}</p>
              <p className="text-[12px] font-bold text-gray-900 mt-1">{business.responsible_person || business.name}</p>
            </div>
            <div className="text-center w-40">
              <div className="border-b-2 border-gray-300 mb-2"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("signClient")}</p>
              <p className="text-[12px] font-bold text-gray-900 mt-1">{client?.name}</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[10px] font-medium text-gray-500 bg-gray-50 inline-block px-3 py-1.5 rounded border border-gray-100 print:border-none print:bg-transparent">
              {t("bankInfoText")} <strong className="text-gray-800">{business.bank_name || t("notAssigned")}</strong> <span className="mx-2 text-gray-300">|</span> IBAN: <strong className="text-gray-800">{business.iban || t("notAssigned")}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}