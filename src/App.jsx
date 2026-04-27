import React, { useCallback, useEffect, useRef, useState } from "react";
import { Menu, PanelLeft, MoreHorizontal } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { InputBar } from "./components/InputBar";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Wordmark } from "./components/Logo";
import { useChatStorage } from "./hooks/useChatStorage";
import { useTheme } from "./hooks/useTheme";
import { useSpeechRecognition, useSpeechSynthesis } from "./hooks/useSpeech";
import { generateReply, generateChatTitle } from "./api/gemini";

function uid() {
  return (
    (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    chats,
    createChat,
    updateChat,
    deleteChat,
    clearAll,
    renameChat,
  } = useChatStorage();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingId, setStreamingId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  const abortRef = useRef({ aborted: false });
  const streamTimerRef = useRef(null);

  const speech = useSpeechSynthesis();
  const voice = useSpeechRecognition({
    onResult: (transcript, isFinal) => {
      setInput(transcript);
      if (isFinal) voice.stop();
    },
  });

  // Sync messages when switching chats
  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }
    const chat = chats.find((c) => c.id === currentChatId);
    setMessages(chat?.messages || []);
  }, [currentChatId]); // eslint-disable-line

  // Close mobile sidebar on resize up to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
    speech.stop();
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [speech]);

  const handleSelectChat = useCallback(
    (id) => {
      setCurrentChatId(id);
      speech.stop();
      if (window.innerWidth < 768) setSidebarOpen(false);
    },
    [speech]
  );

  const handleDeleteChat = useCallback(
    (id) => {
      deleteChat(id);
      if (id === currentChatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    },
    [deleteChat, currentChatId]
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    setCurrentChatId(null);
    setMessages([]);
  }, [clearAll]);

  const persistMessages = useCallback(
    (chatId, msgs) => {
      updateChat(chatId, { messages: msgs });
    },
    [updateChat]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current.aborted = true;
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setBusy(false);
    setStreamingId(null);
  }, []);

  const sendMessage = useCallback(
    async (rawText) => {
      const text = (rawText ?? input).trim();
      if (!text || busy) return;

      voice.stop();
      speech.stop();

      // Ensure a chat exists
      let chatId = currentChatId;
      let isNewChat = false;
      if (!chatId) {
        const created = createChat(text);
        chatId = created.id;
        isNewChat = true;
        setCurrentChatId(chatId);
      }

      const userMsg = { id: uid(), role: "user", content: text };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setBusy(true);
      abortRef.current = { aborted: false };

      try {
        const reply = await generateReply(nextMessages);

        if (abortRef.current.aborted) return;

        const aiId = uid();
        const aiMsg = { id: aiId, role: "ai", content: "" };
        let withAi = [...nextMessages, aiMsg];
        setMessages(withAi);
        setStreamingId(aiId);

        // Smooth typewriter effect (chunked for speed)
        const totalDurationMs = Math.min(2200, Math.max(450, reply.length * 8));
        const chunkSize = Math.max(1, Math.ceil(reply.length / (totalDurationMs / 22)));
        let i = 0;

        await new Promise((resolve) => {
          streamTimerRef.current = setInterval(() => {
            if (abortRef.current.aborted) {
              clearInterval(streamTimerRef.current);
              streamTimerRef.current = null;
              withAi = withAi.map((m) =>
                m.id === aiId ? { ...m, content: reply } : m
              );
              setMessages(withAi);
              resolve();
              return;
            }
            i = Math.min(reply.length, i + chunkSize);
            withAi = withAi.map((m) =>
              m.id === aiId ? { ...m, content: reply.slice(0, i) } : m
            );
            setMessages(withAi);
            if (i >= reply.length) {
              clearInterval(streamTimerRef.current);
              streamTimerRef.current = null;
              resolve();
            }
          }, 22);
        });

        setStreamingId(null);
        persistMessages(chatId, withAi);

        // For brand-new chats, generate a nicer title in the background
        if (isNewChat) {
          generateChatTitle(text).then((title) => {
            if (title) renameChat(chatId, title);
          });
        }
      } catch (err) {
        const errMsg = {
          id: uid(),
          role: "ai",
          content: err.message || "Something went wrong. Please try again.",
          error: true,
        };
        const withErr = [...nextMessages, errMsg];
        setMessages(withErr);
        persistMessages(chatId, withErr);
      } finally {
        setBusy(false);
        setStreamingId(null);
      }
    },
    [
      input,
      busy,
      messages,
      currentChatId,
      createChat,
      persistMessages,
      voice,
      speech,
      renameChat,
    ]
  );

  const showWelcome = messages.length === 0 && !busy;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-ink">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={renameChat}
        onClearAll={handleClearAll}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 sm:px-5 h-14 border-b border-border bg-surface/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-surface-sunken transition-colors"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
            <div className="md:hidden">
              <Wordmark />
            </div>
            <div className="hidden md:block text-sm text-ink-muted truncate max-w-[40ch]">
              {currentChatId
                ? chats.find((c) => c.id === currentChatId)?.title
                : "New conversation"}
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-surface-sunken border border-border hover:border-border-strong hover:bg-surface
              transition-colors"
            title="Start a new chat"
          >
            <MoreHorizontal className="w-3 h-3" />
            <span>New chat</span>
          </button>
        </header>

        {showWelcome ? (
          <WelcomeScreen onPick={(t) => sendMessage(t)} />
        ) : (
          <ChatWindow
            messages={messages}
            loading={busy && streamingId === null}
            streamingId={streamingId}
            onSpeak={(text, id) => speech.speak(text, id)}
            onStopSpeak={speech.stop}
            speakingId={speech.speakingId}
            speechSupported={speech.supported}
          />
        )}

        <InputBar
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage()}
          disabled={false}
          busy={busy}
          onAbort={stopStreaming}
          onStartVoice={voice.start}
          onStopVoice={voice.stop}
          listening={voice.listening}
          voiceSupported={voice.supported}
        />
      </main>
    </div>
  );
}
