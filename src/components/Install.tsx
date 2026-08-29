import { ReactNode, useEffect, useState } from 'react';

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

        {/* In-app browsers: cannot install — open in a real browser first */}
        {inApp ? (
          <div className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold mb-2">បើកក្នុង Browser ពិតជាមុនសិន</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              អ្នកកំពុងបើកតាម App ផ្សេង (Facebook, Instagram, Line, ...) ដែលមិនអាចដំឡើងបានទេ។
              សូមចុចម៉ឺនុយ <strong>⋮</strong> ឬ <strong>…</strong> នៅខាងលើ រួចជ្រើសរើស
              <strong> "Open in browser"</strong> ដើម្បីបើកក្នុង Chrome ឬ Safari ជាមុនសិន។
            </p>
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

