import { useEffect, useState, useCallback } from "react";

const KEY = "nova-chat-history";

function readStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useChatStorage() {
  const [chats, setChats] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(chats));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [chats]);

  const createChat = useCallback((firstMessage = "New conversation") => {
    const chat = {
      id:
        (crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title:
        firstMessage.length > 40
          ? firstMessage.slice(0, 40).trim() + "…"
          : firstMessage || "New conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setChats((prev) => [chat, ...prev]);
    return chat;
  }, []);

  const updateChat = useCallback((id, patch) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...(typeof patch === "function" ? patch(c) : patch), updatedAt: Date.now() }
          : c
      )
    );
  }, []);

  const deleteChat = useCallback((id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => setChats([]), []);

  const renameChat = useCallback(
    (id, title) => updateChat(id, { title: title?.trim() || "Untitled" }),
    [updateChat]
  );

  return { chats, createChat, updateChat, deleteChat, clearAll, renameChat };
}
