import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "القانون التونسي - Tunisian Law AI",
  description: "مساعد قانوني ذكي للإجابة على استفساراتكم حول القانون التونسي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}