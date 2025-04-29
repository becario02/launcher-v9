'use client';

import { useEffect, useState } from 'react';
import { getFirstNameFromCookie } from '@/utils/getFirstName';
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'next/navigation';
import ChatWindow from './ChatWindow';
import ChatBotButton from './ChatBotButton';

const ChatContainer = () => {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) setSessionId(uuidv4());
  }, [sessionId]);

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      const name = getFirstNameFromCookie() || '';
      const greeting = `Hola ${name} 👋, soy Nova 🌟, tu asistente virtual. Puedo ayudarte con módulos, tickets o documentos del sistema. ¿En qué te puedo asistir hoy?`;
      setMessages([{ from: 'bot', text: greeting, initial: true }]);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !sessionId) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quikbot.ddnsking.com'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFNRVJJQ0FOT1MiLCJleHAiOjE3NDY1NDE0NDV9.Z5tLS1Fof8sVwW5msYEwP6MXtGnRkJbcVXPRJ9TeMdA',
        },
        body: JSON.stringify({ message: text, session_id: sessionId, is_support: true }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { from: 'bot', text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: 'bot', text: '❌ Ocurrió un error. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render condicional en el return, no antes
  if (pathname === '/login') return null;

  return (
    <>
      {!open && <ChatBotButton onClick={handleOpen} />}
      {open && (
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          onClose={handleClose}
          loading={loading}
          isClosing={isClosing}
        />
      )}
    </>
  );
};

export default ChatContainer;
