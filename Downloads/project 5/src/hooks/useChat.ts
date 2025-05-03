import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';

export const useChat = (onSendMessage: (text: string) => Message) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message = onSendMessage(newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  }, [newMessage, onSendMessage]);

  const addReceivedMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, { ...message, isLocal: false }]);
  }, []);

  return {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    addReceivedMessage,
  };
};