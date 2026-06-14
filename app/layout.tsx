import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Wuwa Archive',
  description: 'Local-First Pull Tracker & Analytics for Wuthering Waves',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-basis text-foreground">
        {children}
      </body>
    </html>
  );
}
