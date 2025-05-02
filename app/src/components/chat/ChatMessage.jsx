import { useState } from 'react';
import Linkify from 'linkify-react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatMessage = ({ text, from, userQuery, initial }) => {
  const isUser = from === 'user';
  const [feedback, setFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

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
          className="inline-flex items-center gap-1 text-[var(--primary-color)] hover:underline break-all"
          target={isPdf ? undefined : '_blank'}
          rel={isPdf ? undefined : 'noopener noreferrer'}
        >
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
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {isUser ? (
        <div className="w-full flex justify-end">
          <div className="bg-[var(--primary-color)] text-white rounded-xl rounded-br-none px-4 py-3 text-sm max-w-[90%] whitespace-pre-wrap break-words">
            {text}
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="w-[30px] h-[30px] flex-shrink-0">
            <img src="/assets/chatbot/bot-avatar.svg" alt="Bot Avatar" className="w-full h-full" />
          </div>
          <div className="bg-[#f0f4f8] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl rounded-bl-none px-4 py-3 text-sm max-w-[100%] whitespace-pre-wrap break-words">
            <Linkify options={linkOptions}>{text}</Linkify>
          </div>
        </div>
      )}

      {!isUser && !initial && (
        <div className="pl-[40px] mt-2 flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Generada por IA. Verifica que la información sea correcta.</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFeedback('like')}
              className={`p-1 rounded-md transition ${feedback === 'like' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              title="Útil"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              onClick={() => {
                setFeedback('dislike');
                setShowModal(true);
              }}
              className={`p-1 rounded-md transition ${feedback === 'dislike' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              title="No útil"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1c1c24] rounded-xl w-full max-w-md p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">¿Qué podemos mejorar?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Selecciona una razón:</p>
            <div className="space-y-2">
              {['No respondió a mi pregunta', 'Fue confuso o poco claro', 'Otra razón'].map((reason) => (
                <button
                  key={reason}
                  className={`w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 text-left text-gray-800 dark:text-gray-200 ${selectedReason === reason ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setSelectedReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Comentario (opcional):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                rows={3}
                placeholder="Describe cómo podríamos mejorar..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={sending || !selectedReason}
                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;