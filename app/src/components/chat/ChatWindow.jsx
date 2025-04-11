import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { X } from 'lucide-react';

const ChatWindow = ({ messages, onSendMessage, onClose, loading, isClosing }) => {
  const [input, setInput] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const messagesEndRef = useRef(null);

  // Activar animación de entrada al montar
  useEffect(() => {
    const timeout = setTimeout(() => setAnimateIn(true), 10); // delay corto para activar transición
    return () => clearTimeout(timeout);
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 max-w-full bg-white rounded-2xl shadow-lg flex flex-col z-50 border border-gray-200 max-h-[80vh]
        transition-all duration-300 ease-out transform
        ${isClosing ? 'opacity-0 translate-y-4' : animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0080ff] text-white rounded-t-2xl">
        <span className="font-semibold">Asistente Virtual</span>
        <button onClick={onClose} aria-label="Cerrar chat">
          <X size={20} />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white scrollbar-custom">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} text={msg.text} from={msg.from} />
        ))}

        {loading && (
          <div className="flex items-end gap-2 mb-4">
            <div className="w-[30px] h-[30px] flex-shrink-0">
              <img
                src="/assets/chatbot/bot-avatar.svg"
                alt="Bot Avatar"
                className="w-full h-full"
              />
            </div>

            <div className="bg-[#f0f4f8] py-[10px] px-[14px] rounded-xl flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t p-3 bg-white">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080ff]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
        />
        <button
          className="px-4 py-2 rounded-md text-sm text-white bg-[#0080ff] hover:bg-blue-600 transition"
          onClick={handleSend}
          disabled={loading}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
