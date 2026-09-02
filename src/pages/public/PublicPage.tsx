import { useEffect, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '@/services/profileService';
import { ContactMethodService } from '@/services/contactMethodService';
import type { Profile, ContactMethod } from '@/types/database.types';
import { getActionUrl, openContactLink } from '@/lib/links';
import { getIconForType, getColorForType } from '@/lib/iconMapping';
import { 
  Link as LinkIcon,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/hooks/useTheme';
import GoldenParticles from '@/components/GoldenParticles';

const getMethodDescription = (type: string, value: string, lang: 'kh' | 'en') => {
  switch (type.toLowerCase()) {
    case 'telegram': 
      return value.startsWith('@') || value.startsWith('http') ? value : `@${value}`;
    case 'messenger': 
      return lang === 'kh' ? 'ផ្ញើសារមកខ្ញុំ' : 'Send me a message';
    case 'phone': 
      return value;
    case 'whatsapp': 
      return value;
    case 'email': 
      return value;
    case 'facebook': 
      return lang === 'kh' ? 'ទស្សនាទំព័រហ្វេសប៊ុក' : 'Visit Facebook page';
    case 'website': 
      try {
        const url = new URL(getActionUrl(type, value));
        return url.hostname.replace('www.', '');
      } catch {
        return value;
      }
    default: 
      return value;
  }
};

const getLocalizedLabel = (type: string, originalLabel: string, lang: 'kh' | 'en') => {
  const t = type.toLowerCase();
  
  if (lang === 'en') {
    if (originalLabel === 'ហៅទូរស័ព្ទ' || t === 'phone') return 'Phone';
    if (originalLabel === 'តេឡេក្រាម' || t === 'telegram') return 'Telegram';
    if (originalLabel === 'ហ្វេសប៊ុក' || t === 'facebook') return 'Facebook';
    if (originalLabel === 'អ៊ីមែល' || originalLabel === 'អ៉ីមែល' || t === 'email') return 'Email';
    if (originalLabel === 'គេហទំព័រ' || t === 'website') return 'Website';
  } else {
    // Return standard KH names for standard types if they were generated defaults
    if ((t === 'phone' && (originalLabel === 'Phone' || originalLabel === 'Call')) || originalLabel === 'Phone') return 'ហៅទូរស័ព្ទ';
    if (t === 'email' && originalLabel === 'Email') return 'អ៊ីមែល';
    if (t === 'website' && originalLabel === 'Website') return 'គេហទំព័រ';
  }
  
  return originalLabel;
};

export default function PublicPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'kh' | 'en'>('kh');
  const [theme, toggleTheme] = useTheme();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const p = await ProfileService.getPublicProfile(id);
      if (!p) {
        setProfile(null);
        setContactMethods([]);
        return;
      }
      
      setProfile(p);
      
      const methods = await ContactMethodService.getPublicContactMethods(p.id);
      setContactMethods(methods);
    } catch (err: any) {
      console.warn('Failed to load contact data:', err.message || err);
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-[420px] mx-auto pb-12 animate-pulse flex flex-col items-center">
          <div className="w-[120px] h-[120px] bg-gray-200 rounded-full mb-6 border-[4px] border-white shadow-sm"></div>
          <div className="w-48 h-7 bg-gray-200 rounded-md mb-3"></div>
          <div className="w-64 h-5 bg-gray-200 rounded-md mb-10"></div>
          
          <div className="w-full space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-[92px] bg-white rounded-3xl border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-red-100 flex flex-col items-center max-w-sm text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mb-5" />
          <p className="text-gray-800 text-[17px] font-medium mb-8">
            {lang === 'kh' ? 'មិនអាចផ្ទុកព័ត៌មានទំនាក់ទំនងបានទេ' : 'Cannot load contact information'}
          </p>
          <button 
            onClick={loadData}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-95"
          >
            {lang === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const displayName = lang === 'en' 
    ? (profile?.display_name_en || profile?.display_name || 'Contact Me') 
    : (profile?.display_name || 'ទំនាក់ទំនងមកខ្ញុំ');
    
  const bio = lang === 'en' 
    ? (profile?.bio_en || profile?.bio) 
    : profile?.bio;

  return (
    <div
      className={`min-h-screen relative isolate overflow-hidden bg-[#fdfcfa] text-stone-800 transition-colors duration-300 selection:bg-gray-200 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top))] dark:bg-[#0f0d0b] dark:text-[#f5ead3] ${lang === 'en' ? "font-['Rajdhani'] font-medium" : "font-sans"}`}
    >
      <GoldenParticles theme={theme} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(217,164,65,0.24),transparent_65%)] opacity-0 transition-opacity duration-300 dark:opacity-100" />
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[60%] rounded-full bg-transparent blur-[100px] pointer-events-none dark:bg-transparent" />
      <div className="absolute top-[20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-transparent blur-[100px] pointer-events-none dark:bg-transparent" />

      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-[#eee7db] bg-white/80 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md transition-colors duration-300 dark:border-[#d9a441]/15 dark:bg-[#0f0d0b]/80">
        <div 
          className="text-lg tracking-wide text-stone-800 dark:text-[#f5ead3]" 
          style={{ fontFamily: lang === 'en' ? "'Rajdhani', 'Rajdhani Medium', sans-serif" : "'Koulen', 'Khmer OS Koulen', sans-serif", fontWeight: lang === 'en' ? 600 : 'normal' }}
        >
          {lang === 'kh' ? 'ទំនាក់ទំនង' : 'CONTACT'}
        </div>
        <div className="flex items-center">
          <div className="flex items-center rounded-full border border-stone-200 bg-white/60 px-1.5 py-1 shadow-sm backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#1a1612]/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <button
              type="button"
              aria-label="Switch to Khmer"
              onClick={() => setLang('kh')}
              className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition-all ${lang === 'kh' ? 'bg-stone-100 text-stone-900 shadow-sm dark:bg-white/10 dark:text-[#f5ead3] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]' : 'text-stone-500 hover:text-stone-900 dark:text-[#a89a80] dark:hover:text-[#f5ead3]'}`}
            >
              KH
            </button>
            <button
              type="button"
              aria-label="Switch to English"
              onClick={() => setLang('en')}
              className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition-all ${lang === 'en' ? 'bg-stone-100 text-stone-900 shadow-sm dark:bg-white/10 dark:text-[#f5ead3] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]' : 'text-stone-500 hover:text-stone-900 dark:text-[#a89a80] dark:hover:text-[#f5ead3]'}`}
            >
              EN
            </button>
            <div className="mx-1 h-3 w-[1px] bg-stone-200 dark:bg-white/10" />
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="rounded-full bg-transparent p-1.5 text-stone-500 transition-colors hover:text-stone-900 dark:text-[#f5ead3] dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto w-full max-w-[420px] px-4 pt-[calc(3.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 flex flex-col items-center text-center"
        >
          {profile?.avatar_url ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 scale-105 rounded-full bg-gradient-to-tr from-gray-200 to-gray-50 blur-md opacity-60 dark:from-[#d9a441]/30 dark:to-[#d9a441]/5" />
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="relative z-10 h-[124px] w-[124px] rounded-full border-[3px] border-[#d9a441] bg-[#1a1612] object-cover shadow-[0_0_0_1px_rgba(217,164,65,0.25)] dark:border-[#d9a441]"
                loading="eager"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 mb-6 flex h-[124px] w-[124px] items-center justify-center rounded-full border-[3px] border-[#d9a441] bg-gradient-to-tr from-gray-200 to-gray-100 shadow-[0_0_0_1px_rgba(217,164,65,0.25)] dark:border-[#d9a441] dark:from-[#d9a441]/20 dark:to-[#d9a441]/5"
            >
              <span className="text-[48px] font-medium text-gray-400 dark:text-[#f5ead3]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </motion.div>
          )}

          <h1
            className="mb-2 w-full max-w-[340px] overflow-hidden whitespace-nowrap px-4 text-[28px] leading-tight tracking-tight text-stone-800 dark:text-[#f5ead3]"
            style={{
              fontFamily: lang === 'en' ? "'Rajdhani', 'Rajdhani Medium', sans-serif" : "'Koulen', 'Khmer OS Koulen', sans-serif",
              fontWeight: lang === 'en' ? 500 : 'normal'
            }}
          >
            {displayName}
          </h1>

          <div className="mb-4 h-[2px] w-[52px] bg-gradient-to-r from-transparent via-[#d9a441] to-transparent" />

          {bio && (
            <p
              className="mx-auto w-full max-w-[340px] px-2 text-[16px] font-medium leading-relaxed text-stone-500 dark:text-[#a89a80]"
              style={{
                fontFamily: lang === 'en' ? "'Rajdhani', 'Rajdhani Medium', sans-serif" : "'Battambang', 'Khmer OS Battambang', sans-serif",
                fontWeight: lang === 'en' ? 500 : 500
              }}
            >
              {bio}
            </p>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className="space-y-4"
        >
          {contactMethods.length === 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex flex-col items-center justify-center rounded-[32px] border border-[#eee7db] bg-white p-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors duration-300 dark:border-[#d9a441]/15 dark:bg-[#201b15]/90 dark:backdrop-blur"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#eee7db] bg-[#f7f4ee] shadow-sm dark:border-[#d9a441]/15 dark:bg-[#d9a441]/12">
                <LinkIcon className="h-7 w-7 text-stone-400 dark:text-[#9a8b6f]" />
              </div>
              <p className="text-[17px] font-medium text-stone-800 dark:text-[#f0e6d2]">
                {lang === 'kh' ? 'មិនទាន់មានវិធីទំនាក់ទំនង' : 'No contact methods yet'}
              </p>
              <p className="mt-1.5 text-[15px] text-stone-400 dark:text-[#9a8b6f]">
                {lang === 'kh' ? 'សូមរង់ចាំការបន្ថែមនៅពេលក្រោយ' : 'Please check back later'}
              </p>
            </motion.div>
          ) : (
            contactMethods.map((method) => {
              const Icon = getIconForType(method.type);
              const actionUrl = getActionUrl(method.type, method.value);
              const description = getMethodDescription(method.type, method.value, lang);
              const brandColor = getColorForType(method.type);
              const localizedLabel = getLocalizedLabel(method.type, method.label, lang);

              return (
                <motion.a
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={method.id}
                  href={actionUrl}
                  target={actionUrl.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openContactLink(method.type, method.value);
                  }}
                  aria-label={`ទាក់ទងតាម ${method.label}`}
                  className="group flex items-center rounded-[24px] border border-[#eee7db] bg-white p-[18px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-[#d9a441]/15 dark:bg-[#1d1712]/90 dark:backdrop-blur dark:hover:bg-[#241f1a]"
                  style={{ '--tw-ring-color': brandColor } as CSSProperties}
                >
                  <div
                    className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] transition-colors duration-300 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                    style={{ backgroundColor: `${brandColor}15` }}
                  >
                    <Icon
                      className="relative z-10 h-[26px] w-[26px] shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: brandColor }}
                    />
                  </div>

                  <div className="ml-[20px] min-w-0 flex-1">
                    <h2
                      className="truncate text-[18px] font-medium text-stone-800 dark:text-[#f2e9d7]"
                      style={{ fontFamily: "'Rajdhani', 'Battambang', 'Khmer OS Battambang', sans-serif" }}
                    >
                      {localizedLabel}
                    </h2>
                    {description && (
                      <p
                        className="mt-0.5 truncate text-[15px] font-medium text-stone-400 dark:text-[#b8a689]"
                        style={{ fontFamily: "'Rajdhani', 'Battambang', 'Khmer OS Battambang', sans-serif" }}
                      >
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center pl-4 text-gray-300 transition-colors duration-300 group-hover:text-gray-900 dark:text-[#9a8b6f] dark:group-hover:text-[#f5ead3]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-gray-100 dark:bg-[#d9a441]/10 dark:group-hover:bg-[#d9a441]/15">
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              );
            })
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-6 mt-12 flex justify-center"
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-200/80 dark:bg-[#d9a441]/20" />
        </motion.div>
      </div>
    </div>
  );
}
