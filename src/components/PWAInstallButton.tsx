import { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:bg-slate-900 dark:text-white whitespace-nowrap"
        >
          <Smartphone className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/75 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Install DeKUT Past Papers Library on iPhone or iPad"
          >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#162033]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/dekut-crest.png"
                    alt="Dedan Kimathi University of Technology Crest"
                    className="h-8 w-auto rounded bg-white p-0.5 object-contain"
                  />
                  <h3 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                    Install on iPhone / iPad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation instructions"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ol className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#2563EB]">1.</span>
                  <span>
                    Open this page in <strong>Safari</strong> and tap the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-[#14213D] dark:text-white">
                      <Share className="inline h-3.5 w-3.5 text-[#2563EB]" /> Share
                    </span>{' '}
                    button in your browser toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#2563EB]">2.</span>
                  <span>
                    Scroll down the menu and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#2563EB]">3.</span>
                  <span>
                    Tap <strong>Add</strong> to save <strong>DeKUT Papers</strong> as an app icon on your Home Screen.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#2563EB] py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Offline Mode — Showing cached library interface.</span>
    </div>
  );
}
