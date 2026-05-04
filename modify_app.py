import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update PageId
content = content.replace("type PageId = 'welcome' | 'chat'", "type PageId = 'landing' | 'welcome' | 'chat'")

# 2. Add languages
new_langs = """  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
];"""
content = content.replace("];", new_langs, 1)

# 3. Change initial activePage
content = content.replace("useState<PageId>('welcome')", "useState<PageId>('landing')")

# 4. Add chatBot function
chatbot_fn = """  const chatBot = async (messagesArray: any[]) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesArray })
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

  const startNewSession = () => {"""
content = content.replace("  const startNewSession = () => {", chatbot_fn)

# 5. Modify confirmNewSession
new_confirm = """  const confirmNewSession = () => {
    setChatMessages([]);
    setIsConfirmModalOpen(false);
    addToast("Chat session cleared", "success");
  };"""

content = re.sub(r'  const confirmNewSession = \(\) => \{.*?\n  \};', new_confirm, content, flags=re.DOTALL)

# 6. Update ChatModule invocation
content = content.replace("<ChatModule messages={chatMessages} setMessages={setChatMessages} onSend={(t) => translate(t, 'chat')} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} speak={speak} />",
                          "<ChatModule messages={chatMessages} setMessages={setChatMessages} onSend={chatBot} isProcessing={isProcessing} speak={speak} />")

# 7. Update ChatModule component
old_chat = """function ChatModule({ messages, setMessages, onSend, isProcessing, sourceLang, targetLang, speak }: any) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const currentInput = input;
    setInput('');
    setMessages((prev: any) => [...prev, { id: Date.now().toString(), role: 'user', content: currentInput, timestamp: new Date().toLocaleTimeString() }]);
    const result = await onSend(currentInput);
    if (result) {
      setMessages((prev: any) => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: result, timestamp: new Date().toLocaleTimeString(), lang: targetLang?.name, flag: targetLang?.flag }]);
    }
  };"""

new_chat = """function ChatModule({ messages, setMessages, onSend, isProcessing, speak }: any) {
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
  };"""

content = content.replace(old_chat, new_chat)

# 8. Render Landing Page
landing_render = """          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-8">
            {activePage === 'landing' && <LandingPage onLaunch={() => setActivePage('welcome')} />}"""
content = content.replace("""          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-8">""", landing_render)

# 9. Add LandingPage component
landing_comp = """function LandingPage({ onLaunch }: any) {
  return (
    <div className="fixed inset-0 z-[300] bg-[#0d0f14] flex flex-col items-center justify-center p-4">
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

// --- SUB-COMPONENTS ---"""

content = content.replace("// --- SUB-COMPONENTS ---", landing_comp)

# Also ensure "AI Interface // Chat" does not require language flags to be rendered
# remove lang and flag from ChatModule m references.
content = content.replace("m.lang === targetLang?.name ? targetLang?.code : 'en'", "'en'")
content = content.replace("{m.lang ? `// ${m.lang}` : ''}", "")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
