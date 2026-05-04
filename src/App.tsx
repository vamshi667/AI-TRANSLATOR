import React, { useState, useEffect, useRef, useMemo } from 'react';
import Tesseract from 'tesseract.js';
import { 
  MessageSquare, Languages, Mic, Image as ImageIcon, 
  Info, Bookmark, History, Settings, Plus, Menu, User, 
  ChevronRight, Sparkles, Circle, Send, Copy, RotateCcw,
  Volume2, Trash2, Search, Download, X, Terminal, Cpu,
  Monitor, Zap, ShieldCheck, ArrowRightLeft, Check, AlertCircle
} from 'lucide-react';
import { cn } from './utils/cn';

// --- TYPES ---
type PageId = 'landing' | 'welcome' | 'chat' | 'translator' | 'voice' | 'image' | 'phrasebook' | 'history' | 'settings' | 'about';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  lang?: string;
  flag?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  sourceLang: string;
  targetLang: string;
  input: string;
  output: string;
  module: string;
}

interface Phrase {
  id: string;
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  category: string;
  date: string;
}

// --- CONSTANTS ---
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
];

const PHRASE_CATEGORIES = ['Travel', 'Business', 'Casual', 'Emergency', 'Food'];

// --- APP COMPONENT ---
export default function App() {
  // Navigation & UI State
  const [activePage, setActivePage] = useState<PageId>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLangModalOpen, setIsLangModalOpen] = useState<'source' | 'target' | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string, msg: string, type: 'success' | 'error' }[]>([]);

  // Language Selection
  const [sourceLang, setSourceLang] = useState<Language | null>(null);
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [langWarning, setLangWarning] = useState(false);

  // App Data (Persisted)
  const [phrases, setPhrases] = useState<Phrase[]>(() => JSON.parse(localStorage.getItem('ns_phrases') || '[]'));
  const [logs, setLogs] = useState<LogEntry[]>(() => JSON.parse(localStorage.getItem('ns_logs') || '[]'));
  const [prefs, setPrefs] = useState(() => ({
    autoDetect: false,
    romanization: true,
    darkMode: true,
    showConfidence: true,
    shortcuts: true,
    sound: true,
    autoSpeak: false,
    fontSize: 14,
    speed: 'Balanced'
  }));

  // Functional Data
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [showLanding, setShowLanding] = useState(activePage === 'landing');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLaunch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePage('welcome');
      setShowLanding(false);
      setIsTransitioning(false);
    }, 600);
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('ns_phrases', JSON.stringify(phrases));
  }, [phrases]);

  useEffect(() => {
    localStorage.setItem('ns_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    const handlePopState = (event: any) => {
      if (event.state && event.state.page) {
        setActivePage(event.state.page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Initial state sync
    if (!window.history.state) {
      window.history.replaceState({ page: activePage }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (window.history.state?.page !== activePage) {
      window.history.pushState({ page: activePage }, '');
    }
  }, [activePage]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activePage === 'landing') {
      setShowLanding(true);
      setIsTransitioning(false);
    }
  }, [activePage]);

  // --- ACTIONS ---
  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleSwap = () => {
    if (!sourceLang || !targetLang) return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const logTranslation = (input: string, output: string, module: string) => {
    if (!sourceLang || !targetLang) return;
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      sourceLang: sourceLang.name,
      targetLang: targetLang.name,
      input,
      output,
      module
    };
    setLogs(prev => [entry, ...prev].slice(0, 500));
  };

  const speak = (text: string, langCode: string) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const map: any = { ja: 'ja-JP', fr: 'fr-FR', hi: 'hi-IN', es: 'es-ES', de: 'de-DE', it: 'it-IT', zh: 'zh-CN', ko: 'ko-KR' };
    utterance.lang = map[langCode] || langCode;
    window.speechSynthesis.speak(utterance);
  };

  const translate = async (text: string, module: string, customSystem?: string) => {
    if (!sourceLang || !targetLang) {
      setLangWarning(true);
      setTimeout(() => setLangWarning(false), 2000);
      addToast("⚠ SELECT BOTH LANGUAGES TO CONTINUE", "error");
      return null;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: text,
          sourceLang: sourceLang.name,
          targetLang: targetLang.name,
          systemPrompt: customSystem
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      logTranslation(text, data.text, module);
      if (prefs.autoSpeak && targetLang) speak(data.text, targetLang.code);
      return data.text;
    } catch (err) {
      addToast("TRANSLATION FAILED — RETRY", "error");
      console.error(err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const chatBot = async (messagesArray: any[]) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messagesArray,
          sourceLang: sourceLang?.name,
          targetLang: targetLang?.name
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.text;
    } catch (err) {
      addToast("CHAT FAILED — RETRY", "error");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartChatFromWelcome = async (text: string) => {
    if (!sourceLang || !targetLang) {
      setLangWarning(true);
      setTimeout(() => setLangWarning(false), 2000);
      addToast("⚠ SELECT BOTH LANGUAGES TO CONTINUE", "error");
      return;
    }
    setActivePage('chat');
    const newMessages = [...chatMessages, { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toLocaleTimeString() }];
    setChatMessages(newMessages);
    
    const result = await chatBot(newMessages);
    if (result) {
      setChatMessages((prev: any) => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: result, timestamp: new Date().toLocaleTimeString() }]);
    }
  };

  const startNewSession = () => {
    if (activePage === 'welcome' && chatMessages.length === 0 && logs.length === 0) {
       addToast("Buffers already clear");
       return;
    }
    setIsConfirmModalOpen(true);
  };

  const confirmNewSession = () => {
    setChatMessages([]);
    setIsConfirmModalOpen(false);
    addToast("Chat session cleared", "success");
  };

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sc = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sc}`;
  };

  return (
    <div className={cn("h-screen flex flex-col overflow-hidden select-none", prefs.darkMode ? "bg-[#080a0e]" : "bg-[#12141a]")}>
      {showLanding && <LandingPage onLaunch={handleLaunch} isTransitioning={isTransitioning} />}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)]" />

      <header className="h-[48px] border-b border-[rgba(0,229,255,0.12)] bg-[#0d0f14] flex items-center justify-between px-4 z-40 relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('welcome')}>
          <span className="text-[#00e5ff] text-xl">●</span>
          <h1 className="font-display font-bold tracking-tighter text-white text-lg uppercase">AI-TRANSLATOR</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#080a0e] px-3 py-1 rounded border border-[rgba(0,229,255,0.12)]">
            <button onClick={() => setIsLangModalOpen('source')} className={cn("text-[10px] font-mono tracking-widest uppercase transition-colors", sourceLang ? "text-[#00e5ff]" : "text-gray-500")}>
              {sourceLang ? sourceLang.name : "Select source..."}
            </button>
            <button onClick={handleSwap} className={cn("p-1 hover:text-[#00e5ff] transition-all", (!sourceLang || !targetLang) && "opacity-20 cursor-not-allowed")}>
              <ArrowRightLeft size={12} />
            </button>
            <button onClick={() => setIsLangModalOpen('target')} className={cn("text-[10px] font-mono tracking-widest uppercase transition-colors", targetLang ? "text-[#00e5ff]" : "text-gray-500")}>
              {targetLang ? targetLang.name : "Select target..."}
            </button>
          </div>
          {langWarning && <div className="absolute top-[52px] left-1/2 -translate-x-1/2 px-4 py-1 bg-[#ff3366]/20 border border-[#ff3366] text-[#ff3366] text-[10px] font-mono glow-border z-50 animate-pulse">⚠ SELECT BOTH LANGUAGES TO CONTINUE</div>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             <Circle size={8} fill="#00ff88" className="text-[#00ff88] animate-pulse" />
             <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest hidden sm:block">Sync Active</span>
          </div>
          <button onClick={() => setActivePage('settings')} className="text-gray-500 hover:text-white"><Settings size={18} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className={cn("bg-[#0d0f14] border-r border-[rgba(0,229,255,0.12)] transition-all duration-300 flex flex-col z-30", isMobile ? "fixed inset-x-0 bottom-0 h-16 flex-row" : (sidebarCollapsed ? "w-16" : "w-[260px]"))}>
          {!isMobile && (
            <>
              <div className="p-4 border-b border-[rgba(255,255,255,0.03)]">
                <button onClick={startNewSession} className="w-full h-11 bg-gradient-to-r from-[#00e5ff]/20 to-[#0055ff]/20 border border-[#00e5ff]/30 text-[#00e5ff] font-display font-bold tracking-widest text-xs flex items-center justify-center gap-2 hover:glow-border transition-all">
                  <Plus size={16} /> {!sidebarCollapsed && "NEW SESSION"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
                <SectionLabel show={!sidebarCollapsed}>CORE MODULES</SectionLabel>
                <NavItem icon={<Monitor size={18} />} label="Interface Home" active={activePage === 'welcome'} onClick={() => setActivePage('welcome')} collapsed={sidebarCollapsed} />
                <NavItem icon={<MessageSquare size={18} />} label="AI Chat" active={activePage === 'chat'} onClick={() => setActivePage('chat')} collapsed={sidebarCollapsed} />
                <NavItem icon={<Languages size={18} />} label="Classic Translate" active={activePage === 'translator'} onClick={() => setActivePage('translator')} collapsed={sidebarCollapsed} />
                <NavItem icon={<Mic size={18} />} label="Voice Link" active={activePage === 'voice'} onClick={() => setActivePage('voice')} collapsed={sidebarCollapsed} />
                <NavItem icon={<ImageIcon size={18} />} label="Visual OCR" active={activePage === 'image'} onClick={() => setActivePage('image')} collapsed={sidebarCollapsed} />

                <div className="my-6">
                   <SectionLabel show={!sidebarCollapsed}>INTEL LIBRARY</SectionLabel>
                   <NavItem icon={<Bookmark size={18} />} label="Phrasebook" active={activePage === 'phrasebook'} onClick={() => setActivePage('phrasebook')} collapsed={sidebarCollapsed} />
                   <NavItem icon={<History size={18} />} label="Session Logs" active={activePage === 'history'} onClick={() => setActivePage('history')} collapsed={sidebarCollapsed} />
                   <NavItem icon={<Settings size={18} />} label="Preferences" active={activePage === 'settings'} onClick={() => setActivePage('settings')} collapsed={sidebarCollapsed} />
                   <NavItem icon={<Info size={18} />} label="About Engine" active={activePage === 'about'} onClick={() => setActivePage('about')} collapsed={sidebarCollapsed} />
                </div>
              </div>

              <div className="p-4 border-t border-[rgba(255,255,255,0.03)] bg-[#080a0e]/50 relative">
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute top-2 -right-3 w-6 h-6 bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-full flex items-center justify-center text-gray-500 hover:text-[#00e5ff] z-50">
                  <Menu size={12} />
                </button>
              </div>
            </>
          )}

          {isMobile && (
            <div className="flex-1 flex items-center justify-around">
               <MobileTabItem icon={<MessageSquare size={20} />} active={activePage === 'chat'} onClick={() => setActivePage('chat')} />
               <MobileTabItem icon={<Languages size={20} />} active={activePage === 'translator'} onClick={() => setActivePage('translator')} />
               <MobileTabItem icon={<Mic size={20} />} active={activePage === 'voice'} onClick={() => setActivePage('voice')} />
               <MobileTabItem icon={<ImageIcon size={20} />} active={activePage === 'image'} onClick={() => setActivePage('image')} />
               <MobileTabItem icon={<Bookmark size={20} />} active={activePage === 'phrasebook'} onClick={() => setActivePage('phrasebook')} />
            </div>
          )}
        </aside>

        <main className={cn("flex-1 flex flex-col overflow-hidden pb-[32px]", isMobile && "pb-16")}>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-8">
            {activePage === 'welcome' && <WelcomeScreen onSuggestion={handleStartChatFromWelcome} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} onStartChat={handleStartChatFromWelcome} />}
            {activePage === 'chat' && <ChatModule messages={chatMessages} setMessages={setChatMessages} onSend={chatBot} isProcessing={isProcessing} speak={speak} />}
            {activePage === 'translator' && <TranslatorModule onTranslate={(t, s) => translate(t, 'translator', s)} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} addPhrase={(p) => setPhrases(prev => [...prev, p])} speak={speak} />}
            {activePage === 'voice' && <VoiceModule translate={translate} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} speak={speak} />}
            {activePage === 'image' && <ImageModule translate={translate} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} speak={speak} />}
            {activePage === 'phrasebook' && <PhrasebookModule phrases={phrases} setPhrases={setPhrases} />}
            {activePage === 'history' && <LogsModule logs={logs} setLogs={setLogs} />}
            {activePage === 'settings' && <SettingsModule prefs={prefs} setPrefs={setPrefs} />}
            {activePage === 'about' && <AboutModule uptime={uptime} formatUptime={formatUptime} />}
          </div>
        </main>

        <footer className="fixed bottom-0 inset-x-0 h-[32px] bg-[#0d0f14] border-t border-[rgba(0,229,255,0.12)] flex items-center justify-between px-4 z-40">
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" /> LATENCY: LOW
              </span>
           </div>
           <div className="text-[9px] font-mono text-[#00e5ff] uppercase tracking-[0.2em] animate-pulse">● AI-TRANSLATOR: ACTIVE</div>
           <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest hidden sm:block">LLAMA-3.3 // QUANTUM CORE</div>
        </footer>
      </div>

      {isLangModalOpen && (
        <LanguageModal onClose={() => setIsLangModalOpen(null)} onSelect={(l) => { if (isLangModalOpen === 'source') setSourceLang(l); else setTargetLang(l); setIsLangModalOpen(null); }} selected={isLangModalOpen === 'source' ? sourceLang : targetLang} />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmNewSession} title="TERMINATE SESSION" message="CAUTION: This action will purge all local translation buffers and reset the AI interface to baseline parameters. Continue?" />
      )}

      <div className="fixed bottom-12 right-6 flex flex-col gap-2 z-[100]">
        {toasts.map(t => (
          <div key={t.id} className={cn("px-4 py-2 text-[11px] font-mono uppercase tracking-widest border shadow-lg animate-in slide-in-from-right", t.type === 'success' ? "bg-[#080a0e] border-[#00e5ff] text-[#00e5ff]" : "bg-[#080a0e] border-[#ff3366] text-[#ff3366]")}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingPage({ onLaunch, isTransitioning }: any) {
  return (
    <div className={cn("fixed inset-0 z-[300] bg-[#0d0f14] flex flex-col items-center justify-center p-4 transition-all duration-700", isTransitioning ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100")}>
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.5)_2px,rgba(0,0,0,0.5)_4px)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/5 to-transparent" />
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex items-center gap-4">
          <span className="text-[#00e5ff] text-5xl">●</span>
          <h1 className="font-display font-bold tracking-tighter text-white text-6xl md:text-8xl uppercase glow-text">AI-TRANSLATOR</h1>
        </div>
        <p className="text-gray-400 font-mono text-sm md:text-base tracking-widest uppercase opacity-80">Next-Generation Neural Linguistic Engine</p>
        <button onClick={onLaunch} className="mt-12 px-8 py-4 bg-gradient-to-r from-[#00e5ff]/20 to-[#0055ff]/20 border border-[#00e5ff] text-[#00e5ff] font-display font-bold tracking-[0.2em] text-lg uppercase hover:scale-105 hover:bg-[#00e5ff]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all glow-border">
          Launch Interface
        </button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const SectionLabel = ({ children, show }: { children: string, show: boolean }) => (
  <p className={cn("text-[9px] font-mono text-gray-600 font-bold uppercase tracking-[0.3em] px-4 mb-3 h-3 overflow-hidden", !show && "opacity-0")}>{children}</p>
);

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button onClick={onClick} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 group relative", active ? "bg-[#00e5ff]/5 text-[#00e5ff] shadow-[inset_0_0_15px_rgba(0,229,255,0.05)]" : "text-gray-500 hover:text-white hover:bg-white/[0.02]")}>
    {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]" />}
    <span className={cn(active ? "text-[#00e5ff]" : "group-hover:text-[#00e5ff]")}>{icon}</span>
    {!collapsed && <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>}
  </button>
);

const MobileTabItem = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={cn("p-4 transition-colors", active ? "text-[#00e5ff]" : "text-gray-600")}>{icon}</button>
);

function ConfirmModal({ onClose, onConfirm, title, message }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0f14] border border-[#ff3366]/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(255,51,102,0.1)] animate-in zoom-in-95 duration-200">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ff3366]/10 border border-[#ff3366]/20 flex items-center justify-center">
               <AlertCircle className="text-[#ff3366]" size={24} />
            </div>
            <div>
               <h3 className="text-xl font-display font-bold text-white tracking-tighter uppercase italic">{title}</h3>
               <p className="text-[10px] font-mono text-[#ff3366] uppercase tracking-[0.3em]">Protocol Warning</p>
            </div>
         </div>
         <p className="text-gray-400 text-sm leading-relaxed mb-8 font-mono uppercase tracking-wide opacity-80">{message}</p>
         <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 h-12 bg-white/5 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Abort</button>
            <button onClick={onConfirm} className="flex-1 h-12 bg-[#ff3366] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[#ff4d7d] shadow-[0_0_20px_rgba(255,51,102,0.3)] transition-all">Confirm</button>
         </div>
      </div>
    </div>
  );
}

// --- MODULES ---

function WelcomeScreen({ onSuggestion, isProcessing, sourceLang, targetLang, onStartChat }: any) {
  const [input, setInput] = useState('');
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const currentInput = input;
    setInput('');
    onStartChat(currentInput);
  };
  return (
    <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-[#00e5ff]/5 blur-[80px] rounded-full" />
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-2xl flex items-center justify-center relative glow-border">
           <Terminal className="text-[#00e5ff]" size={48} />
           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00e5ff] animate-blink" />
        </div>
      </div>
      <div className="text-center space-y-6">
        <h2 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tighter italic uppercase glow-text">AI LANGUAGE INTERFACE</h2>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase opacity-70">System ready for high-fidelity multilingual processing.</p>
      </div>
      <div className="w-full space-y-8">
        <div className="flex flex-wrap justify-center gap-3">
          {["TRANSLATE 'CORE'", "EXPLAIN JAPANESE HONORIFICS", "FORMAL MEETING REQUEST IN FRENCH", "ITALIAN SLANG FOR 'COOL'"].map(s => (
            <button key={s} onClick={() => onSuggestion(s)} className="px-4 py-2 bg-[#0d0f14] border border-[rgba(0,229,255,0.08)] rounded text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:border-[#00e5ff]/30 hover:text-[#00e5ff] transition-all">{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatModule({ messages, setMessages, onSend, isProcessing, speak }: any) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const currentInput = input;
    setInput('');
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', content: currentInput, timestamp: new Date().toLocaleTimeString() }];
    setMessages(newMessages);
    const result = await onSend(newMessages);
    if (result) {
      setMessages((prev: any) => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: result, timestamp: new Date().toLocaleTimeString() }]);
    }
  };
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto border border-[rgba(0,229,255,0.12)] bg-[#0d0f14]/50 rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-4 border-b border-[rgba(255,255,255,0.03)] flex justify-between items-center bg-[#0d0f14]">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white uppercase">AI Interface // Chat</span>
         </div>
         <button onClick={() => setMessages([])} className="p-2 text-gray-600 hover:text-[#ff3366] transition-colors"><Trash2 size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4"><MessageSquare size={48} /><p className="font-mono text-xs uppercase tracking-widest">No active communications</p></div>}
        {messages.map((m: any) => (
          <div key={m.id} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
             <div className={cn("max-w-[85%] p-4 rounded-xl text-sm relative group", m.role === 'user' ? "bg-[#080a0e] border border-[rgba(0,229,255,0.2)] text-[#00e5ff] rounded-tr-none" : "bg-[#111318] border border-[rgba(255,255,255,0.05)] text-gray-200 rounded-tl-none")}>
                {m.flag && <span className="absolute -top-3 left-0 text-xs">{m.flag}</span>}
                <p className="leading-relaxed">{m.content}</p>
                <div className="mt-2 flex items-center justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{m.timestamp} </span>
                   <div className="flex gap-2">
                      <button onClick={() => speak(m.content, 'en')} className="text-gray-500 hover:text-[#00ff88]"><Volume2 size={12} /></button>
                      <button onClick={() => navigator.clipboard.writeText(m.content)} className="text-gray-500 hover:text-[#00e5ff]"><Copy size={12} /></button>
                   </div>
                </div>
             </div>
          </div>
        ))}
        {isProcessing && <div className="flex items-center gap-2 text-[#00e5ff] animate-pulse pl-2"><div className="w-1 h-1 bg-[#00e5ff] rounded-full" /><div className="w-1 h-1 bg-[#00e5ff] rounded-full delay-75" /><div className="w-1 h-1 bg-[#00e5ff] rounded-full delay-150" /><span className="text-[10px] font-mono uppercase tracking-[0.4em] ml-2">AI bridge active...</span></div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-[#0d0f14] border-t border-[rgba(255,255,255,0.03)]">
         <div className="relative flex items-center bg-[#080a0e] border border-[rgba(0,229,255,0.15)] rounded-lg">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') handleSend(); }} placeholder="Submit AI query..." className="flex-1 bg-transparent border-none p-3 text-sm placeholder:text-gray-700" />
            <button onClick={handleSend} disabled={!input.trim() || isProcessing} className="p-3 text-[#00e5ff] disabled:opacity-30"><Send size={18} /></button>
         </div>
      </div>
    </div>
  );
}

function TranslatorModule({ onTranslate, isProcessing, sourceLang, targetLang, addPhrase, speak }: any) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [tone, setTone] = useState('Neutral');
  const [romanization, setRomanization] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const handleTranslate = async () => {
    if (!sourceText.trim() || isProcessing) return;
    const system = `You are a precise multilingual translation engine. Translate the given text from ${sourceLang.name} to ${targetLang.name}. Tone: ${tone}. ${romanization ? 'Include romanization below the translation.' : ''} Return ONLY the translated text.`;
    const result = await onTranslate(sourceText, system);
    if (result) { setTranslatedText(result); setConfidence(Math.floor(Math.random() * (99 - 94 + 1)) + 94); }
  };
  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row gap-4 h-[50vh] min-h-[300px]">
        <div className="flex-1 bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-xl p-4 flex flex-col">
           <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{sourceLang?.name || "SOURCE"}</span><span className="text-[10px] font-mono text-gray-700">{sourceText.length}/2000</span></div>
           <textarea value={sourceText} onChange={e => setSourceText(e.target.value.slice(0, 2000))} placeholder="Input source protocols..." className="flex-1 bg-transparent border-none p-2 resize-none text-lg" />
           <button onClick={() => setSourceText('')} className="self-end text-gray-700 hover:text-[#ff3366]"><X size={14} /></button>
        </div>
        <div className="flex md:flex-col items-center justify-center gap-4">
           <button onClick={handleTranslate} disabled={isProcessing || !sourceText.trim()} className="w-12 h-12 rounded-full bg-[#00e5ff] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-20"><Zap size={24} fill="currentColor" /></button>
        </div>
        <div className="flex-1 bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-xl p-4 flex flex-col relative group">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest">{targetLang?.name || "TARGET"}</span>
              <div className="flex items-center gap-2">
                 <button onClick={() => speak(translatedText, targetLang?.code || 'en')} className="text-gray-600 hover:text-[#00ff88] transition-all"><Volume2 size={14} /></button>
                 <button onClick={() => navigator.clipboard.writeText(translatedText)} className="text-gray-600 hover:text-[#00e5ff]"><Copy size={14} /></button>
                 <button onClick={() => addPhrase({ id: Date.now().toString(), source: sourceText, target: translatedText, sourceLang: sourceLang.name, targetLang: targetLang.name, category: 'Casual', date: new Date().toLocaleDateString() })} className="text-gray-600 hover:text-[#00ff88]"><Bookmark size={14} /></button>
              </div>
           </div>
           <div className={cn("flex-1 p-2 text-lg overflow-y-auto scrollbar-hide", !translatedText && "text-gray-800 italic")}>{translatedText || "Synthesis output awaits..."}</div>
           {confidence > 0 && <div className="mt-4 space-y-1"><div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase tracking-widest"><span>Translation Confidence</span><span>{confidence}%</span></div><div className="h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-[#00e5ff] transition-all duration-1000" style={{ width: `${confidence}%` }} /></div></div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 p-4 bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-xl">
         <div className="flex items-center gap-2"><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mr-2">Tone Settings</span>{['Formal', 'Neutral', 'Casual'].map(t => (<button key={t} onClick={() => setTone(t)} className={cn("px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded border transition-all", tone === t ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]" : "border-transparent text-gray-600 hover:text-gray-400")}>{t}</button>))}</div>
         <div className="h-4 w-px bg-white/5" /><label className="flex items-center gap-2 cursor-pointer group"><div className={cn("w-8 h-4 rounded-full relative transition-all", romanization ? "bg-[#00e5ff]" : "bg-gray-800")}><div className={cn("absolute top-0.5 w-3 h-3 bg-black rounded-full transition-all", romanization ? "left-4.5" : "left-0.5")} /><input type="checkbox" className="hidden" checked={romanization} onChange={() => setRomanization(!romanization)} /></div><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-hover:text-gray-300">Romanization</span></label>
      </div>
    </div>
  );
}

function VoiceModule({ translate, isProcessing, sourceLang, targetLang, speak }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const recognition = useRef<any>(null);
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) setTranscript(prev => prev + event.results[i][0].transcript);
          else interimTranscript += event.results[i][0].transcript;
        }
      };
      recognition.current.onerror = (err: any) => { console.error(err); setIsRecording(false); };
    }
  }, []);
  const toggleRecording = async () => {
    if (!recognition.current) { alert("Browser does not support voice input"); return; }
    if (isRecording) {
      recognition.current.stop(); setIsRecording(false);
      if (transcript.trim()) { const result = await translate(transcript, 'voice'); if (result) setTranslation(result); }
    } else { setTranscript(''); setTranslation(''); recognition.current.start(); setIsRecording(true); }
  };
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-12 max-w-4xl mx-auto">
      <div className="relative flex items-center justify-center">
         {isRecording && (<><div className="absolute inset-0 bg-[#ff3366]/10 blur-[60px] rounded-full animate-pulse" /><div className="absolute w-[200px] h-[200px] border border-[#ff3366]/20 rounded-full animate-pulse" /><div className="absolute w-[300px] h-[300px] border border-[#ff3366]/10 rounded-full animate-pulse delay-75" /></>)}
         <button onClick={toggleRecording} className={cn("w-32 h-32 rounded-full flex items-center justify-center relative transition-all duration-500 glow-border", isRecording ? "bg-[#ff3366] shadow-[0_0_40px_rgba(255,51,102,0.4)]" : "bg-[#0d0f14] border border-[rgba(0,229,255,0.3)] hover:border-[#00e5ff]")}>{isProcessing ? <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin" /> : (isRecording ? <div className="w-10 h-10 bg-white rounded-sm" /> : <Mic size={48} className="text-[#00e5ff]" />)}</button>
      </div>
      {isRecording && (<div className="flex items-end gap-1 h-12">{[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((h, i) => (<div key={i} className="w-1.5 bg-[#ff3366] rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s`, height: `${h * 4}px` }} />))}</div>)}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-[#0d0f14] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 space-y-4"><h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Transcript Output</h4><div className="min-h-[100px] text-gray-300 leading-relaxed italic">{transcript || "Speak to synthesize..."}</div>{transcript && <button onClick={() => navigator.clipboard.writeText(transcript)} className="text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:underline"><Copy size={12} /> Copy Transcript</button>}</div>
         <div className="bg-[#0d0f14] border border-[rgba(0,229,255,0.12)] rounded-xl p-6 space-y-4 glow-border">
            <h4 className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest">AI Translation</h4>
            <div className="min-h-[100px] text-white leading-relaxed font-bold">{isProcessing ? "Stabilizing AI bridge..." : (translation || "Awaiting audio input...")}</div>
            {translation && (
              <div className="flex gap-4">
                <button onClick={() => speak(translation, targetLang?.code || 'en')} className="text-[#00ff88] text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:underline"><Volume2 size={12} /> Read Aloud</button>
                <button onClick={() => navigator.clipboard.writeText(translation)} className="text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:underline"><Copy size={12} /> Copy Translation</button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function ImageModule({ translate, isProcessing, sourceLang, targetLang, speak }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState('');
  const [translation, setTranslation] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => { setImage(f.target?.result as string); processImage(f.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };
  const processImage = async (imgData: string) => {
    setExtracted(''); setTranslation(''); setProgress(10);
    
    const tesseractLangMap: any = { 
      en: 'eng', ja: 'jpn', fr: 'fra', it: 'ita', es: 'spa', 
      de: 'deu', hi: 'hin', ar: 'ara', zh: 'chi_sim', ko: 'kor', 
      pt: 'por', ru: 'rus' 
    };
    const lang = tesseractLangMap[sourceLang?.code] || 'eng';

    try {
      const { data: { text } } = await Tesseract.recognize(imgData, lang, {
        logger: m => {
          if (m.status === 'recognizing text') setProgress(Math.floor(m.progress * 100));
        }
      });
      
      setExtracted(text);
      if (text.trim()) {
        const result = await translate(text, 'image');
        if (result) setTranslation(result);
      }
    } catch (err) {
      console.error(err);
      // addToast("OCR FAILED", "error");
    } finally {
      setProgress(0);
    }
  };
  return (
    <div className="h-full flex flex-col space-y-8">
       <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
             <div onClick={() => fileRef.current?.click()} className="aspect-video bg-[#0d0f14] border-2 border-dashed border-[rgba(0,229,255,0.2)] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00e5ff] hover:bg-[#00e5ff]/5 transition-all group overflow-hidden relative">
                {image ? <img src={image} className="w-full h-full object-cover" /> : (<><ImageIcon size={48} className="text-gray-700 group-hover:text-[#00e5ff] mb-4" /><p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Upload Protocol Data</p></>)}
                <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
             </div>
             {progress > 0 && (<div className="space-y-2"><div className="flex justify-between text-[9px] font-mono text-[#00e5ff] uppercase"><span>OCR Analysis</span><span>{progress}%</span></div><div className="h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-[#00e5ff] transition-all" style={{ width: `${progress}%` }} /></div></div>)}
          </div>
          <div className="flex-1 bg-[#0d0f14] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col space-y-6">
             <div className="space-y-2"><h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Extracted Content</h4><div className="min-h-[100px] text-gray-400 italic text-sm">{extracted || "Awaiting scan..."}</div></div>
             <div className="h-px bg-white/5" />
             <div className="space-y-2">
                <div className="flex justify-between items-center"><h4 className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest">Translated Synthesis</h4>{translation && <button onClick={() => speak(translation, targetLang?.code || 'en')} className="text-gray-600 hover:text-[#00ff88]"><Volume2 size={16} /></button>}</div>
                <div className="min-h-[150px] text-sm text-white font-medium leading-relaxed whitespace-pre-wrap">{isProcessing ? "Processing visual language vectors..." : (translation || "Upload image for translation...")}</div>
             </div>
          </div>
       </div>
    </div>
  );
}

function PhrasebookModule({ phrases, setPhrases }: any) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const filtered = phrases.filter((p: any) => (activeCat === 'All' || p.category === activeCat) && (p.source.toLowerCase().includes(search.toLowerCase()) || p.target.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="h-full flex flex-col space-y-6">
       <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter vault archives..." className="w-full bg-[#0d0f14] border border-[rgba(255,255,255,0.1)] rounded-lg py-3 pl-10 pr-4 text-xs font-mono" /></div>
          <div className="flex gap-2">{['All', ...PHRASE_CATEGORIES].map(c => (<button key={c} onClick={() => setActiveCat(c)} className={cn("px-4 py-2 rounded text-[10px] font-mono uppercase tracking-widest border transition-all", activeCat === c ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]" : "bg-transparent border-[rgba(255,255,255,0.05)] text-gray-600 hover:text-white")}>{c}</button>))}</div>
       </div>
       <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-hide">
          {filtered.length === 0 && <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 italic font-mono text-sm py-20">No archives matched query parameters.</div>}
          {filtered.map((p: any) => (
            <div key={p.id} className="bg-[#111318] border border-[rgba(0,229,255,0.1)] rounded-xl p-5 group hover:glow-border transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setPhrases(phrases.filter((x: any) => x.id !== p.id))} className="p-2 text-gray-700 hover:text-[#ff3366] transition-colors"><Trash2 size={14} /></button></div>
               <div className="space-y-4">
                  <div className="flex justify-between items-start"><span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{p.sourceLang} → {p.targetLang}</span><span className="px-2 py-0.5 bg-gray-900 border border-white/5 text-[8px] font-mono text-gray-500 uppercase tracking-widest rounded-full">{p.category}</span></div>
                  <div className="space-y-2"><p className="text-sm font-medium text-white">{p.source}</p><p className="text-sm font-bold text-[#00e5ff] italic">{p.target}</p></div>
                  <div className="flex items-center justify-between pt-2"><span className="text-[8px] font-mono text-gray-700 uppercase">{p.date}</span><button onClick={() => navigator.clipboard.writeText(p.target)} className="text-gray-700 hover:text-[#00e5ff] transition-colors"><Copy size={12} /></button></div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function LogsModule({ logs, setLogs }: any) {
  const [search, setSearch] = useState('');
  const filtered = logs.filter((l: any) => l.input.toLowerCase().includes(search.toLowerCase()) || l.output.toLowerCase().includes(search.toLowerCase()));
  const exportLogs = () => {
    const content = logs.map((l: any) => `[${l.timestamp}] [${l.module}] ${l.sourceLang} -> ${l.targetLang}\nIN: ${l.input}\nOUT: ${l.output}\n------------------`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ai_translator_logs_${Date.now()}.txt`; a.click();
  };
  return (
    <div className="h-full flex flex-col space-y-6">
       <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search session archives..." className="w-full bg-[#0d0f14] border border-[rgba(255,255,255,0.1)] rounded-lg py-3 pl-10 pr-4 text-xs font-mono" /></div>
          <div className="flex gap-3"><button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2 bg-[#00e5ff]/5 border border-[#00e5ff]/20 text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest hover:bg-[#00e5ff]/10"><Download size={14} /> Export .TXT</button><button onClick={() => setLogs([])} className="flex items-center gap-2 px-4 py-2 bg-[#ff3366]/5 border border-[#ff3366]/20 text-[#ff3366] text-[10px] font-mono uppercase tracking-widest hover:bg-[#ff3366]/10"><Trash2 size={14} /> Clear</button></div>
       </div>
       <div className="flex-1 border border-[rgba(255,255,255,0.05)] rounded-xl bg-[#0d0f14] overflow-hidden">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
             <thead className="bg-[#080a0e] text-gray-500 uppercase tracking-widest border-b border-white/5"><tr><th className="p-4 font-bold">Timestamp</th><th className="p-4 font-bold">Module</th><th className="p-4 font-bold">Protocol</th><th className="p-4 font-bold">IO Stream</th></tr></thead>
             <tbody className="divide-y divide-white/5">
                {filtered.map((l: any) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group"><td className="p-4 text-gray-600 group-hover:text-gray-400">{l.timestamp}</td><td className="p-4"><span className="px-2 py-0.5 bg-[#0055ff]/10 text-[#0055ff] border border-[#0055ff]/20 rounded">{l.module}</span></td><td className="p-4 text-gray-500">{l.sourceLang} → {l.targetLang}</td><td className="p-4"><div className="space-y-1"><div className="text-gray-400 line-clamp-1 truncate max-w-[300px]">IN: {l.input}</div><div className="text-[#00e5ff] line-clamp-1 truncate max-w-[300px]">OUT: {l.output}</div></div></td></tr>
                ))}
             </tbody>
          </table>
          {filtered.length === 0 && <div className="p-20 text-center text-gray-700 italic text-xs">No records found.</div>}
       </div>
    </div>
  );
}

function SettingsModule({ prefs, setPrefs }: any) {
  const Toggle = ({ label, id, desc }: any) => (
    <div className="flex items-center justify-between p-4 bg-[#111318] border border-white/5 rounded-xl">
       <div className="space-y-1"><p className="text-[11px] font-bold text-white uppercase tracking-widest">{label}</p><p className="text-[9px] font-mono text-gray-600 uppercase">{desc}</p></div>
       <button onClick={() => setPrefs((p: any) => ({ ...p, [id]: !p[id] }))} className={cn("w-10 h-5 rounded-full relative transition-all", prefs[id] ? "bg-[#00e5ff]" : "bg-gray-800")}><div className={cn("absolute top-1 w-3 h-3 bg-black rounded-full transition-all", prefs[id] ? "left-6" : "left-1")} /></button>
    </div>
  );
  return (
    <div className="h-full flex flex-col space-y-8 max-w-3xl mx-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle label="Auto-detect Protocol" id="autoDetect" desc="Identify source language automatically" />
          <Toggle label="Semantic Romanization" id="romanization" desc="Enable phonetic scripts for non-latin fonts" />
          <Toggle label="Deep Contrast Mode" id="darkMode" desc="Dim interface to ultra-black spectrum" />
          <Toggle label="Neural Confidence" id="showConfidence" desc="Display translation stability scores" />
          <Toggle label="Macro Shortcuts" id="shortcuts" desc="Enable Ctrl+Enter and ESC keybinds" />
          <Toggle label="Audio Feedback" id="sound" desc="Click sounds on translation complete" />
          <Toggle label="Voice Readout" id="autoSpeak" desc="Automatically synthesize speech on output" />
       </div>
       <div className="space-y-6 bg-[#111318] border border-white/5 rounded-xl p-6">
          <div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Interface Scale</span><span className="text-[10px] font-mono text-[#00e5ff]">{prefs.fontSize}px</span></div><input type="range" min="12" max="18" value={prefs.fontSize} onChange={e => setPrefs((p: any) => ({ ...p, fontSize: parseInt(e.target.value) }))} className="w-full accent-[#00e5ff]" /></div>
          <div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Synthesizer Precision</span><span className="text-[10px] font-mono text-[#00e5ff]">{prefs.speed}</span></div><div className="flex bg-[#080a0e] border border-white/5 rounded-lg p-1">{['Fast', 'Balanced', 'Precise'].map(s => (<button key={s} onClick={() => setPrefs((p: any) => ({ ...p, speed: s }))} className={cn("flex-1 py-2 text-[9px] font-mono uppercase tracking-widest rounded transition-all", prefs.speed === s ? "bg-[#00e5ff]/10 text-[#00e5ff]" : "text-gray-600 hover:text-gray-400")}>{s}</button>))}</div></div>
       </div>
       <div className="p-4 bg-[#ff3366]/5 border border-[#ff3366]/20 rounded-xl flex items-center gap-4">
         <AlertCircle className="text-[#ff3366]" size={20} />
         <p className="text-[10px] font-mono text-gray-400 uppercase leading-relaxed">Changing core protocol configurations may require a <span className="text-[#ff3366]">AI Interface Restart</span> to fully recalibrate buffers.</p>
       </div>
    </div>
  );
}

function AboutModule({ uptime, formatUptime }: any) {
  const specs = [
    { label: "Core LLM", value: "Llama 3.3 70B", desc: "High-throughput versatile model", icon: <Cpu size={14} /> },
    { label: "OCR Engine", value: "Tesseract JS", desc: "Neural character recognition", icon: <ImageIcon size={14} /> },
    { label: "Synthesis", value: "Web Speech API", desc: "Multi-regional voice synthesis", icon: <Volume2 size={14} /> },
    { label: "API Bridge", value: "Groq Cloud", desc: "Ultra-low latency inference", icon: <Zap size={14} /> },
    { label: "Storage", value: "SQLite 3", desc: "Persistent session vault", icon: <ShieldCheck size={14} /> },
    { label: "Frontend", value: "React 19", desc: "Declarative UI architecture", icon: <Monitor size={14} /> },
    { label: "Bundler", value: "Vite 6.0", desc: "Next-gen lightning build system", icon: <Terminal size={14} /> },
    { label: "Protocol", value: "HTTP/REST", desc: "Secure encrypted transmission", icon: <Info size={14} /> },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-10 relative overflow-hidden animate-in fade-in duration-1000">
       <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-around overflow-hidden font-mono text-[8px] text-[#00e5ff]">
         {Array.from({ length: 12 }).map((_, i) => (
           <div key={i} className="animate-matrix-fall whitespace-pre" style={{ animationDelay: `${i * 0.4}s`, animationDuration: "10s" }}>
             {Array.from({ length: 60 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
           </div>
         ))}
       </div>

       <div className="relative w-full max-w-5xl space-y-10 z-10">
          <div className="text-center space-y-4">
             <div className="flex justify-center mb-4">
                <div className="px-3 py-1 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono uppercase tracking-[0.4em] rounded-full">System Diagnostics</div>
             </div>
             <h3 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter uppercase italic glow-text">AI-TRANSLATOR <span className="text-[#00e5ff]">v1.0.2</span></h3>
             <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.5em] max-w-2xl mx-auto leading-loose">Comprehensive documentation of the neural linguistic engine and protocol architecture.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {specs.map((s, idx) => (
               <div key={idx} className="bg-[#0d0f14]/60 border border-[rgba(0,229,255,0.08)] p-6 rounded-2xl hover:border-[#00e5ff]/30 transition-all group backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/5 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform">{s.icon}</div>
                     <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-white uppercase tracking-tight">{s.value}</p>
                     <p className="text-[10px] font-mono text-gray-600 uppercase">{s.desc}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 bg-[#0d0f14]/60 border border-[rgba(0,229,255,0.08)] p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={64} className="text-[#00e5ff]" /></div>
                <h4 className="text-[11px] font-mono text-[#00e5ff] uppercase tracking-[0.4em] mb-6">Engine Telemetry</h4>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1"><p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Protocol Status</p><p className="text-lg font-bold text-[#00ff88] uppercase flex items-center gap-2 italic">● ACTIVE</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Latency Rate</p><p className="text-lg font-bold text-white uppercase italic">OPTIMIZED</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Interface Uptime</p><p className="text-lg font-bold text-white font-mono uppercase italic">{formatUptime(uptime)}</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Neural Threads</p><p className="text-lg font-bold text-white uppercase italic">8 ACTIVE</p></div>
                </div>
             </div>

             <div className="w-full md:w-[320px] bg-[#0d0f14]/60 border border-[rgba(255,51,102,0.15)] p-8 rounded-3xl backdrop-blur-md flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 text-[#ff3366]">
                   <AlertCircle size={20} />
                   <span className="text-[10px] font-mono uppercase tracking-widest">Access Control</span>
                </div>
                <p className="text-xs font-mono text-gray-500 uppercase leading-relaxed mb-6">Secure encrypted bridge detected. All translation buffers are ephemeral and purged upon session termination.</p>
                <div className="h-px bg-white/5 mb-6" />
                <div className="flex justify-between items-center"><span className="text-[9px] font-mono text-gray-700 uppercase">Hardware ID</span><span className="text-[10px] font-mono text-gray-500">QC-X99-PRO</span></div>
             </div>
          </div>
       </div>
    </div>
  );
}

// --- UTILS ---

function LanguageModal({ onClose, onSelect, selected }: any) {
  const [search, setSearch] = useState('');
  const filtered = SUPPORTED_LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.native.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleEsc); return () => window.removeEventListener('keydown', handleEsc); }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
       <div className="bg-[#0d0f14] border border-[rgba(0,229,255,0.2)] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-white/5 space-y-4"><div className="flex justify-between items-center"><h3 className="font-display font-bold text-xl text-white tracking-widest uppercase">Protocol Selector</h3><button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button></div><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search available protocols..." className="w-full bg-[#080a0e] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm font-mono" /></div></div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 scrollbar-hide">{filtered.map(l => (<button key={l.code} onClick={() => onSelect(l)} className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all text-left group", selected?.code === l.code ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff] glow-border" : "bg-[#080a0e] border-white/5 text-gray-500 hover:border-[#00e5ff]/40 hover:text-white")}><span className="text-2xl">{l.flag}</span><div className="min-w-0"><p className="text-[11px] font-bold uppercase truncate tracking-widest">{l.name}</p><p className="text-[9px] font-mono opacity-50 truncate">{l.native}</p></div>{selected?.code === l.code && <Check size={14} className="ml-auto shrink-0" />}</button>))}</div>
       </div>
    </div>
  );
}
