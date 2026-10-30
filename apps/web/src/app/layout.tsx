import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Browser Automation Agent',
  description: 'Automate browser workflows using natural-language instructions and Groq AI inference.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="max-w-4xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}

