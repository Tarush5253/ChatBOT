import React, { useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Copy, Check, Volume2, Square, User, AlertCircle } from "lucide-react";
import { Logo } from "./Logo.jsx";

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, "");
  const lang = /language-(\w+)/.exec(className || "")?.[1];

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative group/code my-3">
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink-faint border-b border-border bg-surface-sunken rounded-t-xl">
        <span>{lang || "code"}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function Message({
  role,
  content,
  streaming = false,
  error = false,
  onSpeak,
  onStopSpeak,
  speaking = false,
  speechSupported = false,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const onCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className={`group/msg flex gap-3 sm:gap-4 px-3 sm:px-6 py-5 animate-slide-up
        ${isUser ? "" : "bg-surface-raised/40"}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm
          ${
            isUser
              ? "bg-surface-sunken border border-border text-ink"
              : error
              ? "bg-ink text-surface"
              : "bg-ink text-surface"
          }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : error ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Logo size={18} className="text-surface" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-ink-soft">
            {isUser ? "You" : "Nova"}
          </span>
          {streaming && (
            <span className="text-[10px] uppercase tracking-wider text-ink-faint animate-pulse-soft">
              typing
            </span>
          )}
          {error && (
            <span className="text-[10px] uppercase tracking-wider text-ink-faint">
              error
            </span>
          )}
        </div>

        <div
          className={`md-body text-ink ${streaming ? "caret" : ""} ${
            error ? "text-ink-muted italic" : ""
          }`}
        >
          {isUser || error ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
          ) : (
            <Markdown
              rehypePlugins={[rehypeHighlight]}
              components={{ code: CodeBlock }}
            >
              {content || " "}
            </Markdown>
          )}
        </div>

        {!streaming && content && !error && (
          <div className="mt-2 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={onCopyMessage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
            {!isUser && speechSupported && (
              <button
                onClick={() => (speaking ? onStopSpeak?.() : onSpeak?.(content))}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors"
                aria-label={speaking ? "Stop reading" : "Read aloud"}
              >
                {speaking ? (
                  <>
                    <Square className="w-3 h-3" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" /> Read aloud
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 sm:gap-4 px-3 sm:px-6 py-5 bg-surface-raised/40 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-ink text-surface flex items-center justify-center shadow-sm">
        <Logo size={18} className="text-surface" />
      </div>
      <div className="flex items-center pt-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
