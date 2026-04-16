"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // <-- SHTUAR KËTU
import { 
  Check, X, Clock, Banknote, ShieldCheck, Mail, Instagram,
  Layers, Users, UtensilsCrossed, Info, FileText,
  CreditCard, Calendar, Megaphone, ArrowRight, Download, Ticket, Zap
} from "lucide-react";
import { createPaymentIntent } from "./actions"; 
import { format, addMonths, addYears, differenceInDays } from "date-fns";
import { sq } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { useTranslations } from "next-intl";

import { initializePaddle, Paddle } from '@paddle/paddle-js';

export default function AbonimiClient({ 
  business, packages, locale, systemSettings, bankAccount 
}: { 
  business: any, packages: any[], locale: string, systemSettings: any, bankAccount: any 
}) {
  const t = useTranslations("AbonimiClient");
  const router = useRouter(); // <-- SHTUAR KËTU
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [generatedRef, setGeneratedRef] = useState("");
  
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [paddleError, setPaddleError] = useState<string | null>(null);

  const isTrial = business.status === 'trial' || !business.status;
  const [showPricing, setShowPricing] = useState(isTrial);

  const paymentGateway = systemSettings?.payment_gateway || 'both';

  useEffect(() => {
    // 1. Force the token, even if .env is failing
    const tokenToUse = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "test_25f28a0f1d30c5d1bee41791130";
    
    console.log("Duke inicializuar Paddle me token:", tokenToUse);

    if (!tokenToUse || tokenToUse === "VENDOS_TOKENIN_KËTU") {
        setPaddleError("Mungon Client Token i Paddle!");
        return;
    }

    initializePaddle({
      environment: "sandbox", // Force sandbox for now
      token: tokenToUse,
      // <-- SHTUAR KËTU: Dëgjon kur mbyllet pagesa me sukses dhe bën ridrejtimin
      eventCallback: function(data) {
        if (data.name === "checkout.completed") {
          console.log("Pagesa u krye me sukses! Po mbyllim dritaren dhe ridrejtojmë...");
          router.push(`/${locale}/biznes`); // Të dërgon te faqja kryesore e biznesit
        }
      }
    }).then(
      (paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          console.log("Paddle u inicializua me sukses!");
          setPaddle(paddleInstance);
        } else {
            console.error("Paddle ktheu undefined");
            setPaddleError("Paddle nuk u ngarkua.");
        }
      }
    ).catch(err => {
        console.error("Gabim fatal gjatë inicializimit të Paddle:", err);
        setPaddleError(err.message);
    });
  }, [locale, router]); // U shtuan dependencat këtu

  let daysLeft = 0;
  let expiryDate = "Nuk ka datë";
  if (business.trialEndsAt && business.status === 'active') {
    const endObj = new Date(business.trialEndsAt);
    daysLeft = differenceInDays(endObj, new Date());
    expiryDate = format(endObj, "dd MMMM yyyy", { locale: sq });
  }

  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Fatura-${business.name}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `
  });

  const openPackageModal = (pkg: any) => {
    setSelectedPkg(pkg);
    setGeneratedRef(""); 
  };

  const handleConfirm = async () => {
    if (loadingId !== null || !selectedPkg) return;
    setLoadingId(selectedPkg.id); 
    
    const amount = billingCycle === 'monthly' ? selectedPkg.monthly_price : selectedPkg.yearly_price;

    const res = await createPaymentIntent({
      businessId: business.id,
      amount: amount,
      locale: locale,
      packageId: selectedPkg.id 
    });

    if (res.success && res.referenceCode) {
      setGeneratedRef(res.referenceCode); 
    } else {
      alert(res.error || "Ndodhi një gabim!");
    }
    setLoadingId(null);
  };

  const handlePaddlePayment = () => {
    if (paddleError) {
        alert("Gabim sistemi: " + paddleError);
        return;
    }
    if (!paddle || !selectedPkg) {
        alert("Paddle nuk është gati ende. Ju lutem prisni pak sekonda.");
        return;
    }
    setLoadingId('paddle');

    const pkgName = selectedPkg.name.toLowerCase();
    let priceId = "";

    if (pkgName.includes("starter") || pkgName.includes("baza")) {
       priceId = billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY! : process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEARLY!;
    } else if (pkgName.includes("business") || pkgName.includes("pro")) {
       priceId = billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS_MONTHLY! : process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS_YEARLY!;
    } else if (pkgName.includes("elite") || pkgName.includes("premium")) {
       priceId = billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ELITE_MONTHLY! : process.env.NEXT_PUBLIC_PADDLE_PRICE_ELITE_YEARLY!;
    }

    console.log("Po dergojme te Paddle Price ID:", priceId);

    if (!priceId || priceId === "undefined") {
       alert("Gabim: Nuk u gjet ID e çmimit për këtë paketë. Kontrolloni .env file.");
       setLoadingId(null);
       return;
    }

    try {
        paddle.Checkout.open({
            items: [{ priceId: priceId, quantity: 1 }],
            customer: {
                email: business.email || "adnanbegiqi@gmail.com", // Përdorim emailin e biznesit nëse ekziston
            },
            customData: {
                businessId: business.id.toString(), 
                packageId: selectedPkg.id.toString(),
                billingCycle: billingCycle
            }
        });
    } catch (err: any) {
        console.error("Gabim gjatë hapjes së checkout:", err);
        alert("Ndodhi një gabim gjatë hapjes së dritares së pagesës: " + err.message);
    }

    setLoadingId(null); 
  };

  const startDate = new Date();
  const endDate = billingCycle === 'monthly' ? addMonths(startDate, 1) : addYears(startDate, 1);
  const formattedStart = format(startDate, "dd MMM yyyy", { locale: sq });
  const formattedEnd = format(endDate, "dd MMM yyyy", { locale: sq });

  const vatRate = systemSettings?.vat_rate ? parseFloat(systemSettings.vat_rate) : 0;
  const showVat = vatRate > 0;

  const packageName = business.package?.name || "Paketa Aktualisht Aktive";
  const hallsLimit = business.package?.halls_limit === -1 ? 'Pa limit' : (business.package?.halls_limit || 'N/A');
  const usersLimit = business.package?.users_limit === -1 ? 'Pa limit' : (business.package?.users_limit || 'N/A');
  const menusLimit = business.package?.menus_limit === -1 ? 'Pa limit' : (business.package?.menus_limit || 'N/A');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans">
      
      {/* DASHBOARD I DETAJUAR I ABONIMIT */}
      {!showPricing && (
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-indigo-50 opacity-50 pointer-events-none">
              <ShieldCheck size={250} />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 mb-8 gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#0f172a] rounded-3xl flex items-center justify-center text-white shadow-lg">
                    <Zap size={36} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Abonimi juaj aktual</p>
                    <h2 className="text-4xl font-black text-[#0f172a] mb-2">{packageName}</h2>
                    <div className="flex items-center gap-3">
                      {business.status === 'active' ? (
                         <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                           <Check size={12} /> Aktiv
                         </span>
                      ) : (
                         <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                           <Clock size={12} /> Në Pritje të Pagesës
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-left md:text-right bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skadon më:</p>
                  <p className="font-black text-lg text-gray-900 mb-1">{expiryDate}</p>
                  {business.status === 'active' && daysLeft > 0 && (
                    <p className="text-xs font-bold text-emerald-600">Mbeten edhe {daysLeft} ditë</p>
                  )}
                  {business.status === 'active' && daysLeft <= 0 && (
                    <p className="text-xs font-bold text-red-500">I skaduar</p>
                  )}
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Të përfshira në këtë pako:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Layers size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Salla Eventesh</p>
                      <p className="font-black text-lg text-indigo-900">{hallsLimit}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Përdorues (Staf)</p>
                      <p className="font-black text-lg text-emerald-900">{usersLimit}</p>
                    </div>
                  </div>
                  <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <UtensilsCrossed size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-0.5">Menu & Ekstra</p>
                      <p className="font-black text-lg text-orange-900">{menusLimit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-8">
                <button onClick={() => setShowPricing(true)} className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-2">
                  Ndrysho Paketën <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEKSIONI I PAKETAVE */}
      {showPricing && (
        <div>
          {!isTrial && (
            <button onClick={() => setShowPricing(false)} className="mb-10 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              ← Kthehu te Detajet e Abonimit
            </button>
          )}

          <div className="mb-16 text-center">
            <h1 className="text-[2.5rem] font-black text-[#0f172a] tracking-tight">Plani i Abonimit</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium mb-10">Zgjidhni paketën ideale për rritjen tuaj.</p>
            
            <div className="flex bg-gray-100/70 p-1 rounded-full w-fit mx-auto shadow-inner border border-gray-200">
               <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${billingCycle === 'monthly' ? 'bg-[#0f172a] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}>
                   <CreditCard size={16}/> Pagesë Mujore
               </button>
               <div className="relative">
                 <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${billingCycle === 'yearly' ? 'bg-[#0f172a] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}>
                     <Calendar size={16}/> Pagesë Vjetore
                 </button>
                 <span className="absolute -top-3.5 -right-3.5 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow border border-emerald-200">
                   2 MUAJ FALAS
                 </span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-[1200px] mx-auto">
            {packages.map((pkg) => {
              const isCurrent = business.packageId === pkg.id;
              const price = billingCycle === 'monthly' ? pkg.monthly_price : pkg.yearly_price;
              
              const monthlyTotalForYear = pkg.monthly_price * 12;
              const savings = monthlyTotalForYear - pkg.yearly_price;
              
              return (
                <div key={pkg.id} className="bg-white rounded-[2.5rem] p-10 flex flex-col border border-gray-100 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gray-200">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-[#0f172a] mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-[2.8rem] font-black tracking-tight text-[#0f172a]">{price}€</span>
                      <span className="text-sm font-bold text-gray-400">/ {billingCycle === 'monthly' ? 'muaj' : 'vit'}</span>
                    </div>
                    <div className="h-6">
                      {billingCycle === 'yearly' && savings > 0 && (
                         <span className="inline-block bg-emerald-50 text-emerald-600 text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                           Kurse {savings.toFixed(2)}€ në vit
                         </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">Kapaciteti i Paketës</p>
                    <div className="space-y-4 mb-10 border-b border-gray-100 pb-10">
                      <div className="flex items-center justify-between text-sm font-bold text-[#0f172a]">
                        <div className="flex items-center gap-3">
                          <Layers size={18} className="text-[#6366f1]" /> Salla të Eventeve
                        </div>
                        <span className="text-gray-900 font-black">{pkg.halls_limit === -1 ? 'Pa limit' : pkg.halls_limit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold text-[#0f172a]">
                        <div className="flex items-center gap-3">
                          <Users size={18} className="text-[#6366f1]" /> Përdorues Stafi
                        </div>
                        <span className="text-gray-900 font-black">{pkg.users_limit === -1 ? 'Pa limit' : pkg.users_limit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold text-[#0f172a]">
                        <div className="flex items-center gap-3">
                          <UtensilsCrossed size={18} className="text-[#6366f1]" /> Menu & Ekstra
                        </div>
                        <span className="text-gray-900 font-black">{pkg.menus_limit === -1 ? 'Pa limit' : pkg.menus_limit}</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">Përfshihen në sistem:</p>
                    <div className="space-y-4 mb-12">
                      {[
                        { name: "Flow AI Assistant", icon: ShieldCheck },
                        { name: "Sistemi i Tiketave & Suporti", icon: Ticket },
                        { name: "Njoftimet Real-time", icon: Megaphone },
                        { name: "Raportet Financiare & Analitika", icon: FileText }
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <feature.icon size={16} className="text-gray-400 mr-1"/> {feature.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => openPackageModal(pkg)}
                    disabled={isCurrent}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrent 
                      ? 'bg-gray-100 text-gray-400 cursor-default' 
                      : 'bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-lg disabled:opacity-50'
                    }`}
                  >
                    {isCurrent ? "Plani juaj Aktual" : "Zgjidh Paketën →"} 
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL I PAGESËS */}
      {selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 print:bg-white print:p-0">
          
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none">
            
            <div className="bg-white px-10 py-6 border-b border-gray-100 flex justify-between items-center shrink-0 print:hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {generatedRef ? "Fatura & Detajet" : t("confirmModalTitle")}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mt-0.5">
                    {generatedRef ? "Ruani detajet për fletëpagesë" : "Zgjidhni metodën e pagesës"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {generatedRef && (
                  <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1e293b] transition-colors shadow-md">
                    <Download size={18} /> Printo Faturën
                  </button>
                )}
                <button onClick={() => setSelectedPkg(null)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-10 overflow-y-auto flex flex-col lg:flex-row gap-12 print:overflow-visible print:p-10 print:flex-col">
              
              {/* FATURA (Ana e majtë) */}
              <div className="flex-[2] bg-white print:w-full">
                  <div ref={invoiceRef} className="p-2 bg-white text-black">
                    <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                      <div>
                        <h1 className="text-4xl font-black text-[#0f172a] tracking-tighter mb-2">{t("invoiceTitle")}</h1>
                        <p className="text-gray-500 font-mono text-base font-medium">
                           {generatedRef ? generatedRef : <span className="text-orange-500 font-bold">{t("draftInvoice")}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Data e Lëshimit</p>
                        <p className="text-lg font-bold text-gray-900">{format(new Date(), "dd MMM yyyy", { locale: sq })}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-8 border-b border-gray-100 pb-8 mb-8">
                      <div className="flex-1">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Lëshuar Nga:</p>
                          <p className="font-black text-xl text-gray-900 mb-1">{systemSettings.platform_name || "Platforma Juaj"}</p>
                          {systemSettings.address && <p className="text-base text-gray-600 mb-1">{systemSettings.address}</p>}
                          <p className="text-base text-gray-600">{systemSettings.contact_email || "admin@flow-events.com"}</p>
                      </div>
                      <div className="flex-1 sm:text-right">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Për Biznesin:</p>
                          <p className="font-black text-xl text-gray-900 mb-1">{business.name}</p>
                          <p className="text-base text-gray-600 mb-1">NUI: {business.nui}</p>
                          {business.address && <p className="text-base text-gray-600">{business.address}</p>}
                      </div>
                    </div>

                    <table className="w-full text-left mb-8 border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Përshkrimi</th>
                          <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Periudha e Abonimit</th>
                          <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Shuma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-6">
                            <p className="font-black text-xl text-gray-900">{selectedPkg.name}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{billingCycle === 'monthly' ? 'Abonim Mujor' : 'Abonim Vjetor'}</p>
                          </td>
                          <td className="py-6 text-center text-sm font-medium text-gray-600">
                            {formattedStart} - {formattedEnd}
                          </td>
                          <td className="py-6 text-right font-black text-xl text-gray-900">
                            {billingCycle === 'monthly' ? selectedPkg.monthly_price : selectedPkg.yearly_price}€
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-end mb-12">
                      <div className="w-full sm:w-1/2">
                        <div className="flex justify-between py-3 text-base border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Nëntotali</span>
                          <span className="font-bold text-gray-900">{billingCycle === 'monthly' ? selectedPkg.monthly_price : selectedPkg.yearly_price}€</span>
                        </div>
                        {showVat && (
                          <div className="flex justify-between py-3 text-base border-b border-gray-100">
                            <span className="text-gray-500 font-medium">TVSH ({systemSettings.vat_rate}%)</span>
                            <span className="font-bold text-gray-900">Përfshirë</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-6 mt-4 bg-gray-50 px-6 rounded-2xl print:bg-gray-100">
                          <span className="text-gray-900 font-black uppercase text-base tracking-widest">TOTALI</span>
                          <span className="text-4xl font-black text-indigo-600 tracking-tight">
                            {billingCycle === 'monthly' ? selectedPkg.monthly_price : selectedPkg.yearly_price}€
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shfaqet vetëm nëse klienti e ka KONFIRMUAR Manualisht */}
                    {generatedRef && (
                      <div className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100 break-inside-avoid print:bg-indigo-50">
                        <h5 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Banknote size={16} /> Të dhënat për Fletëpagesë
                        </h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">Banka & Përfituesi</p>
                            <p className="font-black text-base text-indigo-900 mb-0.5">{bankAccount.bank_name || "Banka nuk është vendosur"}</p>
                            <p className="font-bold text-sm text-indigo-700">{bankAccount.account_holder || systemSettings.platform_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">Llogaria (IBAN)</p>
                            <p className="font-black text-lg text-indigo-900 tracking-wider font-mono">
                              {bankAccount.iban || "Nuk ka IBAN"}
                            </p>
                          </div>
                          <div className="col-span-1 sm:col-span-2 pt-3 border-t border-indigo-100/50 mt-1">
                            <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">Përshkrimi i Pagesës (Referenca)</p>
                            <p className="font-black text-2xl text-indigo-900 tracking-widest">{generatedRef}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              </div>

              {/* ANA E DJATHTË - Zgjedhja ose Udhëzimet */}
              <div className="flex-1 flex flex-col justify-between bg-gray-50 rounded-3xl p-8 border border-gray-100 print:hidden">
                
                {/* NËSE NUK ËSHTË KONFIRMUAR (KËTU ZGJEDH METODËN) */}
                {!generatedRef ? (
                  <div className="flex flex-col h-full text-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                        <Check size={32} className="text-indigo-600" />
                     </div>
                     <h5 className="text-2xl font-black text-gray-900 mb-2">Zgjidhni Metodën</h5>
                     <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        Si dëshironi të paguani për paketën {selectedPkg.name}?
                     </p>
                     
                     <div className="flex flex-col gap-3 mt-auto">
                       
                       {/* BUTONI PËR KARTË KREDITI (PADDLE) */}
                       {(paymentGateway === 'both' || paymentGateway === 'paddle') && (
                         <button 
                           onClick={handlePaddlePayment} 
                           disabled={loadingId !== null} 
                           className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold hover:bg-[#1e293b] transition-all shadow-lg flex items-center justify-center gap-2"
                         >
                           {loadingId === 'paddle' ? <Clock size={18} className="animate-spin" /> : <CreditCard size={18} />}
                           Paguaj me Kartë
                         </button>
                       )}

                       {/* BUTONI PËR FATURË MANUALE */}
                       {(paymentGateway === 'both' || paymentGateway === 'manual') && (
                         <button 
                           onClick={handleConfirm} 
                           disabled={loadingId !== null} 
                           className="w-full bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                         >
                           {loadingId === selectedPkg.id ? <Clock size={18} className="animate-spin text-gray-500" /> : <Banknote size={18} className="text-gray-500" />}
                           Transfertë Bankare
                         </button>
                       )}

                       <button 
                         onClick={() => setSelectedPkg(null)} 
                         className="w-full mt-2 text-gray-400 py-2 rounded-2xl font-bold hover:text-gray-600 transition-all"
                       >
                         {t("btnCancel")}
                       </button>
                     </div>
                  </div>
                ) : (
                  /* NËSE ËSHTË KONFIRMUAR MANUALE (Udhëzimet) */
                  <>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Info size={18} className="text-indigo-600"/> {t("whatNextTitle")}
                      </h5>
                      
                      <div className="space-y-8 relative border-l-2 border-indigo-100 ml-3 pl-8">
                        <div className="relative">
                          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-indigo-600 rounded-full ring-4 ring-gray-50 shadow-md"></div>
                          <p className="text-base font-black text-gray-900 mb-2">{t("step1Title")}</p>
                          <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            {t("step1Desc")} <b className="text-indigo-600">{generatedRef}</b>.
                          </p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-indigo-200 rounded-full shadow-sm"></div>
                          <p className="text-base font-black text-gray-900 mb-2">{t("step2Title")}</p>
                          <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            {t("step2Desc")}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-gray-200 rounded-full"></div>
                          <p className="text-base font-black text-gray-400 mb-2">{t("step3Title")}</p>
                          <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {t("step3Desc")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t("sendProofTitle")}</p>
                      <div className="flex flex-col gap-3">
                        <a 
                          href={`mailto:${systemSettings.contact_email}?subject=Pagesa per Paketën ${selectedPkg.name}&body=Përshëndetje, bashkangjitur gjeni dëshminë e pagesës për referencën: ${generatedRef}`}
                          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-200 text-sm shadow-sm"
                        >
                          <Mail size={18} /> {t("btnSendEmail")}
                        </a>
                        {systemSettings.instagram_url && (
                          <a 
                            href={systemSettings.instagram_url} 
                            target="_blank"
                            className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-700 py-3.5 rounded-xl font-bold hover:bg-pink-100 transition-all border border-pink-100 text-sm shadow-sm"
                          >
                            <Instagram size={18} /> {t("btnSendInstagram")}
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}