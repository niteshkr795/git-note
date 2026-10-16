'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  X,
  Share,
  PlusSquare,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/Modal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaManager: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isInstalledSuccessfully, setIsInstalledSuccessfully] = useState<boolean>(false);

  // 1. Register Service Worker on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[GitNote PWA] Service worker registered, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[GitNote PWA] Service worker registration error:', err);
          });
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  // 2. Detect Standalone / iOS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const isStandaloneMode =
        standaloneQuery.matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();
    standaloneQuery.addEventListener('change', checkStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    return () => {
      standaloneQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  // 3. Listen for browser beforeinstallprompt (Android Chrome, Edge, Desktop Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user previously dismissed in this session
      const dismissed = sessionStorage.getItem('gitnote_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also listen if installed via browser UI
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsInstalledSuccessfully(true);
      setTimeout(() => setIsInstalledSuccessfully(false), 5000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 4. Trigger Install flow
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowBanner(false);
          setIsInstalledSuccessfully(true);
        }
      } catch (err) {
        console.warn('[GitNote PWA] Install prompt error:', err);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // General instructions modal for browsers where prompt isn't supported directly
      setShowIosGuide(true);
    }
  }, [deferredPrompt, isIos]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('gitnote_pwa_dismissed', 'true');
  };

  // If already running inside installed standalone app, render nothing
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Success Toast when App Installed */}
      {isInstalledSuccessfully && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">GitNote Installed!</p>
              <p className="text-slate-400 text-[11px]">
                Launch it directly from your device home screen or app drawer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Install App Banner */}
      {showBanner && !isStandalone && (
        <aside
          aria-label="PWA Install banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-[0_20px_35px_-10px_rgba(15,23,42,0.5)] border border-slate-700/80 flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-inner overflow-hidden border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/icon-192x192.png"
                alt="GitNote"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight">Install GitNote</h4>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  Fast & Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Install to your home screen for quick, fullscreen access to semester notes.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInstallClick}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs py-1.5 px-3 rounded-xl shadow-xs"
                >
                  Install App
                </Button>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Manual Installation Guide Modal (For iOS Safari or Desktop without Native Prompt) */}
      <Modal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        maxWidth="md"
        title="How to Install GitNote"
      >
        <div className="space-y-5 text-slate-700">
          <div className="flex items-center gap-3 bg-[#faf8ff] p-3.5 rounded-2xl border border-indigo-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0f172a]">Native Mobile App Experience</h4>
              <p className="text-[11px] text-slate-500">
                Installs directly on your device with no app store download required.
              </p>
            </div>
          </div>

          {isIos ? (
            /* iOS Safari Step-by-Step */
            <div className="space-y-3.5 text-xs">
              <p className="font-semibold text-slate-900 text-xs">
                Follow these 3 quick steps in Apple Safari:
              </p>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 text-indigo-600" />
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Located in the toolbar at the bottom of your screen in Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    Select <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 text-indigo-600" />
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Scroll down through the share options menu to find this action.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    Tap <strong>Add</strong> in the top-right corner
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    GitNote will now appear as an app icon directly on your home screen.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Chrome / Edge / Desktop Browser Step-by-Step */
            <div className="space-y-3.5 text-xs">
              <p className="font-semibold text-slate-900 text-xs">
                To install through your browser:
              </p>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    Check the browser URL address bar
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Click the <strong>Install icon</strong> (computer monitor with download arrow) on the right side of the URL bar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    Or open the browser menu (⋮ / ⋯)
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Select <strong>&quot;Install GitNote&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowIosGuide(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
