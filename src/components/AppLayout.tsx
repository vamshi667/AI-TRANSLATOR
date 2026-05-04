import React from 'react';
import { Sidebar, AppTopbar, PageId } from './AppShell';

interface AppLayoutProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
  onNewSession: () => void;
  targetLang: string;
  pageTitle: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  activePage, 
  onPageChange, 
  onNewSession,
  targetLang, 
  pageTitle, 
  children 
}) => {
  return (
    <div className="h-screen bg-[#020408] text-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar 
        activePage={activePage} 
        onPageChange={onPageChange} 
        onNewSession={onNewSession}
        targetLang={targetLang}
      />
      
      {/* Main Content Bridge */}
      <div className="h-full flex flex-col md:ml-[260px] relative overflow-hidden">
        <AppTopbar pageTitle={pageTitle} targetLang={targetLang} />
        
        <main className="flex-1 pt-[64px] overflow-hidden">
          <div className="h-full w-full overflow-y-auto scrollbar-hide">
             {children}
          </div>
        </main>

        {/* Decorative Background Grains/Glows */}
        <div className="fixed top-1/4 right-0 w-[800px] h-[800px] bg-[#00D1FF]/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="fixed bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
};
