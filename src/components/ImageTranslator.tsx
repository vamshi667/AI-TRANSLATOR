import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import Tesseract from 'tesseract.js';
import { cn } from '../utils/cn';

export const ImageTranslator = ({ formality, style }: { formality: string, style: string }) => {
  const [sourceLang, setSourceLang] = useState('eng'); // Tesseract needs specific codes, we'll default to eng
  const [targetLang, setTargetLang] = useState('es');
  
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setIsProcessing(true);
    setProgress(0);
    setExtractedText('');
    setTranslatedText('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imgData = e.target?.result as string;
      setImage(imgData);

      try {
        // Step 1: OCR Extraction
        const result = await Tesseract.recognize(
          imgData,
          sourceLang,
          { logger: m => {
              if (m.status === 'recognizing text') {
                setProgress(Math.floor(m.progress * 50)); // first 50% is OCR
              }
            } 
          }
        );
        
        const text = result.data.text.trim();
        setExtractedText(text);

        if (!text) {
          setTranslatedText("No text found in image.");
          setIsProcessing(false);
          return;
        }

        // Step 2: Translation
        setProgress(60);
        await chatWithGroq(
          [{ role: 'user', content: text }],
          targetLang,
          'auto',
          formality,
          style,
          (chunk) => {
             setTranslatedText(chunk);
             setProgress(80); // arbitrary progress while streaming
          }
        );
        setProgress(100);

      } catch (err) {
        console.error("OCR/Translation Error:", err);
        setTranslatedText("ERROR EXTRACTING/TRANSLATING IMAGE DATA");
      } finally {
        setIsProcessing(false);
        setTimeout(() => setProgress(0), 1000);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative z-10 p-2">
      
      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4 glass p-4 rounded-xl border border-cyber-border">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-orbitron text-xs">IMAGE OCR LANG:</span>
          <select 
            value={sourceLang} 
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-black/40 text-neon-cyan font-bold border border-cyber-border p-1 rounded"
          >
            <option value="eng">English</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="chi_sim">Chinese</option>
            <option value="jpn">Japanese</option>
            <option value="kor">Korean</option>
            <option value="rus">Russian</option>
          </select>
        </div>
        <span className="text-white font-bold">➔</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-orbitron text-xs">TRANSLATE TO:</span>
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-black/40 text-neon-violet font-bold border border-cyber-border p-1 rounded"
          >
            {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        
        {/* Dropzone / Image Preview */}
        <div className="flex flex-col h-full relative">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          />
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !image && fileInputRef.current?.click()}
            className={cn(
              "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden relative group",
              image ? "border-cyber-border glass" : "cursor-pointer border-gray-600 hover:border-neon-cyan glass hover:glow-cyan",
              isDragging && "border-neon-cyan glow-cyan bg-neon-cyan/10"
            )}
          >
            {image ? (
              <>
                <img src={image} alt="Uploaded" className="w-full h-full object-contain p-2" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); setExtractedText(''); setTranslatedText(''); }}
                  className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:text-red-500"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <UploadCloud className={cn("w-16 h-16 mx-auto mb-4", isDragging ? "text-neon-cyan pulse-neon" : "text-gray-500 group-hover:text-neon-cyan")} />
                <p className="font-orbitron font-bold text-lg text-gray-300">Drop Image Data Here</p>
                <p className="text-sm text-gray-500 mt-2">or click to browse systems</p>
              </div>
            )}

            {/* Scanline overlay when processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none">
                <div className="w-full h-1 bg-neon-cyan shadow-[0_0_15px_#00F5FF] absolute top-0 animate-[scan_2s_linear_infinite]" />
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 glass rounded-2xl border border-cyber-border p-4 flex flex-col relative corner-accent">
            <h3 className="text-xs font-orbitron text-gray-500 mb-2 uppercase flex justify-between">
              Extracted Raw Data
              {isProcessing && progress < 50 && <span className="text-neon-cyan animate-pulse">Scanning... {progress * 2}%</span>}
            </h3>
            <textarea 
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="flex-1 bg-black/20 rounded-lg p-3 text-sm text-gray-300 font-mono resize-none focus:outline-none focus:border focus:border-neon-cyan"
              placeholder="OCR extracted text will appear here. You can manually correct errors before translation."
            />
          </div>

          <div className="flex-1 glass rounded-2xl border border-neon-violet/30 p-4 flex flex-col corner-accent relative">
            <h3 className="text-xs font-orbitron text-gray-500 mb-2 uppercase flex justify-between">
              Translated Output
              {isProcessing && progress >= 50 && <span className="text-neon-violet animate-pulse">Decrypting...</span>}
            </h3>
            <div className="flex-1 bg-black/20 rounded-lg p-3 text-lg text-white overflow-y-auto">
              {translatedText || <span className="text-gray-600 font-orbitron text-sm">Awaiting text extraction...</span>}
              {isProcessing && progress >= 50 && progress < 100 && <span className="inline-block w-2 h-4 ml-1 bg-neon-violet animate-pulse" />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
