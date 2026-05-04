export const useTextToSpeech = () => {
  const speak = (text: string, lang: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'auto' ? 'en-US' : lang; // Fallback to EN if auto
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
};
