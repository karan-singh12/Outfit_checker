import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Threadflank — Try anything. Wear everything.",
  description: "Build your digital twin, fill your virtual wardrobe, and AI try-on any outfit from any store before you buy it.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              var saved = localStorage.getItem('theme');
              var pref = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
              var theme = saved || pref || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
          })();
        `}} />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
