import React from "react";
import { MousePointerClick, FileEdit, CheckCircle, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <MousePointerClick className="w-8 h-8 text-[#8B5CF6]" />,
      title: "1. Krijoni Llogarinë",
      description: "Regjistroni biznesin tuaj falas dhe aksesoni panelin e avancuar të menaxhimit (ERP)."
    },
    {
      icon: <FileEdit className="w-8 h-8 text-[#A78BFA]" />,
      title: "2. Plotësoni Detajet",
      description: "Shtoni sallat tuaja, ngarkoni fotot e bukura kompresuara dhe përcaktoni kapacitetin."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      title: "3. Publikoni në Marketplace",
      description: "Me një klikim, kaloni statusin në 'Publikuar' dhe salla juaj bëhet e dukshme për mijëra vizitorë."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-amber-400" />,
      title: "4. Pranoni Kërkesa",
      description: "Pranoni kërkesa (Leads) direkt nga platforma, menaxhoni ato dhe rritni shitjet."
    }
  ];

  return (
    <section id="si-funksionon" className="py-24 bg-[#070d19] border-t border-white/5 relative z-10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 tracking-tight">Si të listoni sallën tuaj?</h2>
          <p className="text-slate-400 font-light text-lg">
            HALLEVO e bën menaxhimin dhe promovimin e sallës tuaj jashtëzakonisht të thjeshtë dhe profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#101724] rounded-[24px] p-8 border border-white/5 hover:border-white/10 transition-all duration-300 group relative overflow-hidden shadow-lg hover:-translate-y-1">
              
              {/* Ndriçim i lehtë në hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-16 h-16 bg-[#1A2235] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/5 group-hover:scale-110 transition-transform duration-500 relative z-10">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-medium relative z-10">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}