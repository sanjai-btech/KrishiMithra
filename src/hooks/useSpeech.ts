import { useState, useCallback, useRef } from "react";

interface UseSpeechOptions {
  lang?: string;
  onResult?: (text: string) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = ({ lang = "en-US", onResult, onEnd }: UseSpeechOptions = {}) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(result);
      if (event.results[0].isFinal) {
        onResult?.(result);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      onEnd?.();
    };
    recognition.onend = () => {
      setListening(false);
      onEnd?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onResult, onEnd]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, transcript, startListening, stopListening };
};

export const speak = (text: string, lang: string = "en-US") => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};
