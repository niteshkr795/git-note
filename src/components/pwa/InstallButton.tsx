'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallButtonProps {
  className?: string;
  variant?: 'pill' | 'nav' | 'minimal';
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  className = '',
  variant = 'nav',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(Boolean(isStandaloneMode));

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua) && !(window as any).MSStream);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (isStandalone) {
    return null;
  }

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer ${className}`}
          title="Install GitNote App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        <InstallGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} isIos={isIos} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
        title="Install GitNote to Home Screen"
      >
        <Download className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      <InstallGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} isIos={isIos} />
    </>
  );
};

const InstallGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
}> = ({ isOpen, onClose, isIos }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Install GitNote PWA">
      <div className="space-y-4 text-xs text-slate-700">
        <p className="text-slate-600">
          GitNote is an installable Progressive Web App. You can install it directly from your
          browser to launch it in a standalone window with fast cached loading.
        </p>

        {isIos ? (
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">On iPhone / iPad (Safari):</p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>Tap the <strong>Share</strong> button at the bottom of the Safari screen.</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">On Chrome / Edge / Desktop:</p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>Click the <strong>Install GitNote</strong> icon on the right side of your address bar.</li>
              <li>Or click the 3 dots menu (⋮) in the browser and select <strong>&quot;Install GitNote...&quot;</strong>.</li>
            </ol>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
