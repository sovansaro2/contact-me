import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UpdateBannerProps {
  show: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  lang: 'kh' | 'en';
  isUpdating: boolean;
}

export default function UpdateBanner({
  show,
  onUpdate,
  onDismiss,
  lang,
  isUpdating
}: UpdateBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 inset-x-4 z-50 mx-auto max-w-sm"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-md backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/95 dark:text-white">
            <div className="flex items-center gap-2.5 min-w-0 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {lang === 'kh' ? 'មានព័ត៌មានវត្តថ្មី' : 'New update available'}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {lang === 'kh' ? 'សូមធ្វើបច្ចុប្បន្នភាព' : 'Tap to refresh info'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isUpdating}
                onClick={onUpdate}
                className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 active:scale-95 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{lang === 'kh' ? 'Update' : 'Update'}</span>
              </button>

              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
