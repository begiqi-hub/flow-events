"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = {
  role: 'assistant' | 'user';
  content: string;
  actionLink?: string;
  actionText?: string;
};

export default function FlowAssistant({ locale, userRole = "admin" }: { locale: string, userRole?: string }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Përshëndetje! Unë jam Hallevo AI. 🌟\n\nJam këtu për t'ju ndihmuar me menaxhimin e biznesit. Mund të më kërkoni të bëj rezervime, të shoh raportet, borxhet, ose disponueshmërinë e datave (psh. 'Çfarë kemi me 1 prill?')." 
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    const newConversation = [...messages, userMessage];
    
    setMessages(newConversation);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/flow-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newConversation, locale: locale }),
      });

      if (!res.ok) throw new Error("Gabim në lidhje");

      const data = await res.json();

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        actionLink: data.actionLink,
        actionText: data.actionText 
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Ndjesë, pati një shkëputje me serverin. Ju lutem provoni sërish pas pak." 
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`print:hidden fixed bottom-6 right-6 z-[99998] bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      <div className={`print:hidden fixed bottom-6 right-6 z-[99999] w-[360px] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner relative overflow-hidden">
              <Bot size={20} className="relative z-10" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                Hallevo AI <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider border border-white/20"></span>
              </h3>
              <p className="text-[11px] text-indigo-100 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Asistenti juaj virtual
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 bg-slate-50 overflow-y-auto min-h-[350px] max-h-[450px] space-y-5 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] font-medium shadow-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-100 text-slate-700 rounded-bl-sm'
              }`}>
                {msg.content}
                
                {msg.actionLink && msg.actionText && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/${locale}/biznes/${msg.actionLink}`);
                      }}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full border border-indigo-100 flex items-center justify-center gap-2"
                    >
                      {msg.actionText} <Sparkles size={14} className="text-indigo-500"/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2 text-indigo-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold text-slate-400">Po mendon...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <button onClick={() => handleSend("A kemi evente sot?")} className="shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors shadow-sm">📅 Çfarë kemi sot?</button>
          <button onClick={() => handleSend("Dua te bllokoj nje date")} className="shrink-0 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors shadow-sm">✨ Shto Rezervim</button>
          
          <button onClick={() => handleSend("A ka mbet kush pa paguar gje?")} className="shrink-0 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors shadow-sm">💰 Borxhet</button>
          
          {userRole !== 'manager' && (
             <button onClick={() => handleSend("Sa lek kemi bo kete muaj?")} className="shrink-0 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors shadow-sm">📊 Raporti i Muajit</button>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all"
          >
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Jepni një komandë ose pyesni..." 
              className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Send size={16} className={inputText.trim() ? "translate-x-0.5" : ""} />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}