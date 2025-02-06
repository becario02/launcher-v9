import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth";
import { TabsProvider } from "@/context/tabs";
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <TabsProvider>
            {children}
          </TabsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}