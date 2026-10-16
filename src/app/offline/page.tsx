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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.07)] text-center space-y-6">
        {/* Offline Icon Illustration */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
            <WifiOff className="w-9 h-9" />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${
              isOnline ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {isOnline ? '✓' : '!'}
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Internet Connection Restored</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>No Internet Connection</span>
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            {isOnline ? 'You are back online!' : "You're Currently Offline"}
          </h1>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {isOnline
              ? 'Your device re-established an internet connection. Reload the page to access all GitNote features.'
              : 'GitNote loaded the core app shell from your device cache. Live searching, account authentication, and uploading study resources require an active internet connection.'}
          </p>
        </div>

        {/* Feature Availability Grid */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs">
          <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
            Offline Availability:
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>App shell navigation & cached pages</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Live database search (requires connection)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Sign in & document upload (requires connection)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRetry}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />}
            className="w-full shadow-sm font-semibold"
          >
            {isChecking ? 'Reconnecting...' : 'Check Connection & Retry'}
          </Button>

          <Link href="/" className="block w-full">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full text-slate-700 hover:text-slate-900"
            >
              Return to Cached Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
