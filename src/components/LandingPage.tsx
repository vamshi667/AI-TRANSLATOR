import React, { useState } from 'react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleLaunch = () => {
    setFadeOut(true);
    setTimeout(onLaunch, 400);
  };

  const stats = [
    "65+ Languages", "AI Chatbot", "Voice Translation", 
    "Image OCR", "Real-Time Neural AI", "Cultural Context", "Formality Control"
  ];

  return (
    <div className={`fixed inset-0 bg-[#050810] z-[1000] transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'} overflow-hidden flex flex-col`}>
      {/* Topbar */}
      <nav className="h-14 flex items-center justify-between px-8 glass border-b border-[rgba(0,200,255,0.2)] fixed top-0 left-0 right-0 z-[1100]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF] animate-pulse" />
          <span className="font-display font-bold text-white tracking-tight">AI-TRANSLATOR</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8B949E]">
          <a href="#" className="hover:text-[#00C8FF] transition-colors">How It Works</a>
          <a href="#" className="hover:text-[#00C8FF] transition-colors">Features</a>
          <a href="#" className="hover:text-[#00C8FF] transition-colors">Languages</a>
          <button onClick={handleLaunch} className="btn-primary py-2 px-6 text-xs tracking-wider">
            LAUNCH TRANSLATOR →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-14">
        <div className="hero-content space-y-8 max-w-4xl">
          <p className="hero-subtitle font-mono text-[10px] tracking-[0.4em] text-[#00C8FF] uppercase">
            NEURAL TRANSLATION ENGINE · REAL-TIME · INTELLIGENT
          </p>
          
          <h1 className="hero-title font-display font-black leading-[0.85] select-none">
            <div className="text-[clamp(60px,12vw,140px)] text-white">AI-</div>
            <div className="text-[clamp(60px,12vw,140px)] bg-gradient-to-r from-[#00C8FF] to-[#7B61FF] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,200,255,0.3)]">
              TRANSLATOR
            </div>
          </h1>

          <p className="hero-subtitle text-[10px] font-mono tracking-[0.6em] text-[#8B949E] uppercase">
            TEXT · VOICE · IMAGE · REAL-TIME
          </p>

          <p className="hero-subtitle text-[#8B949E] text-lg max-w-[560px] mx-auto leading-relaxed pt-4 font-light">
            An intelligent neural translation engine that understands language like a human — tone, culture, context, and nuance — across 65+ languages instantly.
          </p>

          <div className="hero-buttons flex flex-wrap items-center justify-center gap-4 pt-8">
            <button onClick={handleLaunch} className="btn-primary py-4 px-10 text-sm">
              LAUNCH TRANSLATOR →
            </button>
            <button className="btn-outline py-4 px-10 text-sm">
              HOW IT WORKS
            </button>
          </div>
        </div>
      </main>

      {/* Stats Ticker */}
      <div className="h-14 bg-[#0D1220] border-t border-[rgba(0,200,255,0.1)] overflow-hidden flex items-center relative z-10">
        <div className="animate-marquee flex gap-12 items-center px-6">
          {[...stats, ...stats, ...stats].map((stat, i) => (
            <React.Fragment key={i}>
              <span className="text-[10px] font-mono font-bold text-[#8B949E] whitespace-nowrap uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#00C8FF]">●</span> {stat}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0" 
           style={{ backgroundImage: 'radial-gradient(circle, #00C8FF 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
  );
};
