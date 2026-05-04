import React, { useState, useRef } from 'react';
import { Upload, Camera, ArrowRight, Volume2, Sparkles, X, FileText, ImageIcon, Scan, Cpu, Layers } from 'lucide-react';
import { LANGUAGES, voiceLangMap } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import Tesseract from 'tesseract.js';
import { cn } from '../utils/cn';

export const ImageTranslate: React.FC = () => {
  const [targetLang, setTargetLang] = useState('ja');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [translation, setTranslation] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Japanese';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        runOCR(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runOCR = async (imageSrc: string) => {
    setIsProcessing(true);
    setProgress(0);
    setTranslation('');
    
    try {
      const result = await Tesseract.recognize(imageSrc, 'eng+hin+ara+chi_sim+jpn+kor', {
        logger: m => {
          if (m.status === 'recognizing text') setProgress(Math.floor(m.progress * 100));
        }
      });
      setOcrText(result.data.text);
    } catch (error) {
      console.error("OCR_Fault:", error);
      setOcrText("SYSTEM_ERROR: Optical scan failed to resolve characters.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!ocrText.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const msg = [{ role: 'user', content: ocrText }];
      const result = await chatWithGroq(msg, targetLangName, 'Neutral');
      setTranslation(result);
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
    <div className="h-full bg-[#020408] p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-8 animate-msgIn">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <Scan className="text-[#00D1FF]" size={28} />
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Visual_OCR</h2>
             </div>
             <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em] pl-10">Multi-Script Extraction // v3.1</p>
           </div>

           <div className="flex items-center gap-4 bg-[#0A0F1D] px-6 py-3 rounded-2xl border border-white/5 shadow-premium">
              <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em]">Target_Synthesis:</span>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black text-[#00D1FF] focus:ring-0 cursor-pointer uppercase tracking-widest"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-[#0A0F1D]">{lang.flag} {lang.name.toUpperCase()}</option>
                ))}
              </select>
           </div>
        </div>

        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-[450px] border-2 border-dashed border-white/5 hover:border-[#00D1FF]/40 rounded-[40px] transition-all duration-500 flex flex-col items-center justify-center cursor-pointer bg-[#0A0F1D]/30 hover:bg-[#00D1FF]/5 overflow-hidden"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            {/* Animated Glow in Corner */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00D1FF]/5 blur-[80px] rounded-full group-hover:bg-[#00D1FF]/10 transition-all" />
            
            <div className="w-24 h-24 rounded-[32px] bg-[#0D1220] flex items-center justify-center mb-8 border border-white/5 shadow-premium group-hover:scale-110 group-hover:border-[#00D1FF]/30 transition-all duration-500">
              <Upload className="text-[#00D1FF]" size={36} />
            </div>
            
            <div className="space-y-3 text-center">
               <h3 className="text-2xl font-bold text-white tracking-tight italic">Initiate Optical Scan</h3>
               <p className="text-[#475569] font-mono text-[10px] tracking-[0.4em] uppercase">JPG · PNG · WEBP // Drag & Drop Module</p>
            </div>
            
            <button className="mt-10 btn-outline flex items-center gap-3 py-4 px-10 text-[10px] font-black tracking-widest bg-[#0A0F1D]">
              <Camera size={20} strokeWidth={2.5} /> ACTIVATE CAMERA
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-msgIn">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image Scan Visualization */}
                <div className="relative group card p-6 bg-[#0A0F1D] flex flex-col items-center justify-center border-white/5 overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.03),transparent)]" />
                   <img src={image} alt="Source" className="max-h-[450px] w-full object-contain rounded-2xl shadow-premium z-10" />
                   
                   <button 
                     onClick={() => setImage(null)}
                     className="absolute top-8 right-8 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white hover:text-[#FF4757] transition-all z-20 border border-white/10"
                   >
                     <X size={20} />
                   </button>

                   {isProcessing && progress < 100 && (
                     <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[32px] z-30">
                        <div className="relative w-64 h-3 bg-[#0D1220] rounded-full overflow-hidden mb-6 border border-white/5">
                           <div className="h-full bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6] transition-all duration-300 shadow-[0_0_15px_#00D1FF]" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <span className="font-mono text-[11px] font-black text-[#00D1FF] uppercase tracking-[0.5em] animate-pulse">Scanning Intel // {progress}%</span>
                           <div className="h-1 w-1 rounded-full bg-[#00D1FF] animate-ping" />
                        </div>
                     </div>
                   )}
                </div>

                {/* Data Extraction Terminal */}
                <div className="flex flex-col gap-6 h-[510px]">
                   <div className="flex-1 card flex flex-col gap-6 bg-[#0A0F1D]/80 relative overflow-hidden border-white/5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Layers size={16} className="text-[#00D1FF]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Extracted_Buffer</span>
                         </div>
                         {isProcessing && <Cpu className="text-[#00D1FF] animate-spin" size={16} />}
                      </div>
                      
                      <textarea 
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                        className="flex-1 bg-[#05070B] border border-white/5 rounded-2xl p-6 text-sm text-[#94A3B8] focus:border-[#00D1FF]/40 resize-none font-mono leading-relaxed scrollbar-hide"
                        placeholder="Optical data stream will manifest here..."
                      />

                      <button 
                        onClick={handleTranslate}
                        disabled={!ocrText.trim() || isProcessing}
                        className="btn-primary w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-glow"
                      >
                         SYNTHESIZE TRANSLATION <ArrowRight size={20} strokeWidth={2.5} />
                      </button>
                   </div>
                </div>
             </div>

             {/* Output Synthesis Console */}
             {translation && (
               <div className="card p-12 border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#8B5CF6]/10 blur-[60px] rounded-full" />
                  <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex items-center gap-3">
                       <Sparkles size={18} className="text-[#8B5CF6]" />
                       <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.4em]">Neural Output Synthesis</span>
                    </div>
                    <p className="text-4xl text-white font-bold leading-tight tracking-tight">{translation}</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <button onClick={() => navigator.clipboard.writeText(translation)} className="btn-outline border-white/10 text-[#475569] hover:text-white py-3 px-8 text-[10px] font-black uppercase tracking-widest">CLONE_RESULT</button>
                      <button onClick={() => speak(translation)} className="btn-outline border-white/10 text-[#475569] hover:text-white py-3 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Volume2 size={16} /> AUDIO_LINK</button>
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Global Status Footer */}
        <div className="flex items-center justify-center gap-10 pt-10 opacity-30 text-[9px] font-black uppercase tracking-[0.4em] text-[#475569]">
           <span>Scanner_Ready: 1.0</span>
           <span>Neural_Acc: 0.98</span>
           <span>Protocol: Secure</span>
        </div>
      </div>
    </div>
  );
};
