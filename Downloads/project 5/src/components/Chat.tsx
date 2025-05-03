import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Message } from '../types';

interface ChatProps {
  messages: Message[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
  onClose,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed right-4 bottom-24 w-80 md:w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col z-20 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
        <h3 className="font-medium text-gray-800 dark:text-white">Chat</h3>
        <button 
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex flex-col ${message.isLocal ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.isLocal 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {message.isLocal ? 'You' : message.sender} • {formatTimestamp(message.timestamp)}
              </div>
              <p className="break-words">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t dark:border-gray-700">
        <div className="flex items-end">
          <textarea
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm h-10 max-h-32 transition-all"
            rows={1}
          />
          <button 
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;