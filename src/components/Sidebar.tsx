import React from 'react';
import { 
  MessageSquare, Languages, Mic, Image as ImageIcon, 
  Info, Bookmark, History, Settings, Plus, ArrowRightLeft 
} from 'lucide-react';
import { cn } from '../utils/cn';

export type PageId = 'chat' | 'translator' | 'voice' | 'image' | 'about' | 'phrasebook' | 'history' | 'settings';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
  targetLang: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, targetLang }) => {
  const navItems = [
    { id: 'chat', label: 'AI Chatbot', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'translator', label: 'Translator', icon: <Languages className="w-5 h-5" /> },
    { id: 'voice', label: 'Voice Translate', icon: <Mic className="w-5 h-5" /> },
    { id: 'image', label: 'Image Translate', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
  ];

  const libraryItems = [
    { id: 'phrasebook', label: 'Phrasebook', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-[260px] h-screen bg-bg-secondary border-r border-border-default flex flex-col z-40">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_#00C8FF]" />
          <span className="font-display font-bold text-lg tracking-tighter text-white">AI-TRANSLATOR</span>
        </div>
        
        <button className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm border-accent-cyan/40 hover:border-accent-cyan">
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.id}
            {...item}
            isActive={activePage === item.id}
            onClick={() => onPageChange(item.id as PageId)}
          />
        ))}

        <div className="my-6 px-3">
          <div className="h-px bg-border-default w-full" />
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mt-4 block">
            Library
          </span>
        </div>

        {libraryItems.map((item) => (
          <SidebarItem 
            key={item.id}
            {...item}
            isActive={activePage === item.id}
            onClick={() => onPageChange(item.id as PageId)}
          />
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border-default">
        <div className="badge-cyber w-full flex items-center justify-between mb-2 py-1.5 px-3 bg-accent-cyan/5">
          <span className="text-[10px] text-text-secondary">ACTIVE PROTOCOL</span>
          <div className="flex items-center gap-1.5 font-bold text-accent-cyan">
            EN <ArrowRightLeft className="w-3 h-3" /> {targetLang.toUpperCase()}
          </div>
        </div>
        <div className="text-[10px] font-mono text-text-secondary flex justify-between px-1">
          <span>v2.0.4-STABLE</span>
          <span className="text-accent-green">ENCRYPTED</span>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ id, label, icon, isActive, onClick }: { id: string, label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
      isActive 
        ? "sidebar-item-active text-accent-cyan" 
        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
    )}
  >
    <span className={cn("transition-colors", isActive ? "text-accent-cyan" : "group-hover:text-accent-cyan")}>
      {icon}
    </span>
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </button>
);
