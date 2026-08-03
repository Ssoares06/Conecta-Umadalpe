import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Conecta UMADALPE',
  description: 'Acolhimento e união. Jovens com propósito. Permanecer conectado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${poppins.variable} font-body mosaic-texture min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
