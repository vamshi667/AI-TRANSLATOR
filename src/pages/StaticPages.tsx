import React, { useState, useEffect } from 'react';
import { 
  Info, Bookmark, History as HistoryIcon, Settings as SettingsIcon, 
  Trash2, Download, Cpu, Mic, Image as ImageIcon, 
  MessageSquare, Shield, ChevronRight, Sparkles, Globe2,
  Database, Activity, Lock, Box, Terminal
} from 'lucide-react';
import { cn } from '../utils/cn';

// --- About Page (Engine Intelligence) ---
export const About: React.FC = () => (
  <div className="h-full bg-[#020408] overflow-y-auto scrollbar-hide p-16 md:p-24">
    <div className="max-w-5xl mx-auto space-y-24">
      <div className="text-center space-y-10 animate-msgIn">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#00D1FF]/20 blur-[60px] rounded-full" />
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#0D1220] to-[#05070B] border border-white/10 flex items-center justify-center mx-auto shadow-premium relative">
            <Cpu className="text-[#00D1FF]" size={56} />
          </div>
        </div>
        <div className="space-y-4">
           <h1 className="text-7xl font-display font-black text-white tracking-tighter italic uppercase">Neural Sync</h1>
           <p className="text-[11px] font-black text-[#00D1FF] tracking-[0.8em] uppercase opacity-60">High-Performance Translation Engine</p>
        </div>
        <p className="text-[#94A3B8] text-2xl max-w-3xl mx-auto leading-relaxed font-light">
          A decentralized neural network designed for high-fidelity linguistic synthesis across 65+ global scripts with cultural preservation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AboutDetail icon={<MessageSquare />} title="Semantic Chat" desc="Deep-contextual understanding for multi-turn dialogue." />
        <AboutDetail icon={<Terminal />} title="Command Core" desc="Robotic precision in every linguistic transformation." />
        <AboutDetail icon={<Activity />} title="Voice Bridge" desc="Real-time waveform analysis for natural speech synthesis." />
        <AboutDetail icon={<Box />} title="Visual OCR" desc="High-accuracy character recognition from raw visual buffers." />
        <AboutDetail icon={<Globe2 />} title="Global Grid" desc="Master-level fluency across the entire BCP-47 spectrum." />
        <AboutDetail icon={<Lock />} title="Neural Privacy" desc="Localized session handling with ephemeral data protocols." />
      </div>

      <div className="card p-16 space-y-12 text-center border-white/5 bg-gradient-to-b from-[#0D1220] to-transparent shadow-premium">
        <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] italic">The Synthesis Protocol</h3>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          <ProcessStep id="01" title="INGEST" desc="Raw Signal Capture" />
          <ProcessArrow />
          <ProcessStep id="02" title="ENCODE" desc="Semantic Vector Mapping" />
          <ProcessArrow />
          <ProcessStep id="03" title="SYNTH" desc="High-Fidelity Output" />
        </div>
      </div>

      <footer className="pt-24 border-t border-white/[0.03] text-center text-[#475569] text-[9px] font-black uppercase tracking-[0.6em]">
        Neural Sync v3.1.0 // Build_4421 // Precision Language Protocol
      </footer>
    </div>
  </div>
);

const AboutDetail = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="card p-10 space-y-5 hover:border-[#00D1FF]/30 group transition-all duration-500 bg-[#0A0F1D]">
    <div className="text-[#00D1FF] group-hover:scale-125 transition-transform duration-500">{icon}</div>
    <h4 className="text-xl font-bold text-white tracking-tight uppercase italic">{title}</h4>
    <p className="text-sm text-[#475569] leading-relaxed font-medium">{desc}</p>
  </div>
);

const ProcessStep = ({ id, title, desc }: { id: string, title: string, desc: string }) => (
  <div className="space-y-4">
    <div className="w-16 h-16 rounded-2xl bg-[#00D1FF] text-[#020408] font-black text-2xl flex items-center justify-center mx-auto shadow-glow italic">{id}</div>
    <div className="space-y-1">
      <h5 className="font-black text-white uppercase tracking-[0.2em] text-xs">{title}</h5>
      <p className="text-[10px] text-[#475569] font-mono uppercase tracking-widest">{desc}</p>
    </div>
  </div>
);

const ProcessArrow = () => <ChevronRight size={32} className="hidden lg:block text-white/5" />;


// --- Session Logs (History) ---
export const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history').then(res => res.json()).then(data => setHistory(data));
  }, []);

  return (
    <div className="h-full bg-[#020408] p-16 overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <Database className="text-[#00D1FF]" size={24} />
               <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Session_Logs</h2>
            </div>
            <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.4em]">Historical Buffer Retrieval // Secure Storage</p>
          </div>
          <button className="btn-outline border-red-500/20 text-red-500 hover:bg-red-500/10 px-6 py-3 text-[10px] font-black tracking-widest uppercase">
            Wipe Logs
          </button>
        </div>

        {history.length === 0 ? (
          <div className="h-[400px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12 text-[#475569]">
            <HistoryIcon size={64} className="mb-8 opacity-10" />
            <p className="text-2xl font-bold uppercase italic tracking-tight mb-2">No session data detected</p>
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase opacity-60">Neural bridge has not yet committed entries to persistent storage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="card p-8 flex items-center justify-between hover:bg-[#0A0F1D] cursor-pointer group transition-all border-white/5 bg-[#05070B]/40">
                <div className="flex items-center gap-12">
                   <div className="text-center w-20">
                      <div className="text-[10px] font-black text-[#475569] uppercase tracking-tighter mb-1">{new Date(item.timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                      <div className="text-lg font-bold text-white italic">{new Date(item.timestamp).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}</div>
                   </div>
                   <div className="w-px h-12 bg-white/5" />
                   <div className="space-y-2">
                      <div className="lang-badge border-none p-0 text-[10px] uppercase font-black tracking-[0.3em] text-[#00D1FF]">
                         {item.source_lang.toUpperCase()} ➔ {item.target_lang.toUpperCase()}
                      </div>
                      <p className="text-base text-[#94A3B8] group-hover:text-white transition-all truncate max-w-xl font-medium">
                         {item.source_text}
                      </p>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-[#00D1FF]/10 group-hover:text-[#00D1FF] transition-all">
                   <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// --- Protocol Settings (Settings) ---
export const Settings: React.FC = () => {
  const [formality, setFormality] = useState('Neutral');

  return (
    <div className="h-full bg-[#020408] p-16 overflow-y-auto scrollbar-hide pb-40">
      <div className="max-w-4xl mx-auto space-y-20">
        <div className="space-y-3 border-b border-white/[0.03] pb-10">
           <div className="flex items-center gap-3">
              <SettingsIcon className="text-[#00D1FF]" size={24} />
              <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Protocol_Config</h2>
           </div>
           <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.4em]">Engine Performance & Interface Tuning</p>
        </div>

        <div className="space-y-16">
          <SettingsSection title="Neural Synthesis">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h4 className="text-lg font-bold text-white uppercase italic">Global Target Target</h4>
                   <p className="text-[10px] text-[#475569] uppercase font-mono tracking-widest">Primary output language for all modules</p>
                </div>
                <select className="bg-[#05070B] border border-white/5 rounded-xl px-6 py-3 text-xs font-black text-[#00D1FF] focus:border-[#00D1FF]/40 transition-all uppercase tracking-widest">
                   <option>Japanese (日本語)</option>
                   <option>English</option>
                   <option>French (Français)</option>
                </select>
             </div>

             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h4 className="text-lg font-bold text-white uppercase italic">Default Synthesis Tone</h4>
                   <p className="text-[10px] text-[#475569] uppercase font-mono tracking-widest">Neural engine formality calibration</p>
                </div>
                <div className="flex gap-1.5 bg-[#05070B] p-1.5 rounded-xl border border-white/10">
                   {['Casual', 'Neutral', 'Formal'].map(f => (
                     <button key={f} onClick={() => setFormality(f)} className={cn("px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", formality === f ? 'bg-[#00D1FF] text-[#020408] shadow-glow' : 'text-[#475569] hover:text-[#94A3B8]')}>
                        {f}
                     </button>
                   ))}
                </div>
             </div>
          </SettingsSection>

          <SettingsSection title="Signal & Audio">
             <Toggle label="Auto-Audio Feedback" desc="Trigger synthesis replay on every result" active />
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-lg font-bold text-white uppercase italic">Playback Velocity</h4>
                   <span className="text-[11px] font-black font-mono text-[#00D1FF] tracking-widest">1.00x</span>
                </div>
                <input type="range" className="w-full h-2 bg-[#05070B] rounded-full accent-[#00D1FF] appearance-none cursor-pointer border border-white/5" />
             </div>
          </SettingsSection>

          <SettingsSection title="Interface Protocols">
             <Toggle label="Compact Control Sidebar" desc="Minimize navigation area to icons only" />
             <Toggle label="Neural Context Notes" desc="Display cultural metadata on synthesis" active />
             
             <div className="pt-10 flex flex-wrap gap-6 border-t border-white/5">
                <button className="btn-outline border-red-500/10 text-red-500 hover:bg-red-500/5 py-4 px-10 text-[10px] font-black uppercase tracking-[0.3em]">Purge Persistent Data</button>
                <button className="btn-outline border-white/10 text-[#475569] hover:text-white py-4 px-10 text-[10px] font-black uppercase tracking-[0.3em]">Export Sync Package</button>
             </div>
          </SettingsSection>
        </div>

        <div className="fixed bottom-12 right-12 flex flex-col items-end gap-3 z-50">
           <div className="bg-[#0A0F1D] border border-white/5 p-4 rounded-2xl shadow-premium backdrop-blur-xl">
              <span className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em]">Protocol Status: Stable // v3.1.42</span>
           </div>
           <button className="btn-primary py-5 px-16 text-xs font-black uppercase tracking-[0.5em] shadow-glow transform hover:scale-105 active:scale-95">
              COMMIT_CHANGES
           </button>
        </div>
      </div>
    </div>
  );
};

const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-8 animate-msgIn">
    <div className="flex items-center gap-4">
       <div className="w-2 h-2 rounded-full bg-[#00D1FF]" />
       <h3 className="text-[11px] font-black text-[#00D1FF] uppercase tracking-[0.4em]">{title}</h3>
       <div className="flex-1 h-px bg-white/5" />
    </div>
    <div className="card space-y-10 bg-[#0A0F1D]/50 border-white/5 p-12">
       {children}
    </div>
  </div>
);

const Toggle = ({ label, desc, active: initialActive }: { label: string, desc: string, active?: boolean }) => {
  const [on, setOn] = useState(initialActive);
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-white uppercase italic">{label}</h4>
        <p className="text-[10px] text-[#475569] uppercase font-mono tracking-widest">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} className={cn("w-14 h-7 rounded-full p-1.5 transition-all duration-500", on ? "bg-[#00D1FF] shadow-glow" : "bg-[#05070B] border border-white/10")}>
        <div className={cn("w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-xl", on ? "translate-x-7" : "translate-x-0")} />
      </button>
    </div>
  );
};

// --- Phrasebook Page ---
export const Phrasebook: React.FC = () => (
  <div className="h-full bg-[#020408] p-16 overflow-y-auto scrollbar-hide">
    <div className="max-w-5xl mx-auto space-y-16">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Bookmark className="text-[#00D1FF]" size={24} />
             <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Linguistic_Library</h2>
          </div>
          <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.4em]">Pinned Translations & Common Phrase Assets</p>
        </div>
      </div>

      <div className="h-[500px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12 text-[#475569] animate-msgIn">
        <Bookmark size={80} className="mb-10 opacity-10" />
        <p className="text-3xl font-bold uppercase italic tracking-tighter mb-4 text-white/20">Library Vault Empty</p>
        <p className="text-[11px] font-mono tracking-[0.3em] uppercase max-w-sm mx-auto leading-loose">Commit linguistic assets to this buffer by engaging the <Bookmark size={14} className="inline mx-1" /> toggle on any synthetic output module.</p>
      </div>
    </div>
  </div>
);
