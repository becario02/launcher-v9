import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

const ChatWindow = ({ messages, onSendMessage, onClose, loading, isClosing }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    if (input.trim() && !loading) {
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
      className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1c1c24] rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-[#2C2C38] max-h-[80vh] backdrop-blur-sm
        transition-all duration-300 ease-out transform
        ${isClosing ? 'opacity-0 translate-y-4 scale-95' : animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 rounded-t-2xl text-white relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Nova AI</h3>
            <p className="text-xs text-white/80">Asistente Virtual</p>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="relative z-10 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          aria-label="Cerrar chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#13131a] relative scrollbar-custom">
        {/* Messages */}
        <div className="p-4 space-y-4">
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
          
          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              <div className="bg-white dark:bg-[#1c1c24] border border-gray-200 dark:border-[#2C2C38] py-3 px-4 rounded-2xl rounded-tl-md shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0s]" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Nova está escribiendo...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-[#1c1c24] border-t border-gray-200 dark:border-[#2C2C38] px-4 py-4 rounded-b-2xl">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-[#2C2C38] rounded-xl px-4 py-3 pr-12 text-sm resize-none bg-gray-50 dark:bg-[#13131a] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor + '50',
                'focus': { borderColor: primaryColor }
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isRecording ? 'Escuchando...' : 'Escribe tu mensaje aquí...'}
              disabled={loading}
            />
            
            {/* Voice Button */}
            <button
              onClick={startRecording}
              disabled={loading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-lg scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C38]'
              }`}
              title="Dictar por voz"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: primaryColor }}
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* AI Disclaimer */}
        <div className="flex items-center gap-2 mt-3 px-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>Nova utiliza IA para generar respuestas. Verifica la información importante.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;