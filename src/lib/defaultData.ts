import type { Profile, ContactMethod } from '@/types/database.types';

export const DEFAULT_USER_ID = 'ec180dc7-bf05-4cb2-820e-2acaeab98040';

export const DEFAULT_PROFILE: Profile = {
  id: DEFAULT_USER_ID,
  display_name: 'ភិក្ខុ សុវណ្ណសរោ រីម រ៉ាវី',
  display_name_en: 'SUVAṆṆASARO RIM RAVI',
  bio: 'សូមទាក់ទងព្រះចៅអធិការវត្តតាមរយៈវិធីសាស្ត្រខាងក្រោម។',
  bio_en: 'Contact the Venerable Abbot through the options below.',
  avatar_url: '/default-avatar.jpg',
  cover_url: null,
  theme_settings: null,
  created_at: '2026-08-29T17:18:00.000Z',
  updated_at: '2026-09-02T19:59:00.000Z'
};

export const DEFAULT_CONTACT_METHODS: ContactMethod[] = [
  {
    id: 'f38704c5-76c6-4ea0-a782-1e9f74916e15',
    profile_id: DEFAULT_USER_ID,
    type: 'phone',
    label: 'Call',
    value: '016759264',
    icon: null,
    enabled: true,
    sort_order: 0,
    created_at: '2026-08-29T17:19:04.403Z',
    updated_at: '2026-08-29T17:42:29.699Z'
  },
  {
    id: '1cee4dcf-ae73-45c2-b188-0ab7b5f48765',
    profile_id: DEFAULT_USER_ID,
    type: 'telegram',
    label: 'Telegram',
    value: '@sovansaro',
    icon: null,
    enabled: true,
    sort_order: 1,
    created_at: '2026-08-29T17:19:14.116Z',
    updated_at: '2026-08-29T17:19:14.116Z'
  },
  {
    id: 'e09e6ccc-bc36-43ee-83e2-5164ae2f18d7',
    profile_id: DEFAULT_USER_ID,
    type: 'facebook',
    label: 'Facebook',
    value: 'https://facebook.com/sovansaro.v',
    icon: null,
    enabled: true,
    sort_order: 2,
    created_at: '2026-08-29T17:19:37.157Z',
    updated_at: '2026-08-29T17:19:37.157Z'
  },
  {
    id: '2d305f02-ee6b-4732-82c6-44dc4f928964',
    profile_id: DEFAULT_USER_ID,
    type: 'messenger',
    label: 'Messenger',
    value: '@sovansaro',
    icon: null,
    enabled: true,
    sort_order: 3,
    created_at: '2026-08-29T17:19:49.210Z',
    updated_at: '2026-09-02T19:59:18.920Z'
  },
  {
    id: '79ecfe71-063b-4906-8316-d2c32c80c2fe',
    profile_id: DEFAULT_USER_ID,
    type: 'whatsapp',
    label: 'WhatsApp',
    value: '+855 16759264',
    icon: null,
    enabled: true,
    sort_order: 4,
    created_at: '2026-08-29T17:19:58.321Z',
    updated_at: '2026-08-29T20:32:40.243Z'
  },
  {
    id: 'f1b0cfd0-0cc0-4870-af61-b87fde956c91',
    profile_id: DEFAULT_USER_ID,
    type: 'email',
    label: 'អ៊ីមែល',
    value: 'sovansarorimravii@gmail.com',
    icon: null,
    enabled: true,
    sort_order: 5,
    created_at: '2026-08-29T17:20:21.138Z',
    updated_at: '2026-08-29T17:20:21.138Z'
  }
];
