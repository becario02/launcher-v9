'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBotButton = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hola 👋 ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null); // ← aquí el cambio


  if (pathname === '/login') return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simular tiempo de respuesta del bot
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Gracias por tu mensaje. En breve te responderé.' },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  // Scroll automático al nuevo mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <>
      {/* Botón flotante */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-[#0080ff] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Abrir chatbot"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {isChatOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-40 w-80 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="p-4 font-semibold text-gray-800 bg-[#f0f4ff] border-b border-gray-200">
              Asistente Virtual
            </div>

            {/* Chat messages */}
            <div
              ref={chatRef}
              className="flex flex-col gap-2 p-3 max-h-[24rem] overflow-y-auto text-sm bg-white transition-all duration-300"
            >
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#0080ff] text-white self-end ml-auto'
                        : 'bg-gray-200 text-gray-800 self-start mr-auto'
                    }`}
                  >
                    {msg.content}
                  </motion.div>
                ))}

                {/* Indicador de escribiendo */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'loop' }}
                    className="bg-gray-200 text-gray-500 px-3 py-2 rounded-lg text-xs self-start"
                  >
                    Escribiendo...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080ff]"
                  placeholder="Escribe tu mensaje..."
                />
                <button
                  onClick={handleSend}
                  className="bg-[#0080ff] text-white px-3 py-2 rounded-lg text-sm hover:opacity-90"
                >
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotButton;
