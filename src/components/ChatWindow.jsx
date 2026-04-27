import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Message, TypingIndicator } from "./Message";

export function ChatWindow({
  messages,
  loading,
  streamingId,
  onSpeak,
  onStopSpeak,
  speakingId,
  speechSupported,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const nearBottom = distanceFromBottom < 80;
      setAutoScroll(nearBottom);
      setShowScrollBtn(!nearBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading, autoScroll]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setAutoScroll(true);
  };

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto scroll-thin"
      >
        <div className="max-w-3xl mx-auto py-2">
          {messages.map((m) => (
            <Message
              key={m.id}
              role={m.role}
              content={m.content}
              streaming={m.id === streamingId}
              error={m.error}
              onSpeak={(t) => onSpeak?.(t, m.id)}
              onStopSpeak={onStopSpeak}
              speaking={speakingId === m.id}
              speechSupported={speechSupported}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
            flex items-center justify-center w-9 h-9 rounded-full
            bg-surface-raised border border-border-strong text-ink shadow-md
            hover:bg-surface-sunken transition-all animate-pop"
          aria-label="Scroll to latest"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
