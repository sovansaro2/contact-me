import { ReactNode, useEffect, useRef, useState } from 'react';

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
  return /fbav|fban|line|instagram|twitter|snapchat|micromessenger/.test(ua);
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /safari/.test(ua) && !/crios|fxios|edg|opt|duckduckgo|mercury|firefox/.test(ua);
}

/**
 * Install gate: forces PWA installation on mobile devices before the app renders.
 * Desktop browsers, standalone (already installed) sessions, and the ?gate=off
 * test bypass render children directly. There is no skip button.
 */
export default function InstallGate({ children }: { children: ReactNode }) {
  const [platform] = useState<Platform>(detectPlatform);
  const [standalone] = useState<boolean>(isStandalone);
  const [inApp] = useState<boolean>(isInAppBrowser);
  const [iosSafari] = useState<boolean>(isIosSafari);
  const [gateOff, setGateOff] = useState<boolean>(() => sessionStorage.getItem(GATE_OFF_KEY) === '1');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [redirectFailed, setRedirectFailed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegram] = useState<boolean>(() => /telegram/i.test(navigator.userAgent));
  const redirectAttempted = useRef(false);

  // Test bypass: ?gate=off stores a per-session flag so the gate stays off while testing
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('gate') === 'off') {
      sessionStorage.setItem(GATE_OFF_KEY, '1');
      setGateOff(true);
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
  if (platform === 'desktop' || standalone || gateOff) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[env(safe-area-inset-top)]">
        <div className="relative">
          <img src="/pwa-192x192.png" alt="App icon" className="h-24 w-24 rounded-[1.4rem] shadow-2xl ring-1 ring-white/10" />
          <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 shadow-lg ring-2 ring-slate-950">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5 text-white" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold leading-tight text-white">ដំឡើង App មុនសិន</h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-slate-400">
          App នេះដំណើរការតែលើ Home Screen ប៉ុណ្ណោះ។ សូមដំឡើងវាដើម្បីបន្ត។
        </p>

        <div className="mt-8 w-full rounded-2xl bg-white/5 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.55)] ring-1 ring-white/10 backdrop-blur-sm">
          {inApp && platform === 'android' ? (
            <>
              {!redirectFailed ? (
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
                    className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:bg-slate-100 active:scale-[0.98]"
                    type="button"
                  >
                    {copied ? 'ចម្លងរួចរាល់' : 'ចម្លង Link'}
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    បើកកម្មវិធី <strong>Chrome</strong> → ចុច address bar យូរៗ → <strong>Paste</strong> → បើក។
                    បន្ទាប់មកអ្នកនឹងឃើញការណែនាំដំឡើង។
                  </p>
                </>
              )}
            </>
          ) : inApp ? (
            <>
              <h2 className="mb-4 text-base font-bold text-white">សូមបើកក្នុង Safari ជាមុនសិន</h2>
              <button
                onClick={copyLink}
                className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:bg-slate-100 active:scale-[0.98]"
                type="button"
              >
                {copied ? 'ចម្លងរួចរាល់' : 'ចម្លង Link'}
              </button>
              <ol className="mt-5 space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">1</span>
                  <span>ចុច <strong>"ចម្លង Link"</strong> ខាងលើ។</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">2</span>
                  <span>បើកកម្មវិធី <strong>Safari</strong> → ចុច address bar → paste → បើក។</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">3</span>
                  <span>បន្ទាប់មកអ្នកនឹងឃើញការណែនាំដំឡើង។</span>
                </li>
              </ol>
              {telegram && (
                <div className="mt-4 rounded-xl bg-indigo-500/10 p-3 text-xs leading-relaxed text-indigo-200 ring-1 ring-indigo-400/20">
                  ក្នុង Telegram៖ ចុច ⋯ មុំខាងស្តាំលើ → Open in Safari
                </div>
              )}
            </>
          ) : platform === 'android' ? (
            <>
              {installPrompt ? (
                <>
                  <p className="mb-4 text-center text-sm text-slate-400">
                    ចុចប៊ូតុងខាងក្រោមដើម្បីដំឡើងចូល Home Screen។
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:bg-slate-100 active:scale-[0.98]"
                    type="button"
                  >
                    ដំឡើងឥឡូវនេះ
                  </button>
                </>
              ) : (
                <>
                  <h2 className="mb-4 text-base font-bold text-white">សូមដំឡើងដោយដៃ</h2>
                  <ol className="space-y-3 text-sm text-slate-200">
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">1</span>
                      <span>ចុចម៉ឺនុយ <strong>⋮</strong> នៅជ្រុងខាងលើ</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">2</span>
                      <span>ជ្រើសរើស <strong>"Add to Home screen"</strong> ឬ <strong>"Install app"</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">3</span>
                      <span>បញ្ជាក់ដោយចុច <strong>"Install"</strong></span>
                    </li>
                  </ol>
                </>
              )}
            </>
          ) : (
            <>
              {!iosSafari && (
                <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200 ring-1 ring-amber-400/20">
                  ការដំឡើងដំណើរការតែលើ <strong>Safari</strong> ប៉ុណ្ណោះ។ សូមចម្លង Link នេះ រួចបើកក្នុង Safari ជាមុនសិន។
                </div>
              )}
              <h2 className="mb-4 text-base font-bold text-white">វិធីដំឡើង</h2>
              <ol className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">1</span>
                  <span>
                    ចុចប៊ូតុង <strong>Share</strong>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-1 inline-block h-4 w-4 align-[-3px] text-indigo-300"
                      aria-hidden
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    នៅខាងក្រោម browser
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">2</span>
                  <span>រកមើល រួចជ្រើសរើស <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">3</span>
                  <span>ចុច <strong>"Add"</strong> ដើម្បីបញ្ជាក់</span>
                </li>
              </ol>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">បន្ទាប់ពីដំឡើងរួច សូមបើក App ពី Home Screen</p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <img src="/pwa-192x192.png" alt="" className="h-4 w-4 rounded-[0.3rem]" />
          <span className="text-xs font-medium text-slate-600">វត្តវារីបាការាម</span>
        </div>
      </div>
    </div>
  );
}

