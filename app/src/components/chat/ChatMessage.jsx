import { useState, useEffect } from 'react';
import Linkify from 'linkify-react';
import { ThumbsUp, ThumbsDown, User, Sparkles, X, FileText, ExternalLink } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

const ChatMessage = ({ text, from, userQuery, initial }) => {
  const isUser = from === 'user';
  const [feedback, setFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get user avatar from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const avatarImage = localStorage.getItem('avatarImage');
      setUserAvatar(avatarImage);
    }
  }, []);

  const handleOpenPdf = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Error al abrir PDF:', err);
      alert('No se pudo abrir el documento.');
    }
  };

  const linkOptions = {
    format: (value, type) => (type === 'url' && value.endsWith('.pdf') ? 'Ver documento PDF' : 'Abrir enlace'),
    render: ({ attributes, content }) => {
      const url = attributes.href;
      const isPdf = url.endsWith('.pdf');

      const handleClick = (e) => {
        if (isPdf) {
          e.preventDefault();
          handleOpenPdf(url);
        }
      };

      return (
        <a
          {...attributes}
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
          target={isPdf ? undefined : '_blank'}
          rel={isPdf ? undefined : 'noopener noreferrer'}
        >
          {isPdf ? <FileText className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
          {content}
        </a>
      );
    },
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedReason) return;

    try {
      setSending(true);
      const res = await fetch('https://quikbot.ddnsking.com/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery,
          botResponse: text,
          reason: selectedReason,
          comment: comment || null,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar feedback');
      alert('✅ ¡Gracias por tus comentarios!');
    } catch (err) {
      console.error(err);
      alert('❌ Error al enviar feedback. Intenta de nuevo.');
    } finally {
      setShowModal(false);
      setSending(false);
      setSelectedReason('');
      setComment('');
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      {isUser ? (
        /* User Message */
        <div className="w-full flex justify-end">
          <div className="flex items-end gap-3 max-w-[85%]">
            <div 
              className="text-white rounded-2xl rounded-br-md px-4 py-3 text-sm shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {text}
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden shadow-sm border-2 border-white dark:border-gray-700">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Bot Message */
        <div className="w-full flex justify-start">
          <div className="flex items-start gap-3 max-w-[90%]">
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-[#1c1c24] border border-gray-200 dark:border-[#2C2C38] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md px-4 py-3 text-sm shadow-sm">
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                <Linkify options={linkOptions}>{text}</Linkify>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section - Only for bot messages (excluding initial) */}
      {!isUser && !initial && (
        <div className="mt-2 ml-11 flex items-center justify-between gap-4 w-full max-w-[85%]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ¿Te fue útil esta respuesta?
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setFeedback('like')}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  feedback === 'like' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-110' 
                    : 'hover:bg-gray-100 dark:hover:bg-[#2C2C38] text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400'
                }`}
                title="Útil"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setFeedback('dislike');
                  setShowModal(true);
                }}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  feedback === 'dislike' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 scale-110' 
                    : 'hover:bg-gray-100 dark:hover:bg-[#2C2C38] text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                }`}
                title="No útil"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1c1c24] border border-gray-200 dark:border-[#2C2C38] rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <ThumbsDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  ¿Qué podemos mejorar?
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tu feedback nos ayuda a mejorar Nova. Selecciona una razón:
              </p>
              
              <div className="space-y-2">
                {[
                  'No respondió a mi pregunta',
                  'La información era incorrecta',
                  'Fue confuso o poco claro',
                  'Respuesta incompleta',
                  'Otra razón'
                ].map((reason) => (
                  <button
                    key={reason}
                    className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                      selectedReason === reason
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-[#2C2C38] hover:border-gray-300 dark:hover:border-[#3C3C48] hover:bg-gray-50 dark:hover:bg-[#2C2C38] text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentario adicional (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2C2C38] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#13131a] text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe cómo podríamos mejorar esta respuesta..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2C2C38]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={sending || !selectedReason}
                className="px-4 py-2 text-sm text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {sending ? 'Enviando...' : 'Enviar feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;