'use client';

import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { usePathname } from 'next/navigation';

const ChatBotButton = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  // No mostrar si no hay usuario o estamos en /login
  if (pathname === '/login') return null;

  return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      aria-label="Abrir chatbot"
      onClick={() => alert('Chatbot abierto (placeholder)')}
    >
      <MessageCircle size={20} />
    </button>
  );
};

export default ChatBotButton;
