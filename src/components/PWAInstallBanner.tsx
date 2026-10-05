import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed this session, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Install Apex Goal App</div>
            <div className="text-[11px] text-zinc-400">Add to home screen for full offline goal tracking</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={install}
            className="min-h-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-sm"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-300"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Install on iPhone</div>
              <div className="text-[11px] text-zinc-400">Run as standalone app with instant access</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="min-h-[44px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700"
            >
              How to Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-300"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS Safari Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Install on iOS Safari</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div className="leading-relaxed">
                    Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div className="leading-relaxed">
                    Scroll down and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
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
};
