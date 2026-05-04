import re

# Update server.ts
with open('server.ts', 'r', encoding='utf-8') as f:
    server_content = f.read()

server_content = server_content.replace(
    "const { messages } = req.body;",
    "const { messages, sourceLang, targetLang } = req.body;\n      const systemContent = sourceLang && targetLang ? `You are a helpful AI chatbot. The user speaks ${sourceLang} and you must reply in ${targetLang}. Act as a conversational partner, translating if necessary, but always respond in ${targetLang}.` : \"You are a helpful AI chatbot. You can speak multiple languages and help the user with anything they need.\";"
)

server_content = server_content.replace(
    '{ role: "system", content: "You are a helpful AI chatbot. You can speak multiple languages and help the user with anything they need." },',
    '{ role: "system", content: systemContent },'
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(server_content)

# Update src/App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Update chatBot to include sourceLang and targetLang
new_chatbot = """  const chatBot = async (messagesArray: any[]) => {
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
      });"""
app_content = re.sub(
    r"  const chatBot = async \(messagesArray: any\[\]\) => \{\n    setIsProcessing\(true\);\n    try \{\n      const res = await fetch\('/api/chat', \{\n        method: 'POST',\n        headers: \{ 'Content-Type': 'application/json' \},\n        body: JSON\.stringify\(\{ messages: messagesArray \}\)\n      \}\);",
    new_chatbot,
    app_content
)

# Add handleStartChatFromWelcome function before startNewSession
handle_start = """  const handleStartChatFromWelcome = async (text: string) => {
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

  const startNewSession"""
app_content = app_content.replace("  const startNewSession", handle_start)


# Update WelcomeScreen invocation
app_content = app_content.replace(
    "{activePage === 'welcome' && <WelcomeScreen onSuggestion={(s) => translate(s, 'welcome')} isProcessing={isProcessing} translate={translate} sourceLang={sourceLang} targetLang={targetLang} />}",
    "{activePage === 'welcome' && <WelcomeScreen onSuggestion={handleStartChatFromWelcome} isProcessing={isProcessing} sourceLang={sourceLang} targetLang={targetLang} onStartChat={handleStartChatFromWelcome} />}"
)

# Update WelcomeScreen component
new_welcome = """function WelcomeScreen({ onSuggestion, isProcessing, sourceLang, targetLang, onStartChat }: any) {
  const [input, setInput] = useState('');
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const currentInput = input;
    setInput('');
    onStartChat(currentInput);
  };"""
app_content = re.sub(
    r"function WelcomeScreen\(\{ onSuggestion, isProcessing, translate, sourceLang, targetLang \}: any\) \{\n  const \[input, setInput\] = useState\(''\);\n  const handleSend = async \(\) => \{\n    if \(!input.trim\(\) \|\| isProcessing\) return;\n    const result = await translate\(input, 'welcome'\);\n    if \(result\) setInput\(''\);\n  \};",
    new_welcome,
    app_content
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
