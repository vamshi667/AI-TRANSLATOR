export async function chatWithGroq(
  messages: { role: string, content: string }[], 
  targetLang: string, 
  formality: string = 'Neutral',
  onChunk?: (text: string) => void
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, targetLang, formality })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to communicate with Groq API');
  }

  if (!onChunk) {
    return await response.text();
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available for streaming");

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}
