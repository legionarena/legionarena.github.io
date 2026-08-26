import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIRESTORM — Tournaments',
  description: 'Fortnite and Call of Duty inspired tactical tournament arena with interactive battle stations and standalone window launch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#09090b]">
      <body className="h-full bg-[#09090b] text-zinc-100 antialiased font-sans flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
