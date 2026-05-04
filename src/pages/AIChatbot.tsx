import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Image as ImageIcon, Copy, Volume2, 
  RotateCcw, ThumbsUp, ThumbsDown, Sparkles, Terminal, Cpu
} from 'lucide-react';
import { LANGUAGES, voiceLangMap } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import { cn } from '../utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [targetLang, setTargetLang] = useState('ja');
  const [formality, setFormality] = useState('Neutral');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Japanese';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: input });

      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      await chatWithGroq(history, targetLangName, formality, (chunk) => {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = chunk;
          return newMsgs;
        });
      });

      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].isStreaming = false;
        return newMsgs;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "SYSTEM_ERROR: Neural bridge failed to stabilize." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLangMap[targetLangName] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const suggestions = [
    "Translate: \"The future is neural\"", "Explain Japanese honorifics", "Formal meeting request in French", "Italian slang for 'cool'"
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#020408]">
      {/* Local Controls Area */}
      <div className="h-12 border-b border-white/[0.03] px-10 flex items-center justify-between bg-[#05070B]/50 sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#00D1FF]" />
            <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em]">Neural Engine v3.3.0</span>
          </div>
          <div className="h-4 w-px bg-white/5" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#94A3B8]">Target:</span>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-[10px] font-black text-[#00D1FF] border-none p-0 focus:ring-0 cursor-pointer uppercase tracking-widest"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-[#05070B]">{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {['Casual', 'Neutral', 'Formal'].map(level => (
            <button
              key={level}
              onClick={() => setFormality(level)}
              className={cn(
                "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all border border-transparent",
                formality === level 
                  ? "bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30 shadow-glow" 
                  : "text-[#475569] hover:text-[#94A3B8]"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
        <div className="max-w-[1200px] mx-auto w-full">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-10 animate-msgIn">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00D1FF]/20 blur-[100px] rounded-full" />
                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#0D1220] to-[#05070B] border border-white/10 flex items-center justify-center relative shadow-premium">
                  <Terminal className="text-[#00D1FF]" size={48} />
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-5xl font-display font-black text-white tracking-tighter italic uppercase">Neural Language Interface</h3>
                <p className="text-[#94A3B8] max-w-xl mx-auto text-lg leading-relaxed font-light">System ready for high-fidelity multilingual processing. Submit a translation request or linguistic query to begin.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {suggestions.map(s => (
                  <button 
                    key={s}
                    onClick={() => setInput(s)}
                    className="px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[12px] font-black text-[#475569] hover:border-[#00D1FF]/40 hover:text-[#00D1FF] hover:bg-[#00D1FF]/5 transition-all uppercase tracking-[0.2em]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("message flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                {msg.role === 'user' ? (
                  <div className="max-w-[70%] group">
                    <div className="bg-[#0D1220] border border-white/10 p-6 rounded-3xl rounded-tr-none text-[16px] text-white shadow-2xl">
                      {msg.content}
                    </div>
                    <div className="mt-3 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.3em]">User_Log // SYNCED</span>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[90%] w-full group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-[#00D1FF]" />
                      </div>
                      <span className="lang-badge font-black border-[#00D1FF]/20 text-[#00D1FF] bg-[#00D1FF]/5 px-4 py-1.5 text-[11px]">
                        {targetLangName.toUpperCase()} // SYNTHESIS
                      </span>
                    </div>
                    
                    <div className="text-3xl font-medium leading-[1.4] text-[#F8FAFC] whitespace-pre-wrap pl-14">
                      {msg.content}
                    </div>

                    <div className="flex items-center gap-3 pl-14 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                      <ActionBtn icon={<Copy size={16} />} onClick={() => navigator.clipboard.writeText(msg.content)} />
                      <ActionBtn icon={<Volume2 size={16} />} onClick={() => speak(msg.content)} />
                      <ActionBtn icon={<RotateCcw size={16} />} />
                      <div className="w-px h-4 bg-white/10 mx-3" />
                      <ActionBtn icon={<ThumbsUp size={16} />} />
                      <ActionBtn icon={<ThumbsDown size={16} />} />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex items-center gap-5 pl-14 text-[#00D1FF]">
              <div className="flex gap-2">
                <span className="typing-dot w-2 h-2" />
                <span className="typing-dot w-2 h-2" />
                <span className="typing-dot w-2 h-2" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.6em] opacity-60">Neural bridge active...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Section - Console Style */}
      <div className="p-12 border-t border-white/[0.03] bg-[#05070B] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative group shadow-premium">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00D1FF]/30 to-[#8B5CF6]/30 rounded-3xl blur-md opacity-20 group-focus-within:opacity-100 transition-opacity" />
            
            <div className="relative flex items-end gap-5 bg-[#0D1220] border border-white/10 rounded-3xl p-5 focus-within:border-[#00D1FF]/40 transition-all">
              <div className="flex flex-col gap-2 pb-1">
                 <button className="p-4 text-[#475569] hover:text-[#00D1FF] transition-colors rounded-2xl hover:bg-white/[0.03]"><Mic size={24} /></button>
                 <button className="p-4 text-[#475569] hover:text-[#00D1FF] transition-colors rounded-2xl hover:bg-white/[0.03]"><ImageIcon size={24} /></button>
              </div>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Submit neural query or text for translation..."
                className="flex-1 bg-transparent border-none p-4 h-20 text-xl focus:ring-0 resize-none font-medium placeholder:text-[#475569] leading-relaxed"
              />

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "p-6 rounded-2xl transition-all shadow-glow",
                  input.trim() 
                    ? "bg-[#00D1FF] text-[#020408] hover:scale-105 active:scale-95" 
                    : "bg-[#141B2D] text-[#475569] cursor-not-allowed"
                )}
              >
                <Send size={28} strokeWidth={3} />
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between px-4">
             <div className="flex items-center gap-10">
                <StatusDot label="API_LINK_OK" color="#10B981" />
                <StatusDot label="PROC_LOAD: LOW" color="#10B981" />
                <StatusDot label="NEURAL_SYNC: ON" color="#00D1FF" />
             </div>
             <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em]">LLAMA-3-70B // QUANTUM CORE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-3.5 rounded-xl text-[#475569] hover:text-[#00D1FF] hover:bg-[#00D1FF]/5 transition-all border border-transparent hover:border-[#00D1FF]/20"
  >
    {icon}
  </button>
);

const StatusDot = ({ label, color }: { label: string, color: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }} />
    <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.3em]">{label}</span>
  </div>
);
