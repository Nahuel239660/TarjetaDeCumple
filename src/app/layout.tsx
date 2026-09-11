import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nahuel Birthday Night",
  description: "Invitación y confirmación para el cumpleaños de Nahuel.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${bodoni.variable} ${jakarta.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
