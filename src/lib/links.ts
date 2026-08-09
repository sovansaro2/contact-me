export function getActionUrl(type: string, value: string): string {
  if (!value) return '#';
  const sanitizedValue = value.trim();
  if (!sanitizedValue) return '#';

  try {
    switch (type.toLowerCase()) {
      case 'phone': {
        const phone = sanitizedValue.replace(/[^\d+]/g, '');
        return phone ? `tel:${phone}` : '#';
      }
      
      case 'email': {
        return `mailto:${sanitizedValue}`;
      }
      
      case 'whatsapp': {
        // Handle full wa.me URLs
        if (sanitizedValue.startsWith('http://wa.me/') || sanitizedValue.startsWith('https://wa.me/')) {
          return sanitizedValue.replace('http://', 'https://');
        }
        if (sanitizedValue.startsWith('http://api.whatsapp.com/') || sanitizedValue.startsWith('https://api.whatsapp.com/')) {
          return sanitizedValue.replace('http://', 'https://');
        }
        
        // Clean to just digits
        const waClean = sanitizedValue.replace(/[^\d]/g, '');
        return waClean ? `https://wa.me/${waClean}` : '#';
      }
      
      case 'telegram': {
        if (sanitizedValue.startsWith('http://t.me/') || sanitizedValue.startsWith('https://t.me/')) {
          return sanitizedValue.replace('http://', 'https://');
        }
        if (sanitizedValue.startsWith('t.me/')) {
          return `https://${sanitizedValue}`;
        }
        let tgUser = sanitizedValue;
        if (tgUser.startsWith('@')) {
          tgUser = tgUser.substring(1);
        }
        return tgUser ? `https://t.me/${tgUser}` : '#';
      }
      
      case 'messenger': {
        if (sanitizedValue.startsWith('http://m.me/') || sanitizedValue.startsWith('https://m.me/')) {
          return sanitizedValue.replace('http://', 'https://');
        }
        if (sanitizedValue.startsWith('m.me/')) {
          return `https://${sanitizedValue}`;
        }
        if (sanitizedValue.startsWith('http://') || sanitizedValue.startsWith('https://')) {
          return sanitizedValue;
        }
        return `https://m.me/${sanitizedValue}`;
      }
      
      case 'facebook': {
        if (sanitizedValue.startsWith('http://') || sanitizedValue.startsWith('https://')) {
          return sanitizedValue.replace('http://', 'https://');
        }
        if (sanitizedValue.includes('facebook.com') || sanitizedValue.includes('fb.com')) {
          return `https://${sanitizedValue}`;
        }
        return `https://www.facebook.com/${sanitizedValue}`;
      }
      
      case 'website':
      default: {
        if (sanitizedValue.startsWith('http://') || sanitizedValue.startsWith('https://')) {
          return sanitizedValue;
        }
        return `https://${sanitizedValue}`;
      }
    }
  } catch (err) {
    console.error('Error generating link:', err);
    return '#';
  }
}
