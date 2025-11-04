import React, { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "./components/sidebar"; // Ensure this is defined elsewhere
import { generateMsg } from "./generateMsg";
import { Menu } from "lucide-react"; // Add this for the hamburger menu
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function ChatGPTClone() {
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const buttomref = useRef();

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    buttomref.current.scrollIntoView();
  }, [chatHistory]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    const selectedChat = chatHistory.find((chat) => chat.id === id);
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev); // Toggle the sidebar open/close
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent submitting empty messages

    if (!currentChatId) {
      const newChatId = Date.now().toString(); // Create a new chat ID
      setCurrentChatId(newChatId);
      setChatHistory((prev) => [
        ...prev,
        { id: newChatId, title: input || "New Chat", messages: [] },
      ]);
    }

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    setIsTyping(true);

    try {
      const result = await generateMsg({ messages: input });

      const fullText = result.candidates[0].content.parts[0].text;
      let currentText = "";

      const aiResponse = { role: "ai", content: "" };
      setMessages((prev) => [...prev, aiResponse]);

      let i = 0;
      const interval = setInterval(() => {
        currentText += fullText[i];
        i++;

        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, content: currentText } : msg
          )
        );

        if (i >= fullText.length) {
          clearInterval(interval);

          // Save final message in chatHistory
          setChatHistory((prev) =>
            prev.map((chat) => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    newMessage,
                    { role: "ai", content: fullText },
                  ],
                };
              }
              return chat;
            })
          );
        }
      }, 30); // typing speed (ms per character)
    } catch (error) {
      console.error("Error generating message:", error);
    } finally {
      setIsTyping(false);
    }

    setInput("");
  };

  return (
    <div className="flex h-screen w-screen relative">
      {/* Sidebar toggle button (Hamburger menu) */}
      <div className="absolute top-4 z-30">
        <button onClick={toggleSidebar} className="text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div
        className={`flex w-64 ${
          isOpen ? "md:block hidden" : "md:hidden block"
        } absolute md:relative transition-all duration-300`}
      >
        <ChatSidebar
          onNewChat={handleNewChat}
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          isOpen={isOpen}
        />
      </div>

      <div className="flex-1 flex flex-col py-4 px-8 w-full">
        <div className="flex-1 flex flex-col">
          <div>
            <div className="text-2xl font-bold mb-4 md:mt-1 md:ml-14 ml-8 -mt-2 relative w-52 h-20">
              <img src="logo.png" alt="logo" className=" h-60 absolute -bottom-20 " />
              {/* ChatBOT */}
              </div>
          </div>

          {/* Chat container with scrollable history */}
          <div className="flex w-full md:w-[65%] mx-auto h-[70vh] mb-4 relative">
            <div className="h-full w-full overflow-y-auto hide-scrollbar">
              {messages.length === 0 && !input.trim() ? (
                <div className="absolute text-gray-2  text-4xl top-1/2 left-1/2 transform -translate-x-1/2 -md:translate-x-3/2 -translate-y-1/2 opacity-30 -z-10">
                  How can I help you?
                </div>
              ) : (
                messages.map((m, index) => (
                  <div
                    key={index}
                    className={`mb-4 w-full ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        m.role === "user"
                          ? "bg-color text-white"
                          : "bg-black text-white opacity-70"
                      }`}
                    >
                      <Markdown remarkPlugins={[rehypeHighlight]}>
                        {m.content}
                      </Markdown>
                    </span>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="text-left">
                  <span className="inline-block p-2 rounded-lg bg-black text-white opacity-70">
                    AI is typing...
                  </span>
                </div>
              )}
              <div ref={buttomref}></div>
            </div>
          </div>

          <div>
            <form
              onSubmit={onSubmit}
              className="flex space-x-2 w-[80%] mx-auto"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-grow p-2 border rounded"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                <i className="fa-solid fa-square-arrow-up-right"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
