import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'n8n Operations Dashboard',
  description: 'Monitoring de ejecuciones y costos de OpenAI en n8n',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
