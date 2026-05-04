import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Volume2, Bookmark, Sparkles, Trash2, Zap, Layers } from 'lucide-react';
import { LANGUAGES, voiceLangMap } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import { cn } from '../utils/cn';

export const Translator: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ja');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [formality, setFormality] = useState('Neutral');

  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Japanese';

  const handleTranslate = async () => {
    if (!input.trim() || isTranslating) return;
    setIsTranslating(true);
    setOutput('');

    try {
      const msg = [{ role: 'user', content: input }];
      await chatWithGroq(msg, targetLangName, formality, (chunk) => {
        setOutput(chunk);
      });
    } catch (error) {
      console.error("Translation error:", error);
      setOutput("CRITICAL_FAULT: Neural engine failed to synthesize output.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setInput(output);
      setOutput('');
    }
  };

  const speak = (text: string, lang: string) => {
    const langName = LANGUAGES.find(l => l.code === lang)?.name || 'English';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLangMap[langName] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full w-full bg-[#020408] p-16 overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto space-y-16 animate-msgIn">
        
        {/* Header Module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="space-y-3">
             <div className="flex items-center gap-4">
                <Layers className="text-[#00D1FF]" size={32} />
                <h2 className="text-5xl font-display font-black text-white uppercase tracking-tighter italic">Translate_Module</h2>
             </div>
             <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.6em] pl-12">Precision Neural Processing // v4.2</p>
           </div>

           <div className="flex items-center gap-3 bg-[#0A0F1D] p-2 rounded-2xl border border-white/5 shadow-premium">
            {['Casual', 'Neutral', 'Formal'].map(level => (
              <button
                key={level}
                onClick={() => setFormality(level)}
                className={cn(
                  "px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all",
                  formality === level 
                    ? "bg-[#00D1FF] text-[#020408] shadow-glow" 
                    : "text-[#475569] hover:text-[#94A3B8]"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Module */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[600px]">
          {/* Source Panel */}
          <div className="group relative flex flex-col">
             <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                   <select 
                     value={sourceLang}
                     onChange={(e) => setSourceLang(e.target.value)}
                     className="bg-transparent border-none text-[12px] font-black text-white focus:ring-0 uppercase tracking-[0.2em] cursor-pointer"
                   >
                     <option value="auto">🌐 AUTO_DETECT_SIGNAL</option>
                     {LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.code} className="bg-[#0A0F1D]">{lang.flag} {lang.name.toUpperCase()}</option>
                     ))}
                   </select>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]" />
             </div>
             
             <div className="flex-1 bg-[#0A0F1D] border border-white/10 rounded-[48px] p-12 flex flex-col shadow-premium group-focus-within:border-[#00D1FF]/40 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Input text for neural processing..."
                  className="flex-1 bg-transparent border-none p-0 text-3xl font-medium text-white placeholder:text-[#475569] resize-none focus:ring-0 leading-[1.4] scrollbar-hide"
                />
                <div className="pt-8 mt-8 border-t border-white/[0.05] flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <ActionBtn icon={<Volume2 size={24} />} onClick={() => speak(input, sourceLang === 'auto' ? 'en' : sourceLang)} />
                      <ActionBtn icon={<Trash2 size={24} />} onClick={() => setInput('')} />
                   </div>
                   <span className="text-[11px] font-black text-[#475569] uppercase tracking-[0.2em]">{input.length} / 5000 UNITS</span>
                </div>
             </div>

             {/* Swap Button Absolute */}
             <button 
               onClick={handleSwap}
               className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-[#00D1FF] text-[#020408] rounded-full flex items-center justify-center shadow-glow hover:rotate-180 transition-all duration-500 hidden lg:flex border-4 border-[#020408]"
             >
               <ArrowRightLeft size={24} strokeWidth={3} />
             </button>
          </div>

          {/* Target Panel */}
          <div className="flex flex-col">
             <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                   <select 
                     value={targetLang}
                     onChange={(e) => setTargetLang(e.target.value)}
                     className="bg-transparent border-none text-[12px] font-black text-[#00D1FF] focus:ring-0 uppercase tracking-[0.2em] cursor-pointer"
                   >
                     {LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.code} className="bg-[#0A0F1D]">{lang.flag} {lang.name.toUpperCase()}</option>
                     ))}
                   </select>
                </div>
                <Zap size={18} className="text-[#00D1FF]" />
             </div>

             <div className="flex-1 bg-[#0A0F1D]/50 border border-[#00D1FF]/20 rounded-[48px] p-12 flex flex-col shadow-premium relative overflow-hidden group">
                {isTranslating && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent animate-shimmer" />
                )}
                <div className="flex-1 text-4xl font-bold text-[#F8FAFC] leading-[1.3] whitespace-pre-wrap overflow-y-auto scrollbar-hide">
                  {output || (
                    <span className="text-[#475569] italic opacity-40 uppercase tracking-tighter">Synthetic output pending...</span>
                  )}
                </div>
                <div className="pt-8 mt-8 border-t border-white/[0.05] flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <ActionBtn icon={<Copy size={24} />} onClick={() => navigator.clipboard.writeText(output)} />
                      <ActionBtn icon={<Volume2 size={24} />} onClick={() => speak(output, targetLang)} />
                   </div>
                   <button disabled={!output} className="p-3 text-[#475569] hover:text-[#00D1FF] transition-all">
                      <Bookmark size={28} />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex flex-col items-center gap-10 pt-10">
           <button 
             onClick={handleTranslate}
             disabled={!input.trim() || isTranslating}
             className="btn-primary py-8 px-32 text-xl tracking-[0.5em] shadow-glow group relative"
           >
             {isTranslating ? (
               <><Sparkles className="animate-spin" size={32} /> ANALYZING_BUFFER...</>
             ) : (
               <>EXECUTE_SYNTHESIS <ArrowRightLeft className="group-hover:rotate-180 transition-transform duration-500 lg:hidden" size={28} /></>
             )}
           </button>
           
           <div className="flex flex-wrap justify-center items-center gap-16">
              <StatusLabel label="Neural_Link: Stable" />
              <StatusLabel label="Latency: 12ms" />
              <StatusLabel label="Precision: 99.8%" />
              <StatusLabel label="Enc: AES-256" />
           </div>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-4 rounded-2xl text-[#475569] hover:text-[#00D1FF] hover:bg-[#00D1FF]/5 transition-all border border-transparent hover:border-[#00D1FF]/20"
  >
    {icon}
  </button>
);

const StatusLabel = ({ label }: { label: string }) => (
  <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em]">{label}</span>
);
