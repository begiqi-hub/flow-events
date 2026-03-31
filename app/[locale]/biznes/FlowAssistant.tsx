"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, MessageSquare } from "lucide-react";
import { askAssistantAction } from "./assistantActions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FlowAssistant({ locale }: { locale: string }) {
  const router = useRouter();
  
  // SHTUAM BLLOKUESIN E SERVERIT
  const [isMounted, setIsMounted] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string, link?: string, linkText?: string}[]>([
    { role: 'bot', text: "Përshëndetje! Unë jam Flow Assistant. Mund të më pyesni psh:\n- A kemi të lirë më (psh. 15 Gusht?)\n- Kush na ka borxh?\n- Çfarë eventesh kemi sot?" }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMounted(true); // Aktivizohet vetëm kur të jemi në Browser
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText("");
    setIsTyping(true);

    const response = await askAssistantAction(text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { 
      role: 'bot', 
      text: response.reply,
      link: response.actionLink,
      linkText: response.actionText 
    }]);
  };

  // NËSE NUK JEMI NË BROWSER, MOS VIZATO ASGJË (Eviton Crash-in e Serverit)
  if (!isMounted) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[9998] bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 z-[9999] w-[360px] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Flow Assistant <span className="bg-white text-blue-600 text-[9px] px-1.5 py-0.5 rounded uppercase ml-1">Beta</span></h3>
              <p className="text-[11px] text-blue-100 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online dhe Gati
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 bg-[#F8F9FA] overflow-y-auto min-h-[350px] max-h-[450px] space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-[13px] font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                {msg.text}
                
                {msg.link && msg.linkText && (
                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/${locale}/biznes/${msg.link}`);
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full border border-blue-200"
                    >
                      {msg.linkText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex gap-1.5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-2.5 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button onClick={() => handleSend("A kemi evente sot?")} className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">📅 Cfarë kemi sot?</button>
          <button onClick={() => handleSend("Kërkesat nga recepsioni")} className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">🔔 Kërkesat</button>
          <button onClick={() => handleSend("Cili është fitimi këtë muaj?")} className="shrink-0 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">📊 Raporti & Fitimi</button>
          <button onClick={() => handleSend("Kush na ka borxh?")} className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">💰 Borxhet</button>
          <button onClick={() => handleSend("A jemi bosh më 15 Gusht?")} className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">🔎 Liro sallën</button>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-2xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <input 
              type="text" 
              placeholder="Pyet Flow Assistant..." 
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-gray-700 font-medium"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white w-10 h-10 flex items-center justify-center rounded-xl transition-colors shadow-sm"
            >
              <Send size={16} className={inputText.trim() ? "translate-x-0.5" : ""} />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}