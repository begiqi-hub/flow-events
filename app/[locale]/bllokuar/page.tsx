import React from "react";
import { ShieldAlert, Mail } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0D14] px-5 py-12 text-center">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-3xl" />

      {/* Brand */}
      <div className="relative mb-8">
        <h2 className="text-2xl font-black tracking-[0.2em] text-white">
          HALLEVO
        </h2>
        <p className="mt-2 text-[11px] font-medium tracking-[0.2em] text-slate-500">
          MENAXHIMI I EVENTEVE
        </p>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#111622] p-7 shadow-2xl shadow-black/20 sm:p-10">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/[0.07]">
          <ShieldAlert className="h-9 w-9 text-amber-300" strokeWidth={1.6} />
        </div>

        {/* Status */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-3 py-1.5 text-xs font-medium text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Qasja e kufizuar
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
          Llogaria juaj është pezulluar
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-400">
          Aktualisht, qasja në llogarinë tuaj HALLEVO është e kufizuar për arsye shkeljeve të rregullave.
          Nëse mendoni se ky kufizim
          është bërë gabimisht, ju lutemi kontaktoni ekipin tonë.
        </p>

        {/* Help information */}
        <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
          <p className="text-sm font-semibold text-slate-200">
            Si mund t'ju ndihmojmë?
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-400">
            Na kontaktoni për sqarime ose për të kërkuar rishikimin
            e statusit të llogarisë suaj.
          </p>
        </div>

        {/* Email contact */}
        <Link
          href="mailto:hello@hallevo.com"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white transition-colors duration-200 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111622]"
        >
          <Mail className="h-5 w-5 shrink-0" />
          <span className="text-sm">Kontakto ekipin tonë</span>
        </Link>

        {/* Email address */}
        <p className="mt-3 text-sm text-slate-400">
          hello@hallevo.com
        </p>

        {/* Phone contact */}
        <a
          href="tel:+38349881100"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
        >
          <span className="text-base" aria-hidden="true">☎</span>
          049 88 11 00
        </a>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          Kur na kontaktoni, ju lutemi përfshini emailin e llogarisë
          suaj që të mund t'ju ndihmojmë më shpejt.
        </p>
      </div>

      {/* Footer */}
      <p className="relative mt-7 text-xs text-slate-600">
        HALLEVO · Jemi këtu për t'ju ndihmuar
      </p>
    </div>
  );
}
