'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fbfaf8]">
      <div className="max-w-md w-full bg-white rounded-md border border-[#e5e2db] p-8 sm:p-10 shadow-2xs text-center space-y-5">
        {/* Offline Icon */}
        <div className="relative mx-auto w-14 h-14">
          <div className="w-14 h-14 rounded-md bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center text-[#991b1b]">
            <WifiOff className="w-7 h-7" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-1.5">
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connection Restored</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]">
              <span>Offline Mode</span>
            </div>
          )}

          <h1 className="font-editorial text-2xl font-semibold text-[#18181b] tracking-tight">
            {isOnline ? 'You are back online' : 'Offline Academic Mode'}
          </h1>

          <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed">
            {isOnline
              ? 'Your device re-established an internet connection. Reload the page to access live repository records.'
              : 'GitNote loaded the core library cache from your device. Live database querying and uploading require an active network connection.'}
          </p>
        </div>

        {/* Feature Availability Grid */}
        <div className="bg-[#fbfaf8] rounded-md p-3.5 border border-[#e5e2db] text-left space-y-2 text-xs">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717a] block">
            Offline Cache Status:
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#52525b]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" />
              <span>App shell and cached repository pages available</span>
            </div>
            <div className="flex items-center gap-2 text-[#71717a]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
              <span>Live database search requires connection</span>
            </div>
            <div className="flex items-center gap-2 text-[#71717a]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
              <span>Document deposits require connection</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleRetry}
            isLoading={isChecking}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" size="md" className="w-full" leftIcon={<Home className="w-3.5 h-3.5" />}>
              Return to Library Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
