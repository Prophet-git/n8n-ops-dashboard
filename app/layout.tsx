import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Sistemas — Monitor',
  description: 'Monitor de procesos automáticos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
