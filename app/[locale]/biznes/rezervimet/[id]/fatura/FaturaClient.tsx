"use client";

import { useState, useEffect } from "react";
import { Printer, ArrowLeft, Building2, MapPin, Users, Calendar, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl"; 

export default function FaturaClient({ booking, locale }: { booking: any, locale: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations("FaturaClient"); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const business = booking.businesses;
  const client = booking.clients; 

  const currencySymbols: Record<string, string> = {
    "EUR": "€", "USD": "$", "GBP": "£", "CHF": "CHF", "ALL": "L"
  };
  const symbol = currencySymbols[business.currency] || business.currency;

  const initials = business.name.substring(0, 2).toUpperCase();
  const shortId = booking.id.toString().substring(0, 4).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const invoiceNumber = `VD-${initials}-${shortId}/${year}`;

  const isFlatRent = booking.billing_model === 'flat_rent';

  const menuPrice = isFlatRent ? 0 : Number(booking.menus?.price_per_person || 0);
  const participants = Number(booking.participants || 0);
  const menuTotal = menuPrice * participants; 

  const extrasTotal = booking.booking_extras?.reduce((acc: number, curr: any) => acc + Number(curr.line_total), 0) || 0;
  
  const hallPrice = isFlatRent ? (Number(booking.hall_rent) || 0) : Number(booking.halls?.price || 0); 
  
  const mathSubtotal = menuTotal + extrasTotal + hallPrice;
  
  const finalTotalSaved = Number(booking.total_amount) || 0;

  let discountAmount = 0;
  let discountPercent = 0;
  if (mathSubtotal > finalTotalSaved + 0.01) {
    discountAmount = mathSubtotal - finalTotalSaved;
    discountPercent = Math.round((discountAmount / mathSubtotal) * 100);
  }

  const vatRate = Number(business.vat_rate || 0) / 100;
  const baseAmount = finalTotalSaved / (1 + vatRate);
  const vatAmount = finalTotalSaved - baseAmount;
  
  let amountPaid = 0;
  let refundedAmount = 0;

  booking.payments?.forEach((p: any) => {
    if (p.type === 'refund') {
      amountPaid -= Number(p.amount);
      refundedAmount += Number(p.amount);
    } else {
      amountPaid += Number(p.amount);
    }
  });

  const balance = Math.max(0, finalTotalSaved - amountPaid);

  const handlePrint = () => window.print();

  const formatDateNumbers = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const fullYear = d.getFullYear();
      return `${day}.${month}.${fullYear}`;
    } catch {
      return 'N/A';
    }
  };

  const handleWhatsAppShare = () => {
    if (!client?.phone) {
      alert("Klienti nuk ka numër telefoni të regjistruar!");
      return;
    }

    const cleanPhone = client.phone.replace(/[^0-9]/g, '');

    const message = `*Fatura nga ${business.name}*
Përshëndetje *${client.name}*,
Këtu keni detajet e faturës suaj:

Data e eventit: ${formatDateNumbers(booking.event_date)}
Salla: ${booking.halls?.name || "N/A"}

Totali i Faturës: ${finalTotalSaved.toFixed(2)} ${symbol}
E Paguar: ${amountPaid.toFixed(2)} ${symbol}
${refundedAmount > 0 ? `E Rimbursuar: ${refundedAmount.toFixed(2)} ${symbol}\n` : ''}Mbetja për t'u paguar: ${balance.toFixed(2)} ${symbol}

Faleminderit që na zgjodhët!
Me respekt,
${business.name}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[900px] mx-auto p-4 md:p-8 bg-[#F4F6F8] min-h-screen print:bg-white print:p-0 print:max-w-none font-sans relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body {
            height: auto !important; overflow: visible !important; background-color: white !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif !important;
          }
          body * { visibility: hidden; }
          #invoice-printable-area, #invoice-printable-area * { visibility: visible; }
          #invoice-printable-area {
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important;
            margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
          tr { page-break-inside: avoid; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
        }
      `}} />

      {/* HEADER I BUTONAVE - Responsive */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm no-print gap-4">
        <Link href={`/${locale}/biznes/rezervimet`} className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 text-sm w-full sm:w-auto">
          <ArrowLeft size={16} /> {t("backBtn")}
        </Link>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-none justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
          >
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none justify-center bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
          >
            <Printer size={16} /> {t("printBtn")}
          </button>
        </div>
      </div>

      <div id="invoice-printable-area" className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col print:border-none print:shadow-none print:p-0 relative overflow-hidden">
        
        {/* VULA E ANULIMIT NËSE ËSHTË I ANULUAR */}
        {booking.status === 'cancelled' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none z-0">
            <span className="text-[80px] sm:text-[120px] font-black text-red-600 uppercase tracking-widest border-8 border-red-600 px-8 py-2 rounded-2xl">E ANULUAR</span>
          </div>
        )}

        {/* LOGO & TITLE - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-5 mb-5 shrink-0 relative z-10 gap-5 sm:gap-0">
          <div className="flex flex-row gap-4 items-center">
            {business.logo_url ? (
              <img src={business.logo_url} alt="Logo" className="h-12 sm:h-14 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
            )}
            <div>
              <h1 className="text-[18px] sm:text-[22px] font-black text-gray-900 uppercase tracking-tight">{business.name}</h1>
              <p className="text-[12px] sm:text-[13px] font-medium text-gray-500 mt-0.5">NUI: <span className="text-gray-800">{business.nui || t("notAssigned")}</span></p>
              <p className="text-[12px] sm:text-[13px] font-medium text-gray-500">{business.address}, {business.city}</p>
              <p className="text-[12px] sm:text-[13px] font-medium text-gray-500">Tel: {business.phone}</p>
            </div>
          </div>
          
          <div className="text-left sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
            <h2 className={`text-[20px] sm:text-[24px] font-black uppercase tracking-widest mb-1 ${booking.status === 'cancelled' ? 'text-red-300 sm:text-red-200' : 'text-gray-300 sm:text-gray-200'}`}>
              {booking.status === 'cancelled' ? 'ANULIM' : t("invoiceTitle")}
            </h2>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">Nr: {invoiceNumber}</p>
            <p className="text-[12px] sm:text-[13px] font-medium text-gray-500 mt-0.5">{t("issuedDate")} {formatDateNumbers(new Date().toISOString())}</p>
          </div>
        </div>

        {/* DETAILS - Responsive */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 shrink-0 relative z-10">
          <div className="flex-1 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 md:border-gray-100 pb-1">{t("billedTo")}</h3>
            <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 mb-0.5">{client?.name || t("unknownClient")}</p>
            <p className="text-[12px] sm:text-[13px] font-medium text-gray-600">Tel: {client?.phone}</p>
            {client?.email && <p className="text-[12px] sm:text-[13px] font-medium text-gray-600">Email: {client.email}</p>}
            {client?.client_type === 'business' && <p className="text-[12px] sm:text-[13px] font-medium text-gray-600">NUI: {client.business_num}</p>}
          </div>

          <div className="flex-1 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 md:border-gray-100 pb-1">{t("eventDetails")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 sm:gap-y-2 text-[12px] sm:text-[13px]">
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <MapPin size={14} className="text-gray-400 shrink-0"/> <span className="truncate">{booking.halls?.name || t("notAssigned")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Users size={14} className="text-gray-400 shrink-0"/> {participants} {t("persons")}
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Calendar size={14} className="text-gray-400 shrink-0"/> {formatDateNumbers(booking.event_date)}
              </div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Clock size={14} className="text-gray-400 shrink-0"/> {new Date(booking.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE - Responsive with Horizontal Scroll */}
        <div className="mb-6 relative z-10 w-full overflow-x-auto custom-scrollbar pb-2 print:overflow-visible print:pb-0">
          <table className="w-full min-w-[600px] text-left border-collapse print:min-w-full">
            <thead>
              <tr className="border-y-2 border-gray-200">
                <th className="py-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[40%]">{t("colDescription")}</th>
                <th className="py-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-[20%]">{t("colQuantity")}</th>
                <th className="py-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">{t("colPrice")}</th>
                <th className="py-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">{t("colTotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b-2 border-gray-100">
              
              {hallPrice > 0 && (
                <tr>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">
                      {isFlatRent ? "Qiraja e Sallës: " : t("rentHallLabel") + " "} 
                      {booking.halls?.name}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-gray-700 text-[13px]">1</td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {hallPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {hallPrice.toFixed(2)}</td>
                </tr>
              )}

              {!isFlatRent && booking.menus && (
                <tr>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">{t("participantsLabel")}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{t("menuLabel")} {booking.menus.name}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-gray-700 text-[13px]">{participants}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {menuPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {menuTotal.toFixed(2)}</td>
                </tr>
              )}

              {booking.booking_extras?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-gray-900 text-[13px]">{t("extraLabel")} {item.extras?.name}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-gray-700 text-[13px]">1</td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-700 text-[13px]">{symbol} {Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 text-[13px]">{symbol} {Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>

            <tfoot className="text-[13px]">
              <tr><td colSpan={4} className="py-1.5"></td></tr>
              
              {discountAmount > 0 && (
                <>
                  <tr>
                    <td colSpan={2} className="border-none"></td>
                    <td className="py-1 px-3 text-right font-bold text-gray-400 uppercase tracking-wider text-[11px]">Nëntotali</td>
                    <td className="py-1 px-3 text-right font-bold text-gray-400 line-through">{symbol} {mathSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border-none"></td>
                    <td className="py-1 px-3 text-right font-bold text-[#FF5C39] uppercase tracking-wider text-[11px]">Zbritje ({discountPercent}%):</td>
                    <td className="py-1 px-3 text-right font-black text-[#FF5C39]">- {symbol} {discountAmount.toFixed(2)}</td>
                  </tr>
                  <tr><td colSpan={4} className="border-b border-gray-100 mb-1"></td></tr>
                </>
              )}

              <tr>
                <td colSpan={2} className="border-none"></td>
                <td className="py-1 px-3 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">{t("baseValue")}</td>
                <td className="py-1 px-3 text-right font-medium text-gray-800">{symbol} {baseAmount.toFixed(2)}</td>
              </tr>
              {business.vat_rate > 0 && (
                <tr>
                  <td colSpan={2} className="border-none"></td>
                  <td className="py-1 px-3 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">{t("vatLabel")} ({business.vat_rate}%):</td>
                  <td className="py-1 px-3 text-right font-medium text-gray-800">{symbol} {vatAmount.toFixed(2)}</td>
                </tr>
              )}
              
              <tr>
                <td colSpan={2} className="border-none"></td>
                <td className="py-1.5 px-3 text-right font-bold text-gray-900 uppercase tracking-wider text-[12px]">{t("totalLabel")}</td>
                <td className="py-1.5 px-3 text-right font-bold text-gray-900 text-[14px]">{symbol} {finalTotalSaved.toFixed(2)}</td>
              </tr>
              
              <tr>
                <td colSpan={2} className="border-none"></td>
                <td className="py-1 px-3 text-right font-bold text-[#F59E0B] uppercase tracking-wider text-[11px]">{t("depositLabel")}</td>
                <td className="py-1 px-3 text-right font-bold text-[#F59E0B]">{symbol} {amountPaid.toFixed(2)}</td>
              </tr>

              {refundedAmount > 0 && (
                <tr>
                  <td colSpan={2} className="border-none"></td>
                  <td className="py-1 px-3 text-right font-bold text-red-500 uppercase tracking-wider text-[11px]">Rimbursuar</td>
                  <td className="py-1 px-3 text-right font-black text-red-600">-{symbol} {refundedAmount.toFixed(2)}</td>
                </tr>
              )}

              {booking.status !== 'cancelled' && (
                <tr>
                  <td colSpan={2} className="border-none"></td>
                  <td className="py-1.5 px-3 text-right font-bold text-red-600 uppercase tracking-wider text-[12px]">{t("balanceLabel")}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-red-600 text-[14px]">{symbol} {balance.toFixed(2)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        <div className="break-inside-avoid mt-6 sm:mt-8 shrink-0 relative z-10">
          
          {booking.status !== 'cancelled' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 print:bg-gray-50/80">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("cancelPolicyTitle")}</h4>
              <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                {t("cancelPolicyMsg1")} {business.cancel_days || 0} {t("cancelPolicyMsg2")} {business.cancel_penalty || 0}%.
              </p>
            </div>
          )}

          {/* SIGNATURES - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-6 px-2 mt-8 sm:mt-12 gap-8 sm:gap-0">
            
            <div className="text-center w-full sm:w-1/3 relative">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-8">{t("signBusiness")}</p>
              {business.signature_url && (
                <img src={business.signature_url} alt="Firma" className="absolute bottom-6 left-1/2 -translate-x-1/2 h-12 object-contain z-10 pointer-events-none" />
              )}
              <div className="border-b-2 border-gray-300 mb-2 relative z-0 w-3/4 mx-auto sm:w-full"></div>
              <p className="text-[12px] font-bold text-gray-900 mt-1">{business.responsible_person || business.name}</p>
            </div>
            
            <div className="text-center w-full sm:w-1/3 flex items-center justify-center">
              {business.stamp_url ? (
                <img src={business.stamp_url} alt="Vula" className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90" />
              ) : null}
            </div>

            <div className="text-center w-full sm:w-1/3 relative">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-8">{t("signClient")}</p>
              {booking.client_signature_url && (
                <img src={booking.client_signature_url} alt="Firma Klientit" className="absolute bottom-6 left-1/2 -translate-x-1/2 h-12 object-contain z-10 pointer-events-none" />
              )}
              <div className="border-b-2 border-gray-300 mb-2 relative z-0 w-3/4 mx-auto sm:w-full"></div>
              <p className="text-[12px] font-bold text-gray-900 mt-1">{client?.name}</p>
            </div>

          </div>

          <div className="pt-4 text-center">
            <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 bg-gray-50 inline-block px-3 py-1.5 rounded border border-gray-100 print:border-none print:bg-transparent">
              {t("bankInfoText")} <strong className="text-gray-800">{business.bank_name || t("notAssigned")}</strong> <span className="mx-2 text-gray-300">|</span> IBAN: <strong className="text-gray-800">{business.iban || t("notAssigned")}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}