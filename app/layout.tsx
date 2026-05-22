import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CITS CRM — Qatar Outreach',
  description: 'Cold call CRM for CITS Qatar sales team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#ECEEE8] text-[#121721] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E2E4DE',
              color: '#121721',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
