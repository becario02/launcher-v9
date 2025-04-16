import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth";
import { TabsProvider } from "@/context/tabs";
import ChatBotButton from '@/components/ChatBotButton';
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Launcher V9 | ERP ADVAN",
  description: "Launcher V9 es un sistema que permite a los clientes de ERP acceder a sus aplicaciones de forma rápida y segura.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Verificamos el tema guardado o preferencia del sistema
                  var savedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                  
                  // Solo agregamos la clase, sin modificar estilos inline
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <TabsProvider>
              {children}
            </TabsProvider>
            <ChatBotButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
