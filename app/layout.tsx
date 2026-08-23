import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Firestorm — Identity & Authentication Portal',
  description: 'Secure user identity portal with automated email verification, 12-digit alphanumeric ID generation, password reset, and optional multi-factor authentication.',
  openGraph: {
    title: 'Firestorm — Identity & Authentication Portal',
    description: 'Secure user identity portal with automated email verification, 12-digit alphanumeric ID generation, password reset, and optional multi-factor authentication.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Firestorm — Identity & Authentication Portal',
    description: 'Secure user identity portal with automated email verification, 12-digit alphanumeric ID generation, password reset, and optional multi-factor authentication.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
