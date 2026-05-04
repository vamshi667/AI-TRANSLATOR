import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2, Sparkles, ArrowRight, Zap, Activity, Waves } from 'lucide-react';
import { LANGUAGES, voiceLangMap } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import { cn } from '../utils/cn';

export const VoiceTranslate: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ja');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);

  const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || 'English';
  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Japanese';

  useEffect(() => {
    if (isListening) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let i = 0; i < canvas.width; i++) {
          const amplitude = isListening ? 35 : 2;
          const frequency = 0.04;
          const y = canvas.height / 2 + Math.sin(i * frequency + Date.now() * 0.01) * Math.random() * amplitude;
          ctx.lineTo(i, y);
        }
        
        ctx.strokeStyle = '#00D1FF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        animationId = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(animationId);
    }
  }, [isListening]);

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("System_Fault: Voice recognition disabled on this hardware.");

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLangMap[sourceLangName] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setTranslation('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) processTranslation(transcript);
    };

    recognition.onerror = (e: any) => {
      console.error("Link_Error:", e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const processTranslation = async (text: string) => {
    setIsProcessing(true);
    try {
      const msg = [{ role: 'user', content: text }];
      const result = await chatWithGroq(msg, targetLangName, 'Neutral');
      setTranslation(result);
      speak(result);
    } catch (error) {
      console.error("Neural_Process_Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLangMap[targetLangName] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full bg-[#020408] flex flex-col items-center justify-center p-12 text-center space-y-12 overflow-y-auto scrollbar-hide">
      <div className="space-y-4 animate-msgIn">
        <div className="flex items-center justify-center gap-3 mb-2">
           <Waves className="text-[#00D1FF]" size={24} />
           <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Voice_Link</h2>
        </div>
        <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.6em] mb-8">Neural Speech Bridge // v2.0</p>
        
        <div className="flex items-center justify-center gap-8 bg-[#0A0F1D] p-5 rounded-2xl border border-white/5 shadow-premium">
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-white focus:ring-0 uppercase tracking-widest cursor-pointer">
             {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#0A0F1D]">{l.flag} {l.name}</option>)}
          </select>
          <div className="w-10 h-10 rounded-full bg-[#00D1FF]/10 flex items-center justify-center">
             <ArrowRight size={18} className="text-[#00D1FF]" />
          </div>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-[#00D1FF] focus:ring-0 uppercase tracking-widest cursor-pointer">
             {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#0A0F1D]">{l.flag} {l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-16 w-full max-w-2xl">
        {/* Core Mic Visualizer */}
        <div className="relative group">
          {isListening && (
            <>
              <div className="mic-ring border-[#00D1FF]/40" />
              <div className="mic-ring border-[#00D1FF]/20" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -inset-10 bg-[#00D1FF]/5 blur-3xl rounded-full" />
            </>
          )}
          <button
            onClick={toggleMic}
            className={cn(
              "w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 z-10 relative shadow-premium border-2 group",
              isListening 
                ? "bg-[#00D1FF]/5 border-[#00D1FF] text-[#00D1FF]" 
                : "bg-[#0A0F1D] border-white/10 text-[#94A3B8] hover:border-[#00D1FF] hover:text-[#00D1FF] hover:scale-105"
            )}
          >
            {isListening ? <Activity size={72} strokeWidth={1.5} /> : <Mic size={72} strokeWidth={1.5} />}
            <span className="mt-4 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">
               {isListening ? 'LINK_ACTIVE' : 'START_LINK'}
            </span>
          </button>
        </div>

        {/* Waveform Module */}
        <div className="w-full space-y-4">
           <div className="relative h-28 w-full bg-[#05070B] border border-white/5 rounded-[32px] overflow-hidden flex items-center px-8 shadow-premium">
              <canvas ref={canvasRef} width={800} height={120} className={cn("w-full h-full transition-opacity duration-500", isListening ? 'opacity-100' : 'opacity-20')} />
              {!isListening && !isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em] italic">Synthetic Waveform Idle</span>
                 </div>
              )}
              {isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[#05070B]/80 backdrop-blur-sm">
                    <Sparkles className="text-[#00D1FF] animate-spin mr-3" size={18} />
                    <span className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.5em] animate-pulse">Neural Processing...</span>
                 </div>
              )}
           </div>
        </div>

        {/* Data Output Modules */}
        {(transcript || translation) && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-msgIn">
             <div className="card text-left space-y-4 bg-[#0A0F1D]/50 border-white/5">
                <span className="lang-badge">Input Transcription</span>
                <p className="text-lg text-[#94A3B8] font-medium leading-relaxed italic">"{transcript || 'Waiting for signal...'}"</p>
             </div>

             {translation && (
               <div className="card text-left space-y-5 border-[#00D1FF]/20 bg-[#00D1FF]/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                     <Zap size={20} className="text-[#00D1FF]" />
                  </div>
                  <span className="lang-badge border-[#00D1FF]/30 text-[#00D1FF] bg-[#00D1FF]/10">Neural Synthesis</span>
                  <p className="text-2xl text-white font-bold leading-tight">{translation}</p>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => speak(translation)} className="btn-outline py-2.5 px-6 text-[10px] font-black uppercase tracking-widest border-[#00D1FF]/30"><Volume2 size={16} /> REPLAY_LINK</button>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-10 pt-12 border-t border-white/[0.03] w-full max-w-xl justify-center">
         <StatusItem label="Lat_Link: 24ms" />
         <StatusItem label="Enc_Status: Secure" />
         <StatusItem label="Syn_Model: Llama-3" />
      </div>
    </div>
  );
};

const StatusItem = ({ label }: { label: string }) => (
  <span className="text-[9px] font-black text-[#475569] uppercase tracking-[0.3em]">{label}</span>
);
