import fs from 'fs';

let content = fs.readFileSync('vite.config.ts', 'utf-8');

content = content.replace(/name: 'វត្តវារីបាការាម\(ស្នាយដួច\)'/g, "name: 'វត្តស្នាយដួច'");
content = content.replace(/short_name: 'វត្តវារីបាការាម'/g, "short_name: 'វត្តស្នាយដួច'");
content = content.replace(/includeAssets: \['favicon\.png', 'pwa-192x192\.png', 'pwa-512x512\.png', 'pwa-512x512-maskable\.png'\]/g, "includeAssets: ['icon.png']");

// Update all src inside icons
content = content.replace(/src: 'pwa-192x192\.png'/g, "src: 'icon.png'");
content = content.replace(/src: 'pwa-512x512\.png'/g, "src: 'icon.png'");
content = content.replace(/src: 'pwa-512x512-maskable\.png'/g, "src: 'icon.png'");

fs.writeFileSync('vite.config.ts', content);
