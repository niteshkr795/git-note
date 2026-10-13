import type { Metadata } from 'next';
import './globals.css';
import { ResourceProvider } from '@/context/ResourceContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'GitNote — Learn. Share. Discover. | Academic Resource Platform',
  description: 'GitNote is a modern academic resource-sharing platform for college students. Access previous year question papers (PYQs), lecture notes, assignments, and lab manuals in one organized place.',
};

import React, { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ResourceProvider>
          <Suspense fallback={<div className="h-16 bg-[#0a1128]" />}>
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
