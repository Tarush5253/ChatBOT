import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Sun,
  Moon,
  X,
  Sparkles,
  Pencil,
  Check,
} from "lucide-react";
import { Wordmark } from "./Logo.jsx";

function groupByDate(chats) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfYesterday = startOfDay - 86400000;
  const startOfWeek = startOfDay - 7 * 86400000;
  const startOfMonth = startOfDay - 30 * 86400000;

  const groups = { Today: [], Yesterday: [], "Previous 7 days": [], "Previous 30 days": [], Older: [] };

  for (const c of chats) {
    const t = c.updatedAt || c.createdAt || 0;
    if (t >= startOfDay) groups.Today.push(c);
    else if (t >= startOfYesterday) groups.Yesterday.push(c);
    else if (t >= startOfWeek) groups["Previous 7 days"].push(c);
    else if (t >= startOfMonth) groups["Previous 30 days"].push(c);
    else groups.Older.push(c);
  }
  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

export function Sidebar({
  open,
  onClose,
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onClearAll,
  theme,
  onToggleTheme,
}) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages?.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [chats, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const startEdit = (chat) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };
  const commitEdit = () => {
    if (editingId) onRenameChat(editingId, editingTitle);
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      />

      <aside
        className={`fixed md:relative top-0 left-0 z-40 h-full w-[86%] max-w-[320px] md:w-[280px] md:max-w-none
          flex flex-col bg-surface-raised border-r border-border
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label="Chat history"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Wordmark />
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-sunken transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3">
          <button
            onClick={onNewChat}
            className="group w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
              bg-ink text-surface font-medium text-sm
              hover:opacity-90 active:scale-[0.98] transition-all duration-200
              shadow-sm"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-sunken border border-border focus-within:border-border-strong transition-colors">
            <Search className="w-3.5 h-3.5 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="flex-1 text-sm placeholder:text-ink-faint"
              aria-label="Search chats"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-ink-faint hover:text-ink transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-3">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 text-ink-faint">
              <Sparkles className="w-7 h-7 mb-3 opacity-60" />
              <p className="text-sm">No chats yet.</p>
              <p className="text-xs mt-1">Start a conversation to see it here.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-ink-faint">
              No matches for “{query}”.
            </div>
          ) : (
            <div className="stagger">
              {groups.map(([label, list]) => (
                <div key={label} className="mb-4">
                  <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    {label}
                  </div>
                  <ul className="space-y-0.5">
                    {list.map((chat) => {
                      const isActive = chat.id === currentChatId;
                      const isEditing = editingId === chat.id;
                      return (
                        <li key={chat.id}>
                          <div
                            className={`group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer
                              transition-colors duration-150
                              ${
                                isActive
                                  ? "bg-surface-sunken text-ink"
                                  : "hover:bg-surface-sunken text-ink-soft"
                              }`}
                            onClick={() => !isEditing && onSelectChat(chat.id)}
                          >
                            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-ink-muted" />
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitEdit();
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="flex-1 text-sm bg-transparent border-b border-border-strong"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="flex-1 truncate">{chat.title}</span>
                            )}

                            {!isEditing && (
                              <div
                                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => startEdit(chat)}
                                  className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                                  aria-label="Rename chat"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteChat(chat.id)}
                                  className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                                  aria-label="Delete chat"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            {isEditing && (
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={commitEdit}
                                className="p-1 rounded hover:bg-surface text-ink-muted hover:text-ink"
                                aria-label="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg
              bg-surface-sunken hover:bg-surface text-sm transition-colors border border-border"
            aria-label="Toggle theme"
          >
            <span className="flex items-center gap-2 text-ink-soft">
              {theme === "dark" ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
              <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
            </span>
            <span
              className={`relative inline-flex h-4 w-7 rounded-full transition-colors ${
                theme === "dark" ? "bg-ink" : "bg-border-strong"
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-surface transition-transform ${
                  theme === "dark" ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          {chats.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Delete all chats? This cannot be undone.")) onClearAll();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                text-xs text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all conversations
            </button>
          )}

          <div className="px-2 pt-1 text-[10px] text-ink-faint text-center">
            Powered by Deepanshi
          </div>
        </div>
      </aside>
    </>
  );
}
