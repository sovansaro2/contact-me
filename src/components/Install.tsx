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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-4xl">
            📲
          </div>
          <h1 className="text-2xl font-bold mb-2">ដំឡើង App មុនសិន</h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            App នេះដំណើរការតែលើ Home Screen ប៉ុណ្ណោះ។ សូមដំឡើងវាដើម្បីបន្ត។
          </p>
        </div>

        {/* ANDROID in-app browser: auto-redirect to Chrome, then manual copy/open fallback */}
        {inApp && platform === 'android' ? (
          <div className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-xl">
            {!redirectFailed ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
                <p className="text-sm font-medium text-gray-700">កំពុងបើកក្នុង Chrome...</p>
              </div>
            ) : (
              <>
                <h2 className="font-bold mb-2">សូមបើកក្នុង Chrome ដោយដៃ</h2>
                <p className="text-sm text-gray-600 mb-4">ការបើកស្វ័យប្រវត្តិមិនបានដំណើរការទេ។ សូមចម្លង Link រួចបើកក្នុង Chrome។</p>
                <button
                  onClick={copyLink}
                  className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {copied ? '✅ ចម្លងរួចរាល់!' : '📋 ចម្លង Link'}
                </button>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  បើកកម្មវិធី <strong>Chrome</strong> → ចុច address bar យូរៗ → <strong>Paste</strong> → បើក។ បន្ទាប់មកអ្នកនឹងឃើញការណែនាំដំឡើង។
                </p>
              </>
            )}
          </div>
        ) : inApp ? (
          /* iOS (and other) in-app browsers: copy the link, then open in Safari */
          <div className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold mb-4">សូមបើកក្នុង Safari ជាមុនសិន</h2>
            <button
              onClick={copyLink}
              className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {copied ? '✅ ចម្លងរួចរាល់!' : '📋 ចម្លង Link'}
            </button>
            <ol className="space-y-3 text-sm text-gray-700 mt-5">
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span>ចុច <strong>"ចម្លង Link"</strong> ខាងលើ។</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span>បើកកម្មវិធី <strong>Safari</strong> → ចុចបន្ថែមលើ address bar យូរៗ → paste → បើក។</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span>បន្ទាប់មកអ្នកនឹងឃើញការណែនាំដំឡើង។</span>
              </li>
            </ol>
            {telegram && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs leading-relaxed">
                💡 ក្នុង Telegram៖ ចុច ⋯ មុំខាងស្តាំលើ → <strong>Open in Safari</strong>
              </div>
            )}
          </div>
        ) : platform === 'android' ? (

          /* ANDROID */
          <div className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-xl">
            {installPrompt ? (
              <>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  ចុចប៊ូតុងខាងក្រោមដើម្បីដំឡើងចូល Home Screen។
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  🚀 ដំឡើងឥឡូវនេះ
                </button>
              </>
            ) : (
              <>
                <h2 className="font-bold mb-4">សូមដំឡើងដោយដៃ</h2>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3 items-center">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                    <span>ចុចម៉ឺនុយ <strong>⋮</strong> នៅជ្រុងខាងលើ</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                    <span>ជ្រើសរើស <strong>"Add to Home screen"</strong> ឬ <strong>"Install app"</strong></span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span>បញ្ជាក់ដោយចុច <strong>"Install"</strong></span>
                  </li>
                </ol>
              </>
            )}
          </div>
        ) : (

          /* iOS */
          <div className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-xl">
            {!iosSafari && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
                ⚠️ ការដំឡើងដំណើរការតែលើ <strong>Safari</strong> ប៉ុណ្ណោះ។ សូម copy link នេះ រួចបើកក្នុង Safari ជាមុនសិន។
              </div>
            )}
            <h2 className="font-bold mb-4">វិធីដំឡើង</h2>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span>ចុចប៊ូតុង <strong>Share ⬆️</strong> នៅខាងក្រោម browser</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span>រកមើល រួចជ្រើសរើស <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span>ចុច <strong>"Add"</strong> ដើម្បីបញ្ជាក់</span>
              </li>
            </ol>
          </div>
        )}

        <p className="text-center text-indigo-200 text-xs mt-6">
          បន្ទាប់ពីដំឡើងរួច សូមបើក App ពី Home Screen។
        </p>
      </div>
    </div>
  );
}

