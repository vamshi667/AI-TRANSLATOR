import React from 'react';
import { 
  MessageSquare, Languages, Mic, Image as ImageIcon, 
  Info, Bookmark, History, Settings, Plus, Menu, User, 
  ChevronRight, Sparkles, Circle
} from 'lucide-react';
import { cn } from '../utils/cn';

export type PageId = 'chat' | 'translator' | 'voice' | 'image' | 'about' | 'phrasebook' | 'history' | 'settings';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
  onNewSession: () => void;
  targetLang: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, onNewSession, targetLang }) => {
  const navItems = [
    { id: 'chat', label: 'Neural Chat', icon: <MessageSquare size={20} /> },
    { id: 'translator', label: 'Classic Translate', icon: <Languages size={20} /> },
    { id: 'voice', label: 'Voice Link', icon: <Mic size={20} /> },
    { id: 'image', label: 'Visual OCR', icon: <ImageIcon size={20} /> },
  ];

  const libraryItems = [
    { id: 'phrasebook', label: 'Phrasebook', icon: <Bookmark size={18} /> },
    { id: 'history', label: 'Session Logs', icon: <History size={18} /> },
    { id: 'settings', label: 'Preferences', icon: <Settings size={18} /> },
    { id: 'about', label: 'About Engine', icon: <Info size={18} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#05070B] border-r border-[rgba(255,255,255,0.03)] flex-col z-[300] transition-all duration-500 hidden md:flex">
      {/* Brand Area */}
      <div className="h-[64px] flex items-center px-8 border-b border-[rgba(255,255,255,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D1FF] shadow-[0_0_12px_#00D1FF] animate-pulse" />
          <span className="font-display font-black text-white text-base tracking-tighter uppercase italic">Neural Sync</span>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={onNewSession}
          className="btn-primary w-full py-3.5 text-[10px] font-black tracking-[0.2em] shadow-glow"
        >
          <Plus size={16} strokeWidth={3} /> NEW SESSION
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide pt-4">
        <SectionLabel>Core Modules</SectionLabel>
        {navItems.map((item) => (
          <NavButton 
            key={item.id}
            active={activePage === item.id}
            onClick={() => onPageChange(item.id as PageId)}
            icon={item.icon}
            label={item.label}
          />
        ))}

        <div className="py-6">
          <SectionLabel>Intel Library</SectionLabel>
          <div className="h-px bg-white/5 w-full my-4 mx-3" />
        </div>

        {libraryItems.map((item) => (
          <NavButton 
            key={item.id}
            active={activePage === item.id}
            onClick={() => onPageChange(item.id as PageId)}
            icon={item.icon}
            label={item.label}
            small
          />
        ))}
      </nav>

      {/* User Status */}
      <div className="p-6 bg-[#030509] border-t border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#8B5CF6]/20 border border-white/10 flex items-center justify-center">
           <User size={20} className="text-[#00D1FF]" />
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-xs font-bold text-white truncate">Guest_User_99</p>
           <div className="flex items-center gap-1.5">
              <Circle size={6} fill="#10B981" className="text-[#10B981]" />
              <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest">Protocol Active</span>
           </div>
        </div>
      </div>
    </aside>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.3em] block mb-2">{children}</span>
);

const NavButton = ({ active, onClick, icon, label, small }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, small?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-5 rounded-xl transition-all duration-300 group relative overflow-hidden",
      small ? "py-2.5" : "py-3.5",
      active 
        ? "bg-white/5 text-[#00D1FF]" 
        : "text-[#94A3B8] hover:text-white hover:bg-white/[0.02]"
    )}
  >
    {active && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#00D1FF] rounded-r-full shadow-[0_0_10px_#00D1FF]" />}
    <span className={cn(
      "transition-transform duration-300",
      active ? "scale-110" : "group-hover:scale-110",
      active ? "text-[#00D1FF]" : "group-hover:text-[#00D1FF]"
    )}>{icon}</span>
    <span className={cn(
      "font-bold tracking-tight whitespace-nowrap transition-all duration-300",
      small ? "text-[11px]" : "text-[13px]",
      active ? "translate-x-1" : "group-hover:translate-x-1"
    )}>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-40" />}
  </button>
);

interface TopbarProps {
  pageTitle: string;
  targetLang: string;
}

export const AppTopbar: React.FC<TopbarProps> = ({ pageTitle, targetLang }) => (
  <header className="fixed top-0 left-0 right-0 h-[64px] glass border-b border-white/5 flex items-center justify-between px-10 z-[250] ml-0 md:ml-[260px]">
    <div className="flex items-center gap-4">
      <button className="md:hidden text-[#94A3B8]"><Menu size={20} /></button>
      <div className="flex flex-col">
        <h2 className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.4em] leading-none mb-1">Module // 0{Math.floor(Math.random()*9)+1}</h2>
        <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">{pageTitle}</h1>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2 rounded-full border border-white/5">
        <span className="text-[10px] font-black text-[#475569]">EN</span>
        <div className="w-1 h-1 rounded-full bg-[#475569]" />
        <span className="text-[10px] font-black text-[#00D1FF]">{targetLang.toUpperCase()}</span>
      </div>
      
      <div className="flex items-center gap-2">
         <div className="h-8 w-px bg-white/5 mx-2" />
         <button className="p-2 text-[#475569] hover:text-[#00D1FF] transition-all"><Sparkles size={18} /></button>
         <button className="p-2 text-[#475569] hover:text-white transition-all"><Settings size={18} /></button>
      </div>
    </div>
  </header>
);
