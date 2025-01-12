import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MySpotify',
  description: 'Description of Spotify Project Jonkoping',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.scdn.co/spotify-player.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}