'use client';

const ChatBotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 z-50 rounded-full flex items-center justify-center bg-white hover:scale-105 transition-transform"
      style={{
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25)',
      }}
      aria-label="Abrir chatbot"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-[var(--primary-color)]"
      >
        <path
          d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          d="M7.5 12h.01v.01H7.5zM12 12h.01v.01H12zM16.5 12h.01v.01h-.01z"
        />
      </svg>
    </button>
  );
};

export default ChatBotButton;
