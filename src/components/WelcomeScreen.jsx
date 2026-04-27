import React from "react";
import { Lightbulb, Code2, BookOpen, Compass } from "lucide-react";
import { Logo } from "./Logo.jsx";

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Brainstorm",
    text: "Give me five startup ideas combining AI and education.",
  },
  {
    icon: Code2,
    title: "Code help",
    text: "Explain async/await in JavaScript with a practical example.",
  },
  {
    icon: BookOpen,
    title: "Summarize",
    text: "Summarize the plot of 'The Great Gatsby' in 5 bullet points.",
  },
  {
    icon: Compass,
    title: "Plan a trip",
    text: "Plan a 3-day budget itinerary for Jaipur for a college student.",
  },
];

export function WelcomeScreen({ onPick }) {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-y-auto scroll-hidden bg-grid">
      <div className="w-full max-w-3xl mx-auto px-6 py-10 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-ink rounded-full scale-90" />
            <div className="relative animate-pop">
              <Logo size={68} className="text-ink" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-[var(--ink)] to-[var(--ink-muted)]">
            How can I help you today?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-muted max-w-md">
            Ask anything — from quick facts to deep explanations. Your conversations stay private on this device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                onClick={() => onPick(s.text)}
                className="group text-left p-4 rounded-2xl border border-border bg-surface-raised
                  hover:border-border-strong hover:bg-surface-sunken hover:-translate-y-0.5
                  transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${0.05 + i * 0.05}s`, animationFillMode: "backwards" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-ink text-surface flex items-center justify-center
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{s.title}</div>
                    <div className="mt-0.5 text-sm text-ink-muted leading-snug">
                      {s.text}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
