import * as React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

export function ChatSidebar({ onNewChat, chatHistory, onSelectChat, isOpen }) {
  return (
    <div className={`w-80 bg-black flex h-screen flex-col`}>
      <div className='flex justify-end space-x-2 items-center px-4 py-4 border-b-2'>
        <button onClick={onNewChat} className="">
          <Plus className="mr-2 h-4 w-4 inline-block" /> New Chat
        </button>
        <div className='space-x-4 text-xl font-thin'>
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
      </div>

      <div className='flex-1 px-4 py-8 overflow-y-auto hide-scrollbar'>
  <div className='space-y-2'>
    {chatHistory.slice().reverse().map((chat) => (
      <div key={chat.id}>
        <button onClick={() => onSelectChat(chat.id)} className='w-full flex items-center'>
          <MessageSquare className="mr-2 h-4 w-4" />
          {chat.title}
        </button>
      </div>
    ))}
  </div>
</div>

      {/* Footer with User Profile */}
      <div className='px-4 py-4 border-t-2 flex items-center'>
        <div className='flex items-center'>
        <i className="fa-regular fa-user text-lg mr-4"></i>
    
          <div className='text-white'>
            <div className='font-semibold'>tarush's profile</div>
            <div className='text-sm'>Online</div>
          </div>
        </div>
      </div>

      <div className=''>
        <hr />
      </div>
    </div>
  );
}
