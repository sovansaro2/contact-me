import { ReactNode, useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Share, Eye, HousePlus, Check, MoreVertical, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Platform = 'ios' | 'android' | 'desktop';

const GATE_OFF_KEY = 'install-gate-off';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  ) {
    return true;
  }
  // iOS Safari reports standalone via navigator.standalone
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /fbav|fban|line|instagram|twitter|snapchat|micromessenger|telegram/.test(ua);
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /safari/.test(ua) && !/crios|fxios|edg|opt|duckduckgo|mercury|firefox/.test(ua);
}

/** One numbered timeline step: circle icon + connector line + text */
function TimelineStep({
  step,
  icon,
  last,
  children,
}: {
  step: string;
  icon: ReactNode;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex w-9 shrink-0 flex-col items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-900 text-indigo-200">
          {icon}
        </span>
        {!last && <span className="min-h-4 w-0.5 flex-1 bg-slate-700" />}
      </div>
      <div className={last ? 'py-2 text-sm leading-relaxed text-slate-200' : 'py-2 pb-5 text-sm leading-relaxed text-slate-200'}>
        <strong className="text-white">{step}.</strong> {children}
      </div>
    </div>
  );
}

/**
 * Install gate: forces PWA installation on mobile devices before the app renders.
 * Desktop browsers, standalone (already installed) sessions, and the ?gate=off
 * test bypass render children directly. There is no skip button.
 */
export default function InstallGate({ children }: { children: ReactNode }) {
  if (Capacitor.isNativePlatform()) {
    return <>{children}</>;
  }

  const [platform] = useState<Platform>(detectPlatform);
  const [standalone] = useState<boolean>(isStandalone);
  const [inApp] = useState<boolean>(isInAppBrowser);
  const [iosSafari] = useState<boolean>(isIosSafari);
  const [gateOff, setGateOff] = useState<boolean>(() => sessionStorage.getItem(GATE_OFF_KEY) === '1');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [redirectFailed, setRedirectFailed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptOpen, setPromptOpen] = useState<boolean>(platform !== 'desktop' && !standalone && !gateOff);
  const redirectAttempted = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Only auto-close if it was shown automatically on mobile
    if (platform !== 'desktop' && !standalone && !gateOff) {
      timer = setTimeout(() => setPromptOpen(false), 10000);
    }

    const handleShowPrompt = () => setPromptOpen(true);
    window.addEventListener('show-install-prompt', handleShowPrompt);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('show-install-prompt', handleShowPrompt);
    };
  }, [platform, standalone, gateOff]);

  // Test bypass: ?gate=off stores a per-session flag so the gate stays off while testing
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('gate') === 'off') {
      sessionStorage.setItem(GATE_OFF_KEY, '1');
      setGateOff(true);
      setPromptOpen(false);
    }
  }, []);

  // Android: capture the native install prompt so we can trigger it ourselves
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === 'accepted') {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // ANDROID in-app browser: attempt a one-time automatic redirect to Chrome;
  // if still on the page after 2.5s (redirect failed), fall back to manual copy/open instructions.
  useEffect(() => {
    if (!inApp || platform !== 'android' || redirectAttempted.current) return;
    redirectAttempted.current = true;
    window.location.href =
      'intent://' + window.location.host + window.location.pathname + '#Intent;scheme=https;package=com.android.chrome;end';
    const timer = setTimeout(() => setRedirectFailed(true), 2500);
    return () => clearTimeout(timer);
  }, [inApp, platform]);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback: execCommand textarea trick (clipboard API may be blocked in in-app browsers)
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Desktop, already installed (standalone), or test bypass → render children directly
  const shouldShowPrompt = promptOpen;

  return (
    <>
      {children}
      {shouldShowPrompt && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/95 backdrop-blur-sm">
          <div className="relative mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[env(safe-area-inset-top)]">
            <h1 className="text-center text-xl font-bold text-white">ដំឡើង App មុនសិន</h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
          {inApp
            ? 'អ្នកកំពុងបើកក្នុង App ផ្សេង។ សូមធ្វើតាមជំហានខាងក្រោម៖'
            : 'App នេះដំណើរការតែលើ Home Screen ប៉ុណ្ណោះ។ សូមដំឡើងវាដើម្បីបន្ត។'}
        </p>

        <div className="relative mt-6 w-full rounded-2xl border border-slate-700 bg-slate-800 p-5 pt-12">
          <button
            onClick={() => setPromptOpen(false)}
            className="absolute right-3 top-3 rounded-full bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          {inApp && platform === 'android' ? (
            !redirectFailed ? (
              <div className="flex flex-col items-center py-4">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-400" />
                <p className="text-sm font-medium text-slate-300">កំពុងបើកក្នុង Chrome...</p>
              </div>
            ) : (
              <>
                <h2 className="mb-2 text-base font-bold text-white">សូមបើកក្នុង Chrome ដោយដៃ</h2>
                <p className="mb-4 text-sm leading-relaxed text-slate-400">
                  ការបើកស្វ័យប្រវត្តិមិនបានដំណើរការទេ។ សូមចម្លង Link រួចបើកក្នុង Chrome។
                </p>
                <button
                  onClick={copyLink}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                  type="button"
                >
                  {copied ? 'ចម្លងរួចរាល់' : 'ចម្លង Link'}
                </button>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  បើកកម្មវិធី <strong className="text-slate-300">Chrome</strong> → ចុច address bar យូរៗ → Paste → បើក។
                </p>
              </>
            )
          ) : inApp ? (
            <>
              <TimelineStep step="១" icon={<MoreHorizontal size={16} />}>
                ចុចលើសញ្ញាចុច ៣ <strong className="text-white">···</strong> (មុំខាងលើ)
              </TimelineStep>
              <TimelineStep step="២" icon={<Share size={16} />}>
                ចុចលើ <strong className="text-white">Share</strong>
              </TimelineStep>
              <TimelineStep step="៣" icon={<Eye size={16} />}>
                ចុចលើ <strong className="text-white">View More</strong>
              </TimelineStep>
              <TimelineStep step="៤" icon={<HousePlus size={16} />}>
                ចុចលើ <strong className="text-white">Add to Home Screen</strong>
              </TimelineStep>
              <TimelineStep step="៥" icon={<Check size={16} />} last>
                ចុច <strong className="text-white">Add</strong> ដើម្បីបញ្ជាក់
              </TimelineStep>

              <div className="mt-5 border-t border-slate-700 pt-4">
                <p className="mb-3 text-xs leading-relaxed text-slate-400">
                  បើរកមិនឃើញម៉ឺនុយទាំងនោះ សូមចម្លង Link រួចបើកក្នុង Safari ជំនួស៖
                </p>
                <button
                  onClick={copyLink}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                  type="button"
                >
                  {copied ? 'ចម្លងរួចរាល់' : 'ចម្លង Link'}
                </button>
              </div>
            </>
          ) : platform === 'android' ? (
            installPrompt ? (
              <>
                <p className="mb-4 text-center text-sm text-slate-400">
                  ចុចប៊ូតុងខាងក្រោមដើម្បីដំឡើងចូល Home Screen។
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                  type="button"
                >
                  ដំឡើងឥឡូវនេះ
                </button>
              </>
            ) : (
              <>
                <TimelineStep step="១" icon={<MoreVertical size={16} />}>
                  ចុចម៉ឺនុយ <strong className="text-white">⋮</strong> នៅជ្រុងខាងលើ
                </TimelineStep>
                <TimelineStep step="២" icon={<HousePlus size={16} />}>
                  ជ្រើសរើស <strong className="text-white">Add to Home screen</strong>
                </TimelineStep>
                <TimelineStep step="៣" icon={<Check size={16} />} last>
                  បញ្ជាក់ដោយចុច <strong className="text-white">Install</strong>
                </TimelineStep>
              </>
            )
          ) : (
            <>
              {!iosSafari && (
                <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200 ring-1 ring-amber-400/20">
                  ការដំឡើងដំណើរការតែលើ <strong>Safari</strong> ប៉ុណ្ណោះ។ សូមចម្លង Link នេះ រួចបើកក្នុង Safari ជាមុនសិន។
                </div>
              )}
              <TimelineStep step="១" icon={<Share size={16} />}>
                ចុចប៊ូតុង <strong className="text-white">Share</strong> នៅខាងក្រោម browser
              </TimelineStep>
              <TimelineStep step="២" icon={<HousePlus size={16} />}>
                ជ្រើសរើស <strong className="text-white">Add to Home Screen</strong>
              </TimelineStep>
              <TimelineStep step="៣" icon={<Check size={16} />} last>
                ចុច <strong className="text-white">Add</strong> ដើម្បីបញ្ជាក់
              </TimelineStep>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">បន្ទាប់ពីដំឡើងរួច សូមបើក App ពី Home Screen</p>
        <p className="mt-2 text-xs font-medium text-slate-600">វត្តវារីបាការាម</p>
      </div>
    </div>
    )}
    </>
  );
}
