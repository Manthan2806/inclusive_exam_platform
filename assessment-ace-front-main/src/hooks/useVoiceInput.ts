import { useCallback, useEffect, useRef, useState } from "react";

type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export function useVoiceInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);
  const baseRef = useRef("");

  useEffect(() => {
    const W: any = typeof window !== "undefined" ? window : {};
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec: SR = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e: any) => {
      let interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      if (finalText) baseRef.current += finalText;
      setTranscript((baseRef.current + " " + interim).trim());
    };
    rec.onerror = (e: any) => setError(String(e?.error ?? "speech error"));
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => rec.abort();
  }, []);

  const start = useCallback(() => {
    setError(null);
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already running */
    }
  }, []);
  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);
  const reset = useCallback(() => {
    baseRef.current = "";
    setTranscript("");
  }, []);
  const setManual = useCallback((t: string) => {
    baseRef.current = t;
    setTranscript(t);
  }, []);

  return { listening, transcript, supported, error, start, stop, reset, setManual };
}
