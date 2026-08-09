import React from 'react';
import { 
  SiTelegram, 
  SiMessenger, 
  SiFacebook, 
  SiWhatsapp, 
  SiInstagram, 
  SiTiktok, 
  SiYoutube, 
  SiLine, 
  SiViber, 
  SiGmail 
} from 'react-icons/si';
import { 
  MdEmail, 
  MdPhone, 
  MdSms, 
  MdLanguage 
} from 'react-icons/md';
import { Link } from 'lucide-react';
import { IconType } from 'react-icons';

export type ContactMethodType = 
  | 'telegram'
  | 'messenger'
  | 'facebook'
  | 'whatsapp'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'line'
  | 'viber'
  | 'gmail'
  | 'email'
  | 'phone'
  | 'sms'
  | 'website'
  | 'other';

export interface IconDefinition {
  type: ContactMethodType;
  label: string;
  icon: IconType | any; // 'any' for lucide-react compat
  color: string;
}

export const contactMethodTypes: IconDefinition[] = [
  { type: 'telegram', label: 'Telegram', icon: SiTelegram, color: '#26A5E4' },
  { type: 'messenger', label: 'Messenger', icon: SiMessenger, color: '#00B2FF' },
  { type: 'facebook', label: 'Facebook', icon: SiFacebook, color: '#1877F2' },
  { type: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp, color: '#25D366' },
  { type: 'instagram', label: 'Instagram', icon: SiInstagram, color: '#E4405F' },
  { type: 'tiktok', label: 'TikTok', icon: SiTiktok, color: '#000000' },
  { type: 'youtube', label: 'YouTube', icon: SiYoutube, color: '#FF0000' },
  { type: 'line', label: 'LINE', icon: SiLine, color: '#00C300' },
  { type: 'viber', label: 'Viber', icon: SiViber, color: '#7360F2' },
  { type: 'gmail', label: 'Gmail', icon: SiGmail, color: '#EA4335' },
  { type: 'email', label: 'Email', icon: MdEmail, color: '#5F6368' },
  { type: 'phone', label: 'Phone', icon: MdPhone, color: '#34A853' },
  { type: 'sms', label: 'SMS', icon: MdSms, color: '#FABB05' },
  { type: 'website', label: 'Website', icon: MdLanguage, color: '#4285F4' },
];

export const getIconForType = (type: string | null) => {
  if (!type) return Link;
  const normalizedType = type.toLowerCase();
  const definition = contactMethodTypes.find(def => def.type === normalizedType);
  
  if (definition) {
    return definition.icon;
  }
  
  return Link;
};

export const getColorForType = (type: string | null): string => {
  if (!type) return '#6b7280'; // gray-500
  const normalizedType = type.toLowerCase();
  const definition = contactMethodTypes.find(def => def.type === normalizedType);
  
  if (definition) {
    return definition.color;
  }
  
  return '#6b7280';
};
