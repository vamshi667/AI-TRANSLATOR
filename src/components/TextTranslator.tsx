import { useState, useEffect } from 'react';
import { Copy, Volume2, ArrowRightLeft, Sparkles, Check, Share2 } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { cn } from '../utils/cn';

export const TextTranslator = ({ formality, style }: { formality: string, style: string }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { speak } = useTextToSpeech();

  // Debounced translation
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!sourceText.trim()) {
        setTranslatedText('');
        return;
      }

      setIsTranslating(true);
      setTranslatedText(''); // clear previous

      try {
        await chatWithGroq(
          [{ role: 'user', content: sourceText }],
          targetLang,
          sourceLang,
          formality,
          style,
          (chunk) => {
            setTranslatedText(chunk);
          }
        );
      } catch (error) {
        console.error("Translation error", error);
        setTranslatedText("TRANSLATION ERROR — SIGNAL LOST");
      } finally {
        setIsTranslating(false);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [sourceText, sourceLang, targetLang, formality, style]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSwap = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setSourceText(translatedText);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full relative z-10">
      
      {/* Input Panel */}
      <div className="flex-1 glass border border-cyber-border rounded-2xl flex flex-col overflow-hidden corner-accent group hover:border-neon-cyan/50 transition-colors">
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
          <select 
            value={sourceLang} 
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-transparent text-gray-200 font-orbitron font-bold text-sm focus:outline-none tracking-widest uppercase cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
          <div className="text-xs font-orbitron text-gray-500">
            {sourceText.length} / 5000
          </div>
        </div>
        
        <div className="flex-1 p-4 relative">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value.substring(0, 5000))}
            placeholder="Initialize data transfer..."
            className="w-full h-full min-h-[200px] bg-transparent resize-none focus:outline-none text-gray-100 placeholder-gray-600 text-lg"
          />
          {sourceText && (
            <button 
              onClick={() => setSourceText('')}
              className="absolute top-4 right-4 w-6 h-6 rounded-full glass border border-gray-600 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="p-3 border-t border-white/10 flex justify-between bg-black/20">
          <button 
            onClick={() => speak(sourceText, sourceLang === 'auto' ? 'en' : sourceLang)}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex items-center justify-center -my-6 md:-mx-6 z-20">
        <button 
          onClick={handleSwap}
          className="p-3 glass-strong border border-neon-violet rounded-full text-neon-violet hover:bg-neon-violet/20 hover:text-white transition-all glow-violet hover:scale-110 active:scale-95"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Output Panel */}
      <div className="flex-1 glass border border-cyber-border rounded-2xl flex flex-col overflow-hidden corner-accent group hover:border-neon-violet/50 transition-colors">
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-transparent text-neon-violet font-orbitron font-bold text-sm focus:outline-none tracking-widest uppercase cursor-pointer"
          >
            {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
          {isTranslating && (
             <Sparkles className="w-4 h-4 text-neon-cyan animate-spin" />
          )}
        </div>
        
        <div className="flex-1 p-4 relative bg-black/10">
          {translatedText ? (
            <div className={cn(
              "w-full h-full text-lg whitespace-pre-wrap overflow-y-auto scrollbar-hide",
              translatedText === "TRANSLATION ERROR — SIGNAL LOST" ? "text-red-500 font-bold glitch" : "text-gray-100"
            )}>
              {translatedText}
              {isTranslating && <span className="inline-block w-2 h-5 ml-1 bg-neon-cyan animate-pulse" />}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-orbitron text-sm tracking-widest">
              Awaiting neural input...
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-white/10 flex justify-end gap-2 bg-black/20">
          <button 
            onClick={() => speak(translatedText, targetLang)}
            disabled={!translatedText}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-neon-violet transition-colors disabled:opacity-30"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button 
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-neon-violet transition-colors disabled:opacity-30"
            disabled={!translatedText}
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={copyToClipboard}
            disabled={!translatedText}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-neon-cyan transition-colors disabled:opacity-30"
          >
            {isCopied ? <Check className="w-5 h-5 text-neon-green glow-text-cyan" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

    </div>
  );
};
