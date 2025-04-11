import Linkify from 'linkify-react';

const ChatMessage = ({ text, from }) => {
  const isUser = from === 'user';

  // Función para abrir PDF en pestaña nueva usando Blob
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

  // Configuración de linkify
  const linkOptions = {
    format: (value, type) => {
      if (type === 'url') {
        if (value.endsWith('.pdf')) return 'Ver documento PDF';
        return 'Abrir enlace';
      }
      return value;
    },
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
          className="inline-flex items-center gap-1 text-[#0080ff] hover:underline break-all"
          target={isPdf ? undefined : '_blank'}
          rel={isPdf ? undefined : 'noopener noreferrer'}
        >
          {content}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
          </svg>
        </a>
      );
    },
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start items-end gap-2'}`}>
      {!isUser && (
        <div className="w-[30px] h-[30px] flex-shrink-0">
          <img
            src="/assets/chatbot/bot-avatar.svg"
            alt="Bot Avatar"
            className="w-full h-full"
          />
        </div>
      )}

      <div
        className={`px-4 py-3 rounded-xl max-w-[80%] text-sm ${
          isUser ? 'bg-[#0080ff] text-white rounded-br-none' : 'bg-[#f0f4f8] text-gray-800 rounded-bl-none'
        } whitespace-pre-wrap break-words overflow-hidden`}
      >
        {isUser ? text : <Linkify options={linkOptions}>{text}</Linkify>}
      </div>
    </div>
  );
};

export default ChatMessage;
