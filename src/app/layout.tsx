import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FacturePro - Gestion de factures',
  description: 'Application de gestion de factures pour micro-entrepreneurs en France',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
