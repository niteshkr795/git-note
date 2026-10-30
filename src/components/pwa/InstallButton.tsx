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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#f4f2ee] text-[#18181b] hover:bg-[#eae7e0] border border-[#e5e2db] transition-colors cursor-pointer ${className}`}
          title="Install GitNote App"
        >
          <Download className="w-3 h-3 text-[#1d3b64]" />
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
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors cursor-pointer ${className}`}
        title="Install GitNote to Home Screen"
      >
        <Download className="w-3.5 h-3.5 text-[#1d3b64]" />
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Install GitNote App">
      <div className="space-y-3.5 text-xs text-[#52525b]">
        <p className="leading-relaxed">
          GitNote is an installable Progressive Web App (PWA). You can install it directly from your browser for offline cached reading and quick launch.
        </p>

        {isIos ? (
          <div className="space-y-1.5 bg-[#fbfaf8] p-3 rounded-md border border-[#e5e2db]">
            <p className="font-semibold text-[#18181b]">On Safari (iOS):</p>
            <ol className="list-decimal pl-4 space-y-1 text-[#52525b]">
              <li>Tap the <strong>Share</strong> icon in Safari.</li>
              <li>Select <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-1.5 bg-[#fbfaf8] p-3 rounded-md border border-[#e5e2db]">
            <p className="font-semibold text-[#18181b]">On Chrome / Edge / Desktop:</p>
            <ol className="list-decimal pl-4 space-y-1 text-[#52525b]">
              <li>Click the <strong>Install</strong> icon in the address bar.</li>
              <li>Or open the browser menu (⋮) and choose <strong>&quot;Install GitNote...&quot;</strong>.</li>
            </ol>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#1d3b64] text-white text-xs font-medium hover:bg-[#152b49] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
