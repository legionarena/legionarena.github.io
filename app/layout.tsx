import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Firestorm Tournaments',
  description: 'Clean, accessible gaming tournament platform created with Google Gemini AI Studio, featuring player registration, email verification, high score leaderboards, games including Block Drop Matrix (scalable 5-block pentominoes), music player, and community posts with image sharing.',
  openGraph: {
    title: 'Firestorm Tournaments',
    description: 'Clean, accessible gaming tournament platform created with Google Gemini AI Studio, featuring player registration, email verification, high score leaderboards, games including Block Drop Matrix (scalable 5-block pentominoes), music player, and community posts with image sharing.',
  }
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
