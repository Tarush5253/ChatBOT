import { useEffect, useRef, useState, useCallback } from "react";

const SR =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const [supported] = useState(Boolean(SR));
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";

    rec.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult?.(transcript, event.results[event.results.length - 1].isFinal);
    };
    rec.onend = () => {
      setListening(false);
      onEnd?.();
    };
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, [onResult, onEnd]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      /* recognition may already be running */
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}

export function useSpeechSynthesis() {
  const [supported] = useState(Boolean(synth));
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => {
    if (!synth) return;
    return () => synth.cancel();
  }, []);

  const speak = useCallback(
    (text, id) => {
      if (!synth || !text) return;
      synth.cancel();
      const cleaned = text
        .replace(/```[\s\S]*?```/g, " code block ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*?([^*]+)\*\*?/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[#>*_~]/g, "")
        .trim();
      const u = new SpeechSynthesisUtterance(cleaned);
      u.rate = 1.02;
      u.pitch = 1;
      u.lang = navigator.language || "en-US";
      u.onend = () => setSpeakingId(null);
      u.onerror = () => setSpeakingId(null);
      setSpeakingId(id ?? "_");
      synth.speak(u);
    },
    []
  );

  const stop = useCallback(() => {
    if (!synth) return;
    synth.cancel();
    setSpeakingId(null);
  }, []);

  return { supported, speakingId, speak, stop };
}
