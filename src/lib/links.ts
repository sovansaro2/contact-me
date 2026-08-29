// --- Shared parsing helpers (reused by getActionUrl and getNativeUrl) ---

function stripAt(value: string): string {
  return value.startsWith('@') ? value.substring(1) : value;
}

function firstUrlPathSegment(value: string): string | null {
  try {
    const url = new URL(value);
    const segment = url.pathname.split('/').filter(Boolean)[0];
    return segment || null;
  } catch {
    return null;
  }
}

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, '');
}

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
        const tgUser = stripAt(sanitizedValue);
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

/**
 * Returns a native-app deep link (e.g. tg://, whatsapp://, fb://) for the given
 * contact method, or null when the type has no native scheme (tiktok, youtube,
 * gmail, email, phone, sms, website, other) or the value cannot be parsed.
 * Reuses the same parsing helpers as getActionUrl.
 */
export function getNativeUrl(type: string, value: string): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  switch (type.toLowerCase()) {
    case 'telegram': {
      let handle: string | null;
      if (/^https?:\/\/t\.me\//i.test(v)) {
        handle = stripAt(v.replace(/^https?:\/\/t\.me\//i, '')) || null;
      } else if (/^t\.me\//i.test(v)) {
        handle = stripAt(v.substring('t.me/'.length)) || null;
      } else if (/^https?:\/\//i.test(v)) {
        return null;
      } else {
        handle = stripAt(v) || null;
      }
      return handle ? `tg://resolve?domain=${handle}` : null;
    }

    case 'whatsapp': {
      const digits = digitsOnly(v);
      return digits ? `whatsapp://send?phone=${digits}` : null;
    }

    case 'messenger': {
      let handle: string | null;
      if (/^https?:\/\/m\.me\//i.test(v)) {
        handle = v.replace(/^https?:\/\/m\.me\//i, '') || null;
      } else if (/^m\.me\//i.test(v)) {
        handle = v.substring('m.me/'.length) || null;
      } else if (/^https?:\/\//i.test(v)) {
        return null;
      } else {
        handle = v || null;
      }
      return handle ? `fb-messenger://user-thread/${handle}` : null;
    }

    case 'facebook': {
      let handle: string | null;
      if (/^https?:\/\//i.test(v)) {
        handle = firstUrlPathSegment(v);
      } else if (/^(www\.)?(facebook|fb)\.com\//i.test(v)) {
        handle = v.split('/').filter(Boolean)[1] || null;
      } else {
        handle = stripAt(v) || null;
      }
      return handle ? `fb://profile/${handle}` : null;
    }

    case 'instagram': {
      let handle: string | null;
      if (/^https?:\/\/(www\.)?instagram\.com\//i.test(v)) {
        handle = firstUrlPathSegment(v);
      } else if (/^(www\.)?instagram\.com\//i.test(v)) {
        handle = v.split('/').filter(Boolean)[1] || null;
      } else if (/^https?:\/\//i.test(v)) {
        return null;
      } else {
        handle = stripAt(v) || null;
      }
      return handle ? `instagram://user?username=${handle}` : null;
    }

    case 'line': {
      let handle: string | null;
      if (/^https?:\/\/line\.me\//i.test(v)) {
        const match = v.match(/@([A-Za-z0-9._-]+)/);
        handle = match ? match[1] : null;
      } else if (/^https?:\/\//i.test(v)) {
        return null;
      } else {
        handle = stripAt(v) || null;
      }
      return handle ? `line://ti/p/@${handle}` : null;
    }

    case 'viber': {
      const digits = digitsOnly(v);
      return digits ? `viber://chat?number=%2B${digits}` : null;
    }

    // tiktok, youtube, gmail, email, phone, sms, website, other → web fallback only
    default:
      return null;
  }
}

/**
 * Opens a contact method: tries the native app deep link first and, if the app
 * is not installed (page still visible shortly after), falls back to the web URL.
 */
export function openContactLink(type: string, value: string): void {
  const webUrl = getActionUrl(type, value);
  try {
    const nativeUrl = getNativeUrl(type, value);
    if (!nativeUrl || webUrl === '#') {
      window.location.href = webUrl;
      return;
    }
    const startedAt = Date.now();
    window.location.href = nativeUrl;
    window.setTimeout(() => {
      if (!document.hidden && Date.now() - startedAt < 2000) {
        window.location.href = webUrl;
      }
    }, 1500);
  } catch {
    window.location.href = webUrl;
  }
}
