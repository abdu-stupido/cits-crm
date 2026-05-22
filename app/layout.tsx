import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CITS CRM — Qatar Outreach',
  description: 'Cold call CRM for CITS Qatar sales team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-[#0F172A] text-[#F1F5F9] antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#F1F5F9',
            },
          }}
        />
      </body>
    </html>
  );
}
