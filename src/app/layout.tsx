import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ResourceProvider } from '@/context/ResourceContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ToastContainer';
import { PwaManager } from '@/components/pwa/PwaManager';
import React, { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

export const viewport: Viewport = {
  themeColor: '#1d3b64',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'GitNote — Academic Courseware & Exam Archive',
  description:
    'GitNote is a peer-curated academic resource-sharing repository for college students. Access previous year question papers (PYQs), lecture notes, assignments, and lab manuals in one organized digital library.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GitNote',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-full flex flex-col bg-[#fbfaf8] text-[#18181b] font-sans antialiased selection:bg-[#1d3b64]/10 selection:text-[#1d3b64]">
        <AuthProvider>
          <ResourceProvider>
            <Suspense fallback={<div className="h-15 bg-white border-b border-[#e5e2db]" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastContainer />
            <PwaManager />
          </ResourceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
