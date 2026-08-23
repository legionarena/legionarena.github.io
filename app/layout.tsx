import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Standalone Web Apps Hub',
  description: 'Clean suite of standalone HTML applications: Music Search, Cold Pressed Game, and 7x7 Slots.',
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
