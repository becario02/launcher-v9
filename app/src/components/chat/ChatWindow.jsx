import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { X, Mic } from 'lucide-react';

const ChatWindow = ({ messages, onSendMessage, onClose, loading, isClosing }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Animación de entrada
  useEffect(() => {
    const timeout = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Enviar mensaje
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Grabar por voz
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';
    setIsRecording(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interim += transcript;
        }
      }

      setInput(finalTranscriptRef.current || interim);
    };

    recognition.onerror = (e) => {
      console.error('Error de reconocimiento:', e.error);
      setIsRecording(false);
      alert('Error al capturar la voz. Intenta de nuevo.');
    };

    recognition.onend = () => {
      setIsRecording(false);
      const message = finalTranscriptRef.current.trim();
      if (message) {
        onSendMessage(message);
        setInput('');
      }
    };

    recognition.start();
  };

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 max-w-full bg-white dark:bg-[#1c1c24] rounded-2xl shadow-lg flex flex-col z-50 border border-gray-200 dark:border-gray-700 max-h-[80vh]
        transition-all duration-300 ease-out transform
        ${isClosing ? 'opacity-0 translate-y-4' : animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--primary-color)] text-white rounded-t-2xl">
        <span className="font-semibold">Asistente Virtual</span>
        <button onClick={onClose} aria-label="Cerrar chat">
          <X size={20} />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-[#1c1c24] scrollbar-custom">
        {messages.map((msg, idx) => {
          const userQuery = messages
            .slice(0, idx)
            .reverse()
            .find((m) => m.from === 'user')?.text || 'No disponible';

          return (
            <ChatMessage
              key={idx}
              text={msg.text}
              from={msg.from}
              userQuery={msg.from === 'bot' ? userQuery : undefined}
              initial={msg.initial}
            />
          );
        })}
        
        {/* Indicador de escritura */}
        {loading && (
          <div className="flex items-end gap-2 mb-4">
            <div className="w-[30px] h-[30px] flex-shrink-0">
              <img
                src="/assets/chatbot/bot-avatar.svg"
                alt="Bot Avatar"
                className="w-full h-full"
              />
            </div>

            <div className="bg-[#f0f4f8] dark:bg-gray-800 py-[10px] px-[14px] rounded-xl flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0s]" />
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input y botones */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-[#1c1c24]">
        <input
          type="text"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? 'Escuchando...' : 'Escribe tu mensaje...'}
        />

        {/* Botón de micrófono */}
        <button
          onClick={startRecording}
          title="Dictar por voz"
          className={`p-2 rounded-md transition ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          <Mic size={18} />
        </button>

        {/* Botón enviar */}
        <button
          className="px-4 py-2 rounded-md text-sm text-white bg-[var(--primary-color)] hover:opacity-90 transition"
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