import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Square, Sparkles } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { chatWithGroq } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

export const VoiceTranslator = ({ formality, style }: { formality: string, style: string }) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const { speak } = useTextToSpeech();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Fake waveform animation
  useEffect(() => {
    if (!isListening || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      
      for (let i = 0; i < canvas.width; i++) {
        const amplitude = 20 + Math.random() * 10;
        const frequency = 0.05;
        const y = canvas.height / 2 + Math.sin(i * frequency + time) * amplitude;
        
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      
      ctx.strokeStyle = '#00F5FF';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00F5FF';
      ctx.stroke();
      
      time += 0.2;
      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening]);

  // Translation trigger on stop
  useEffect(() => {
    if (!isListening && transcript) {
      handleTranslate();
    }
  }, [isListening]);

  const handleTranslate = async () => {
    if (!transcript) return;
    setIsTranslating(true);
    setTranslatedText('');

    try {
      const result = await chatWithGroq(
        [{ role: 'user', content: transcript }],
        targetLang,
        sourceLang,
        formality,
        style
      );
      setTranslatedText(result);
      speak(result, targetLang);
    } catch (e) {
      setTranslatedText("TRANSLATION ERROR — SIGNAL LOST");
    } finally {
      setIsTranslating(false);
      setTranscript('');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-12 relative z-10 p-4">
      
      <div className="flex items-center gap-6 glass p-4 rounded-full border border-cyber-border corner-accent">
        <select 
          value={sourceLang} 
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-transparent text-gray-200 font-orbitron text-sm focus:outline-none"
        >
          {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
        </select>
        <span className="text-neon-cyan font-bold">➔</span>
        <select 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-transparent text-neon-violet font-orbitron text-sm focus:outline-none"
        >
          {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
        </select>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-md">
        
        {/* Waveform Canvas */}
        <div className="h-24 w-full mb-8 relative">
          {isListening ? (
             <canvas ref={canvasRef} width={400} height={100} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-b border-cyber-border opacity-20">
               <div className="w-full h-0.5 bg-gray-500"></div>
            </div>
          )}
        </div>

        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all border-2
            ${isListening 
              ? 'bg-red-500/20 border-red-500 text-red-500 glow-red pulse-neon' 
              : 'glass border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 glow-cyan'}
          `}
        >
          {isListening ? <Square className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
        </button>

        <p className="mt-6 font-orbitron text-gray-400 tracking-widest text-sm uppercase">
          {isListening ? 'Recording Transmission...' : 'Initiate Audio Link'}
        </p>

        {(transcript || isTranslating || translatedText) && (
          <div className="mt-8 w-full glass p-6 rounded-2xl border border-cyber-border text-center space-y-4">
            {transcript && (
              <p className="text-gray-400 font-light italic">"{transcript}"</p>
            )}
            
            {isTranslating && (
              <div className="flex items-center justify-center gap-2 text-neon-cyan">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="font-orbitron text-sm">Processing Neural Data...</span>
              </div>
            )}

            {translatedText && !isTranslating && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xl text-white mb-4">{translatedText}</p>
                <button 
                  onClick={() => speak(translatedText, targetLang)}
                  className="p-3 bg-neon-violet/20 hover:bg-neon-violet/40 rounded-full text-neon-violet transition-colors mx-auto"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
