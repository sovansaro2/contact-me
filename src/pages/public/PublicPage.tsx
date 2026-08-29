import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '@/services/profileService';
import { ContactMethodService } from '@/services/contactMethodService';
import type { Profile, ContactMethod } from '@/types/database.types';
import { getActionUrl } from '@/lib/links';
import { getIconForType, getColorForType } from '@/lib/iconMapping';
import { 
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

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

  const displayName = profile?.display_name || (lang === 'kh' ? 'ទំនាក់ទំនងមកខ្ញុំ' : 'Contact Me');
  const bio = profile?.bio;

  return (
    <div className={`min-h-screen relative overflow-hidden bg-slate-50 selection:bg-gray-200 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top))] ${lang === 'en' ? "font-['Rajdhani'] font-medium" : "font-sans"}`}>
      {/* Decorative App-like Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-amber-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] mx-auto px-4 relative z-10">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-10 text-center relative"
        >
          {/* Language Switcher */}
          <div className="absolute top-0 right-2 flex items-center bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-gray-100/50 p-1 z-20">
             <button 
               onClick={() => setLang('kh')}
               className={`px-3 py-1.5 rounded-full text-[13px] font-bold transition-all ${lang === 'kh' ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
             >
               KH
             </button>
             <button 
               onClick={() => setLang('en')}
               className={`px-3 py-1.5 rounded-full text-[13px] font-bold transition-all font-['Rajdhani'] ${lang === 'en' ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
             >
               EN
             </button>
          </div>

          {profile?.avatar_url ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 rounded-full scale-105 blur-md opacity-60"></div>
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-[124px] h-[124px] rounded-full object-cover shadow-sm border-[4px] border-white bg-white relative z-10"
                loading="eager"
              />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-[124px] h-[124px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 shadow-sm border-[4px] border-white mb-6 flex items-center justify-center relative z-10"
            >
              <span className="text-[48px] font-medium text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </motion.div>
          )}
          
          <h1 
            className="text-[28px] font-bold tracking-tight text-gray-900 mb-2 px-4 leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-[340px]"
            style={{ fontFamily: "'Koulen', 'Khmer OS Koulen', sans-serif", fontWeight: 'normal' }}
          >
            {displayName}
          </h1>
          
          {bio && (
            <p 
              className="text-gray-600 text-[16px] max-w-[340px] w-full mx-auto leading-relaxed px-2 font-medium"
              style={{ fontFamily: "'Battambang', 'Khmer OS Battambang', sans-serif" }}
            >
              {bio}
            </p>
          )}
        </motion.div>

        {/* Contact Methods Section */}
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
              className="p-10 rounded-[32px] bg-white/60 backdrop-blur-xl shadow-sm border border-gray-100/50 text-center flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-50">
                <LinkIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-600 text-[17px] font-medium">
                {lang === 'kh' ? 'មិនទាន់មានវិធីទំនាក់ទំនង' : 'No contact methods yet'}
              </p>
              <p className="text-gray-400 text-[15px] mt-1.5">
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
                  aria-label={`ទាក់ទងតាម ${method.label}`}
                  className="flex items-center p-[20px] rounded-[28px] bg-white/80 backdrop-blur-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 hover:shadow-md hover:bg-white transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                >
                  <div 
                    className="relative w-[56px] h-[56px] flex items-center justify-center rounded-[20px] transition-colors duration-300 overflow-hidden shrink-0"
                    style={{ backgroundColor: `${brandColor}15` }}
                  >
                    <Icon 
                      className="w-[28px] h-[28px] relative z-10 transition-transform duration-300 group-hover:scale-110" 
                      style={{ color: brandColor }}
                    />
                  </div>
                  
                  <div className="ml-[20px] flex-1 min-w-0">
                    <h2 
                      className="text-[18px] font-medium text-gray-900 truncate"
                      style={{ fontFamily: "'Rajdhani', 'Battambang', 'Khmer OS Battambang', sans-serif" }}
                    >
                      {localizedLabel}
                    </h2>
                    {description && (
                      <p 
                        className="text-[15px] text-gray-500 truncate mt-0.5 font-medium"
                        style={{ fontFamily: "'Rajdhani', 'Battambang', 'Khmer OS Battambang', sans-serif" }}
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  
                  <div className="pl-4 text-gray-300 group-hover:text-gray-900 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              );
            })
          )}
        </motion.div>
        
        {/* Footer App-like indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 mb-6 flex justify-center"
        >
          <div className="w-12 h-1.5 bg-gray-200/80 rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
}
