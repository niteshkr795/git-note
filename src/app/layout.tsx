import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ResourceProvider } from '@/context/ResourceContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ToastContainer';
import React, { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GitNote — Academic Precision | Learn. Share. Discover.',
  description: 'GitNote is a modern academic resource-sharing platform for college students. Access previous year question papers (PYQs), lecture notes, assignments, and lab manuals in one organized place.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-[#faf8ff] text-[#0f172a] font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <ResourceProvider>
          <Suspense fallback={<div className="h-16 bg-[#0f172a]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
        </ResourceProvider>
      </body>
    </html>
  );
}
