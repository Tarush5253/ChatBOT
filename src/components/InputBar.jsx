import React, { useEffect, useRef } from "react";
import { Mic, Send, Square, StopCircle } from "lucide-react";

const MAX_LEN = 4000;

export function InputBar({
  value,
  onChange,
  onSubmit,
  disabled,
  busy,
  onAbort,
  onStartVoice,
  onStopVoice,
  listening,
  voiceSupported,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [value]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (busy || disabled) return;
    if (!value.trim()) return;
    onSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const charsLeft = MAX_LEN - value.length;
  const showCounter = value.length > MAX_LEN * 0.85;

  return (
    <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2 bg-gradient-to-t from-surface via-surface to-surface/0">
      <form
        onSubmit={submit}
        className="max-w-3xl mx-auto"
        aria-label="Send a message"
      >
        <div
          className={`relative flex items-end gap-2 p-2 rounded-2xl border bg-surface-raised
            transition-all duration-200 shadow-sm
            ${
              listening
                ? "border-ink ring-2 ring-ink/10"
                : "border-border focus-within:border-border-strong focus-within:shadow-md"
            }`}
        >
          {voiceSupported && (
            <button
              type="button"
              onClick={listening ? onStopVoice : onStartVoice}
              disabled={disabled}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                transition-all duration-200 disabled:opacity-40
                ${
                  listening
                    ? "bg-ink text-surface mic-recording"
                    : "bg-surface-sunken text-ink-soft hover:bg-surface hover:text-ink border border-border"
                }`}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              title={listening ? "Stop listening" : "Speak your message"}
            >
              {listening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={handleKeyDown}
            placeholder={
              listening ? "Listening… speak now" : "Message Nova…"
            }
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed
              placeholder:text-ink-faint scroll-thin max-h-[220px]"
            aria-label="Message input"
          />

          {busy ? (
            <button
              type="button"
              onClick={onAbort}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-ink text-surface flex items-center justify-center
                hover:opacity-90 active:scale-95 transition-all"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${
                  value.trim() && !disabled
                    ? "bg-ink text-surface hover:opacity-90 active:scale-95 animate-pop"
                    : "bg-surface-sunken text-ink-faint cursor-not-allowed"
                }`}
              aria-label="Send message"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-faint px-2">
          <span>
            {listening
              ? "Recording… click the mic to stop."
              : "Press Enter to send · Shift+Enter for newline"}
          </span>
          {showCounter && (
            <span className={charsLeft < 100 ? "text-ink" : ""}>
              {charsLeft} chars left
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
