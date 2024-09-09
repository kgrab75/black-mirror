import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'open-weather-icons/dist/css/open-weather-icons.css';
import 'regenerator-runtime/runtime';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Black Mirror',
  description: 'An application for a connected mirror',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
