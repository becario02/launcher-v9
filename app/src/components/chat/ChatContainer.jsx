'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './ChatWindow';
import ChatBotButton from './ChatBotButton';

const ChatContainer = () => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) setSessionId(uuidv4());
  }, []);

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ from: 'bot', text: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?' }]);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 300); // ⏱️ Tiempo de animación (matchea con Tailwind transition)
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !sessionId) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFNRVJJQ0FOT1MiLCJleHAiOjE3NDQ5OTE2MzB9._rnVk1YArqfyd96H9maJ9_XoBoA-SnEKcuztcWnxw6k',
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
