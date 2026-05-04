import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Volume2, Bookmark, Sparkles } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { cn } from '../utils/cn';

export const ClassicTranslator: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ja');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [formality, setFormality] = useState('Neutral');

  const handleSwap = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setInput(output);
    }
  };

  const handleTranslate = () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    // Simulate translation
    setTimeout(() => {
      setOutput('こんにちは、世界');
      setIsTranslating(false);
    }, 1000);
  };

  return (
    <div className="h-full bg-bg-primary p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-black tracking-tight text-white uppercase italic">
            Classic Translator
          </h2>
          
          <div className="flex items-center gap-2 bg-bg-secondary p-1 rounded-lg border border-border-default">
            {['Casual', 'Neutral', 'Formal'].map(level => (
              <button
                key={level}
                onClick={() => setFormality(level)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                  formality === level 
                    ? "bg-accent-cyan text-bg-primary shadow-lg" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border-default border border-border-default rounded-3xl overflow-hidden shadow-2xl shadow-accent-cyan/5">
          {/* Source Panel */}
          <div className="bg-bg-secondary p-8 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-transparent text-sm font-bold text-text-primary focus:outline-none cursor-pointer border-b border-accent-cyan/30 pb-1"
              >
                <option value="auto">🌐 AUTO-DETECT</option>
                {LANGUAGES.filter(l => l.code !== 'auto').map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.name.toUpperCase()}</option>
                ))}
              </select>
              <span className="text-[10px] font-mono text-text-secondary">{input.length} / 5000</span>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to translate..."
              className="flex-1 min-h-[300px] bg-transparent text-xl text-white placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed"
            />
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl glass-card hover:text-accent-cyan transition-all">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Swap Divider (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-[45%] -translate-x-1/2 z-20">
            <button 
              onClick={handleSwap}
              className="p-4 rounded-full bg-accent-cyan text-bg-primary shadow-[0_0_20px_rgba(0,200,255,0.4)] hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowRightLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Target Panel */}
          <div className="bg-bg-secondary p-8 flex flex-col space-y-6 border-l border-border-default">
            <div className="flex items-center justify-between">
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-transparent text-sm font-bold text-accent-cyan focus:outline-none cursor-pointer border-b border-accent-cyan/30 pb-1"
              >
                {LANGUAGES.filter(l => l.code !== 'auto').map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.name.toUpperCase()}</option>
                ))}
              </select>
              {isTranslating && <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />}
            </div>
            
            <div className={cn(
              "flex-1 min-h-[300px] text-xl leading-relaxed transition-all",
              output ? "text-white" : "text-text-secondary/30 font-display italic"
            )}>
              {output || "Translated text will appear here..."}
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl glass-card hover:text-accent-cyan transition-all disabled:opacity-30" disabled={!output}>
                  <Volume2 className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl glass-card hover:text-accent-cyan transition-all disabled:opacity-30" disabled={!output}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              
              <button className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-accent-violet transition-colors">
                <Bookmark className="w-4 h-4" /> SAVE TO PHRASEBOOK
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <button 
            onClick={handleTranslate}
            disabled={!input.trim() || isTranslating}
            className="btn-primary px-16 py-4 text-lg font-display flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? 'NEURAL PROCESSING...' : 'TRANSLATE'} <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
