import { useEffect, useState } from 'react';
import { ProfileService } from '@/services/profileService';
import { ContactMethodService } from '@/services/contactMethodService';
import type { Profile, ContactMethod } from '@/types/database.types';
import { getActionUrl } from '@/lib/links';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  Mail, 
  Facebook, 
  Globe,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'telegram': return Send;
    case 'messenger': return MessageSquare;
    case 'phone': return Phone;
    case 'whatsapp': return MessageCircle;
    case 'email': return Mail;
    case 'facebook': return Facebook;
    case 'website': return Globe;
    default: return LinkIcon;
  }
};

const getMethodDescription = (type: string, value: string) => {
  switch (type.toLowerCase()) {
    case 'telegram': 
      return value.startsWith('@') || value.startsWith('http') ? value : `@${value}`;
    case 'messenger': 
      return 'ផ្ញើសារមកខ្ញុំ';
    case 'phone': 
      return value;
    case 'whatsapp': 
      return value;
    case 'email': 
      return value;
    case 'facebook': 
      return 'ទស្សនាទំព័រហ្វេសប៊ុក';
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

export default function PublicPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const p = await ProfileService.getPublicProfile();
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
      setError('មិនអាចផ្ទុកព័ត៌មានទំនាក់ទំនងបានទេ'); // Cannot load contact information
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
          <div className="w-[112px] h-[112px] bg-gray-200 rounded-full mb-5 border-[4px] border-white shadow-sm"></div>
          <div className="w-48 h-7 bg-gray-200 rounded-md mb-3"></div>
          <div className="w-64 h-5 bg-gray-200 rounded-md mb-10"></div>
          
          <div className="w-full space-y-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-[88px] bg-white rounded-3xl border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 flex flex-col items-center max-w-sm text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mb-5" />
          <p className="text-gray-800 text-[17px] font-medium mb-8">{error}</p>
          <button 
            onClick={loadData}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-95"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || 'ទំនាក់ទំនងមកខ្ញុំ';
  const bio = profile?.bio;

  // Theme support for future Phase 5
  const theme = profile?.theme_settings as Record<string, string> | null;
  const bgColor = theme?.backgroundColor || '#F9FAFB'; // gray-50 equivalent
  const cardColor = theme?.cardColor || '#FFFFFF';
  const primaryColor = theme?.primaryColor || '#111827'; // gray-900
  const textColor = theme?.textColor || '#111827';

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 transition-colors duration-300 font-sans selection:bg-gray-200 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top))]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-[420px] mx-auto pb-12">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-10 text-center animate-fade-in-up motion-reduce:animate-none">
          {profile?.avatar_url ? (
            <div className="relative mb-5">
              <img 
                src={profile.avatar_url} 
                alt={displayName}
                className="w-[112px] h-[112px] rounded-full object-cover shadow-sm border-[4px] border-white bg-white"
                loading="eager"
              />
            </div>
          ) : (
            <div className="w-[112px] h-[112px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 shadow-sm border-[4px] border-white mb-5 flex items-center justify-center">
              <span className="text-[40px] font-medium text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <h1 
            className="text-[26px] font-bold tracking-tight mb-2.5 px-4 leading-tight"
            style={{ color: textColor }}
          >
            {displayName}
          </h1>
          
          {bio && (
            <p className="text-gray-600 text-[15px] max-w-[320px] mx-auto leading-relaxed px-4">
              {bio}
            </p>
          )}
        </div>

        {/* Contact Methods Section */}
        <div className="space-y-3.5 animate-fade-in-up delay-150 motion-reduce:animate-none motion-reduce:transition-none">
          {contactMethods.length === 0 ? (
            <div 
              className="p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center"
              style={{ backgroundColor: cardColor }}
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-[16px] font-medium">មិនទាន់មានវិធីទំនាក់ទំនង</p>
              <p className="text-gray-400 text-[14px] mt-1.5">សូមរង់ចាំការបន្ថែមនៅពេលក្រោយ</p>
            </div>
          ) : (
            contactMethods.map((method) => {
              const Icon = getIconForType(method.type);
              const actionUrl = getActionUrl(method.type, method.value);
              const description = getMethodDescription(method.type, method.value);
              
              return (
                <a
                  key={method.id}
                  href={actionUrl}
                  target={actionUrl.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={`ទាក់ទងតាម ${method.label}`}
                  className="flex items-center p-[18px] rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 active:scale-[0.97] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  style={{ backgroundColor: cardColor }}
                >
                  <div className="relative w-[52px] h-[52px] flex items-center justify-center rounded-[20px] bg-gray-50 text-gray-600 overflow-hidden shrink-0">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                    <Icon className="w-[24px] h-[24px] relative z-10 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <div className="ml-[18px] flex-1 min-w-0">
                    <h2 className="text-[17px] font-semibold text-gray-900 truncate">
                      {method.label}
                    </h2>
                    {description && (
                      <p className="text-[14px] text-gray-500 truncate mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>
                  
                  <div className="pl-3 text-gray-300 group-hover:text-gray-400 transition-colors">
                    <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
