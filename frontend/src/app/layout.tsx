import type { Metadata } from "next";
import { JetBrains_Mono } from 'next/font/google';
import GlobalNavbar from "@/components/GlobalNavbar";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Medico Valley - Web Portal",
  description: "Medico Valley application dashboard and client portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
