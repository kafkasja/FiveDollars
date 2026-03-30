import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family App',
  description: 'Track family debts and credits',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
